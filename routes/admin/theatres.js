const express = require('express');
const axios = require('axios');
const router = express.Router();
const Theatre = require('../../models/theatres');
const Movie = require('../../models/movie');
router.use(express.json());
const Showtime = require('../../models/showtime')
const moment = require('moment');

function formatDate(dateStr) {
    // If the input is like "4-Aug", add the current year
    const currentYear = new Date().getFullYear();
    const fullDateStr = `${dateStr}-${currentYear}`;
    const date = new Date(fullDateStr);
    return date.toISOString().slice(0, 10); // Returns in "YYYY-MM-DD"
}


function formatTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); // e.g., 2:56 PM
}

router.get('/user/movies', async (req, res) => {
    try {
        const location = req.query.q;
        const matchingtheatres = await Theatre.find({ city: location });
        const now = new Date();
        const validTmdbIds = new Set();
        matchingtheatres.forEach(theatre => {
            theatre.showtimes.forEach(time => {
                const dateTimeStr = `${theatre.date} ${time}`;
                const fullDateTime = moment(dateTimeStr, 'D-MMM HH:mm').toDate();

                if (fullDateTime > now) {
                    validTmdbIds.add(theatre.tmdbid);
                }
            });
        });
        const movies = await Movie.find({ tmdbid: { $in: Array.from(validTmdbIds) } });
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

        const validTmdbIds = new Set();

        theatres.forEach(theatre => {
            theatre.showtimes.forEach(time => {
                const dateTimeStr = `${theatre.date} ${time}`;
                const fullDateTime = moment(dateTimeStr, 'D-MMM HH:mm').toDate();

                if (fullDateTime > now) {
                    validTmdbIds.add(theatre.tmdbid);
                }
            });
        });

        const movies = await Movie.find({ tmdbid: { $in: Array.from(validTmdbIds) } });
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const deleted = await Theatre.deleteMany({ tmdbid: id });
    res.json({ message: 'Deleted successfully' });
})


router.post('/:id', async (req, res) => {
    const tmdbid = parseInt(req.params.id);
    const sentdata = req.body.data;

    try {
        const theatreInserts = [];
        const validSeatKeys = new Set();
        for (const [city, datesObj] of Object.entries(sentdata)) {
            for (const [date, languagesObj] of Object.entries(datesObj)) {
                for (const [language, formatsObj] of Object.entries(languagesObj)) {
                    for (const [format, theatresArr] of Object.entries(formatsObj)) {

                        // 👇 Step 1: Fetch existing showtimes from DB for this specific combo
                        const existingShowtimes = await Theatre.find({ tmdbid, city, date, language, format });

                        // Step 2: Build a map of new entries (from client)
                        const newTheatreMap = new Map();
                        for (const theatre of theatresArr) {
                            newTheatreMap.set(`${theatre.name}|${theatre.location}`, theatre.showtimes);
                        }

                        // Step 3: Delete theatres that no longer exist in the new data
                        for (const existing of existingShowtimes) {
                            const key = `${existing.name}|${existing.location}`;
                            if (!newTheatreMap.has(key)) {
                                await Theatre.deleteOne({
                                    tmdbid,
                                    city,
                                    date,
                                    language,
                                    format,
                                    name: existing.name,
                                    location: existing.location
                                });
                            }
                        }

                        // Step 4: Upsert new or updated theatres
                        for (const theatre of theatresArr) {
                            await Theatre.updateOne(
                                {
                                    tmdbid,
                                    city,
                                    date,
                                    language: language.trim(),
                                    format,
                                    name: theatre.name,
                                    location: theatre.location
                                },
                                {
                                    $set: {
                                        showtimes: theatre.showtimes
                                    }
                                },
                                { upsert: true }
                            );

                            // Update valid seat key for this showtime
                            for (const showtime of theatre.showtimes) {
                                const key = `${tmdbid}|${formatDate(date)}|${formatTime(showtime)}|${theatre.name.trim()}|${language.trim()}|${format.trim()}`;
                                validSeatKeys.add(key);
                            }
                        }
                    }
                }
            }
        }
        await Promise.all(theatreInserts);
        const allExistingSeats = await Showtime.find({ tmdbid });

        const toDelete = [];

        for (const seat of allExistingSeats) {
            const seatKey = `${seat.tmdbid}|${seat.date.toISOString().slice(0, 10)}|${seat.time}|${seat.theatre}|${seat.language}|${seat.format}`;
            if (!validSeatKeys.has(seatKey)) {
                toDelete.push(seat._id);
            }
        }

        if (toDelete.length > 0) {
            await Showtime.deleteMany({ _id: { $in: toDelete } });
        }

        return res.json({ message: "Movie details and showtimes updated successfully." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error saving movie details." });
    }
});


router.get('/', async (req, res) => {
    const { tmdbid, date, language, format, city } = req.query;

    try {
        const showtimes = await Theatre.find({
            tmdbid: parseInt(tmdbid),
            date,
            language: language.trim(),
            format,
            city
        });
        console.log(showtimes);

        res.json(showtimes);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to fetch showtimes" });
    }
});
module.exports = router;