const express = require('express');
const router = express.Router();
const Theatre = require('../../models/theatres');
const Movie = require('../../models/movie');
const Showtime = require('../../models/showtime');
const moment = require('moment');

router.use(express.json());

function toUTCDateString(dateStr) {
    const currentYear = new Date().getFullYear();
    const [day, month] = dateStr.split('-');
    const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth();
    const utcDate = new Date(Date.UTC(currentYear, monthIndex, parseInt(day), 0, 0, 0, 0));
    return utcDate.toISOString().slice(0, 10);
}

function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

router.get('/user/movies', async (req, res) => {
    try {
        const location = req.query.q;
        const matchingtheatres = await Theatre.find({ city: location });
        const now = new Date();
        const validOmdbIds = new Set();

        matchingtheatres.forEach(theatre => {
            theatre.showtimes.forEach(time => {
                const dateTimeStr = `${theatre.date} ${time}`;
                const fullDateTime = moment(dateTimeStr, 'D-MMM HH:mm').toDate();

                if (fullDateTime > now) {
                    validOmdbIds.add(theatre.omdbid); 
                }
            });
        });

        const movies = await Movie.find({ omdbid: { $in: Array.from(validOmdbIds) } });
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/movies', async (req, res) => {
    try {
        const theatres = await Theatre.find();
        const now = new Date();
        const validOmdbIds = new Set();

        theatres.forEach(theatre => {
            theatre.showtimes.forEach(time => {
                const dateTimeStr = `${theatre.date} ${time}`;
                const fullDateTime = moment(dateTimeStr, 'D-MMM HH:mm').toDate();

                if (fullDateTime > now) {
                    validOmdbIds.add(theatre.omdbid); 
                }
            });
        });

        const movies = await Movie.find({ omdbid: { $in: Array.from(validOmdbIds) } });
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/cleanup/:id', async (req, res) => {
    try {
        const movieID = req.params.id;
        await TheatreMovie.deleteOne({ omdbid: movieID }); 
        res.status(200).json({ message: "Expired movie removed from database" });
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params; 
    await Theatre.deleteMany({ omdbid: id }); 
    res.json({ message: 'Deleted successfully' });
});

router.post('/:id', async (req, res) => {
    const omdbid = req.params.id; 
    const sentdata = req.body.data;

    try {
        const validSeatKeys = new Set();
        for (const [city, datesObj] of Object.entries(sentdata)) {
            for (const [date, languagesObj] of Object.entries(datesObj)) {
                for (const [language, formatsObj] of Object.entries(languagesObj)) {
                    for (const [format, theatresArr] of Object.entries(formatsObj)) {

                        const existingShowtimes = await Theatre.find({ omdbid, city, date, language, format });
                        const newTheatreMap = new Map();
                        for (const theatre of theatresArr) {
                            newTheatreMap.set(`${theatre.name}|${theatre.location}`, theatre.showtimes);
                        }

                        for (const existing of existingShowtimes) {
                            const key = `${existing.name}|${existing.location}`;
                            if (!newTheatreMap.has(key)) {
                                await Theatre.deleteOne({
                                    omdbid, city, date, language, format,
                                    name: existing.name, location: existing.location
                                });
                            }
                        }

                        for (const theatre of theatresArr) {
                            await Theatre.updateOne(
                                {
                                    omdbid, city, date,
                                    language: language.trim(),
                                    format,
                                    name: theatre.name,
                                    location: theatre.location
                                },
                                { $set: { showtimes: theatre.showtimes } },
                                { upsert: true }
                            );

                            for (const showtime of theatre.showtimes) {
                                const key = `${omdbid}|${toUTCDateString(date)}|${formatTime(showtime)}|${theatre.name.trim()}|${language.trim()}|${format.trim()}`;
                                validSeatKeys.add(key);
                            }
                        }
                    }
                }
            }
        }

        const allExistingSeats = await Showtime.find({ omdbid });
        const toDelete = [];

        for (const seat of allExistingSeats) {
            const seatKey = `${seat.omdbid}|${seat.date.toISOString().slice(0, 10)}|${seat.time}|${seat.theatre}|${seat.language}|${seat.format}`;
            if (!validSeatKeys.has(seatKey)) {
                toDelete.push(seat._id);
            }
        }

        if (toDelete.length > 0) {
            await Showtime.deleteMany({ _id: { $in: toDelete } });
        }

        return res.json({ message: "Showtimes updated successfully." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error saving theatre details." });
    }
});

router.get('/', async (req, res) => {
    const { omdbid, date, language, format, city } = req.query;
    console.log(omdbid,date,language,format,city);

    try {
        const theatres = await Theatre.find({
            omdbid: omdbid, 
            date: date, 
            language: language?.trim(),
            format: format,
            city: city
        });

        if (!theatres || theatres.length === 0) {
            return res.json([]);
        }

        res.json(theatres);
    } catch (err) {
        console.error("Error fetching theatres:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;