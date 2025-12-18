const express = require('express');
const router = express.Router();
const omdbAxios = require('../../config/omdb');

async function getmoviebyid(id) {
    try {
        const res = await omdbAxios.get('/', {
            params: { i: id, plot: 'full' }
        });
        
        if (res.data.Response === "False") throw new Error(res.data.Error);
        return res.data;
    }
    catch (err) {
        console.error('Error in getmoviebyid (OMDB):', err.message);
        throw err;
    }
}

async function getcertification(id) {
    const movie = await getmoviebyid(id);
    return [{ certification: movie.Rated || 'N/A' }]; 
}
async function getmoviecredits(id) {
    const movie = await getmoviebyid(id);
    return {
        data: {
            cast: movie.Actors ? movie.Actors.split(', ').map(name => ({ name, character: 'N/A' })) : [],
            crew: [{ name: movie.Director, job: 'Director' }]
        }
    };
}


router.get('/search', async (req, res) => {
    const query = req.query.q?.trim();
    if (!query) return res.status(400).json({ error: 'Missing Query' });

    try {
        const fetched = await omdbAxios.get('/', { params: { s: query } });

        if (fetched.data.Response === "False") return res.json([]);

        const moviearray = fetched.data.Search.map(m => ({
            id: m.imdbID,
            title: m.Title,
            poster: m.Poster,
            year: m.Year
        }));

        res.json(moviearray);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

router.get('/popular', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const fetched = await omdbAxios.get('/', {
            params: { s: currentYear, type: 'movie' }
        });

        if (fetched.data.Response === "False") return res.json([]);

        const moviearray = fetched.data.Search.map(m => ({
            id: m.imdbID,
            title: m.Title,
            poster: m.Poster
        }));

        res.json(moviearray);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch movies" });
    }
});

module.exports = router; 

router.getmoviebyid = getmoviebyid;
router.getcertification = getcertification;
router.getmoviecredits = getmoviecredits;