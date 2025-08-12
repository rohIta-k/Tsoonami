const express = require('express');
const axios = require('axios');
const router = express.Router();
const tmdb = require('../../config/tmdb');

async function getmovievideos(id, code) {
    try {
        const response = await tmdb.get(`/movie/${id}/videos`, {
            params: {
                language: code 
            }
        });

        return response.data.results
            .filter(video =>
                video.site === 'YouTube' &&
                video.type === 'Trailer'
            )
            .sort((a, b) => {
                if (a.official && !b.official) return -1;
                if (!a.official && b.official) return 1;
                return 0;
            });
    } catch (err) {
        console.error(`Error fetching videos for movie ${id} (${code}):`, err.message);
        return [];
    }
}


async function getcertification(id) {
    const res = await tmdb.get(`/movie/${id}/release_dates`);
    const indiaones = res.data.results.find(m => m.iso_3166_1 === 'IN');
    return indiaones?.release_dates || [];
}

async function getmoviebyid(id) {
    try {
        const res = await tmdb.get(`/movie/${id}`);
        console.log('Fetched movie:', res.data);
        return res.data;
    }
    catch (err) {
        console.error('Error in getmoviebyid:', err.response?.status, err.response?.data || err.message);
        throw err;
    }
}

async function getmoviecredits(id) {
    const res = await tmdb.get(`/movie/${id}/credits`);
    return res;
}

function isrecentmovie(releasedate, daylimit = 60, upcominglimit = 14) {
    if (!releasedate)
        return false;
    const today = new Date();
    const release = new Date(releasedate);
    const diff = (today - release) / (1000 * 60 * 60 * 24);
    if ((diff >= 0 && diff <= daylimit) || (diff < 0 && Math.abs(diff) <= upcominglimit))
        return true;
    else
        return false;
}

function filterduplicate(oldarr) {
    const movieMap = new Map();
    oldarr.forEach(movie => {
        if (!movieMap.has(movie.id)) {
            movieMap.set(movie.id, movie);
        }
    });
    return Array.from(movieMap.values());
}

router.get('/search', async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    if (!query)
        return res.status(400).json({ error: 'Missing Query' });
    try {
        const fetched = await tmdb.get('/search/movie', {
            params: {
                query,
                region: 'IN'
            }
        });
        const moviearray = fetched.data.results;
        const recentmovies = moviearray.filter(m => isrecentmovie(m.release_date));
        const filtered = filterduplicate(recentmovies);
        res.json(filtered);
    }
    catch (err) {
        console.log(err);
        console.log("Error:", err.response?.status, err.response?.data);
    }
})

router.get('/popular', async (req, res) => {
    try {
        const fetched = await tmdb.get('/discover/movie', {
            params: {
                region: 'IN',
                sort_by: 'popularity.desc'
            },
        });
        const moviearray = fetched.data.results;
        const recentmovies = moviearray.filter(m => isrecentmovie(m.release_date));
        const filtered = filterduplicate(recentmovies);
        res.json(filtered);
    }
    catch (err) {
        if (err.response) {
            console.log("TMDB Response Error:", err.response.status, err.response.data);
        } else if (err.request) {
            console.log("TMDB No Response:", err.message);
        } else {
            console.log("TMDB Other Error:", err.message);
        }

        res.status(500).json({ error: "Failed to fetch popular movies" });
    }
});

module.exports = { router, getmoviebyid, getcertification, getmoviecredits,getmovievideos };
