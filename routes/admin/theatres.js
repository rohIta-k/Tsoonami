const express = require('express');
const axios = require('axios');
const router = express.Router();
const Theatre = require('../../models/theatres');
const Movie = require('../../models/movie');
router.use(express.json());
const Showtime = require('../../models/showtime');

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
        const matchingTheatres = await Theatre.find({ city: location });
        const uniqueTmdbIds = [...new Set(matchingTheatres.map(t => t.tmdbid))];
        const movies = await Movie.find({ tmdbid: { $in: uniqueTmdbIds } });
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/movies', async (req, res) => {
    try {
        const uniqueTmdbIds = await Theatre.distinct('tmdbid');
        const movies = await Movie.find({ tmdbid: { $in: uniqueTmdbIds } });
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

                        await Theatre.deleteMany({ tmdbid, city, date, language, format });

                        for (const theatre of theatresArr) {
                            theatreInserts.push(
                                Theatre.create({
                                    tmdbid,
                                    city,
                                    date,
                                    language: language.trim(),
                                    format,
                                    name: theatre.name,
                                    location: theatre.location,
                                    showtimes: theatre.showtimes
                                })
                            );


                            for (const showtime of theatre.showtimes) {
                                const key = `${tmdbid}|${formatDate(date)}|${formatTime(showtime)}|${theatre.name.trim()}|${language.trim()}|${format.trim()}`;
                                console.log(key);
                                validSeatKeys.add(key);
                                console.log(key);
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
            console.log(seatKey);
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