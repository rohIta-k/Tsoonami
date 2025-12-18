const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const Theatre = require('../../models/theatres');

router.get('/', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Missing Query' });

    try {
        const omdbIdsInTheatres = await Theatre.distinct('omdbid');

        const movies = await Movie.find({
            omdbid: { $in: omdbIdsInTheatres },
            title: { $regex: query, $options: 'i' } 
        }).lean();

        res.json(movies);
    } catch (err) {
        console.error('Error searching movies:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;