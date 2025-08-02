const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const tmdb = require('../admin/tmdb');
const axios = require('axios');
const Theatre = require('../../models/theatres');

router.get('/', async (req, res) => {
    const query = req.query.q;
    if (!query)
        return res.status(400).json({ error: 'Missing Query' });

    try {
        const tmdbIdDocs = await Theatre.distinct('tmdbid');
        console.log(tmdbIdDocs);
        const matchingids = [];

        const promises = tmdbIdDocs.map(async (tmdbid) => {
            try {
                const tmdbRes = await tmdb.getmoviebyid(tmdbid);

                const title = tmdbRes.title;
                if (title.toLowerCase().includes(query.toLowerCase())) {
                    matchingids.push({
                        tmdbid
                    });
                }
            } catch (err) {

            }
        });

        await Promise.all(promises);
        const sendingdata = [];
        for (const { tmdbid } of matchingids) {
            const movie = await Movie.findOne({ tmdbid });
            if (movie) sendingdata.push(movie);
        }
        res.json(sendingdata);
    } catch (err) {
        console.error('Error searching movies:', err);
        res.status(500).json({ message: 'Internal server error' });
    }

})
module.exports = router;