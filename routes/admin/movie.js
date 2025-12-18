const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const omdb = require('./omdb'); 
const Theatre = require('../../models/theatres');
const moment = require('moment');

function getmoviestatus(releasedate) {
    if (!releasedate || releasedate === 'N/A') return 'nowshowing';
    const today = new Date();
    const release = new Date(releasedate);
    return (today - release) / (1000 * 60 * 60 * 24) >= 0 ? 'nowshowing' : 'upcoming';
}

router.get('/genres/:location', async (req, res) => {
    try {
        let { genres, languages } = req.query;
        const location = req.params.location;

        const query = {};
        if (genres) query.genres = { $in: Array.isArray(genres) ? genres : [genres] };
        if (languages) query.languages = { $in: Array.isArray(languages) ? languages : [languages] };

        const matchingMovies = await Movie.find(query);
        const allTheatres = await Theatre.find({ city: new RegExp(`^${location.trim()}$`, 'i') });
        
        const now = new Date();
        const validOmdbIds = new Set();

        allTheatres.forEach(theatre => {
            theatre.showtimes.forEach(time => {
                const dateTimeStr = `${theatre.date} ${time}`;
                const fullDateTime = moment(dateTimeStr, 'D-MMM HH:mm').toDate();
                if (fullDateTime > now) {
                    validOmdbIds.add(theatre.omdbid);
                }
            });
        });

        const filteredMovies = matchingMovies.filter(movie => validOmdbIds.has(movie.omdbid));
        res.json(filteredMovies);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        let moviedb = await Movie.findOne({ omdbid: id });

        if (!moviedb) {
            console.log(`Movie ${id} not found in DB. Fetching from OMDB...`);
            const movie = await omdb.getmoviebyid(id);
            const certification = await omdb.getcertification(id);
            const credits = await omdb.getmoviecredits(id);

            let runtimeStr = movie.Runtime || "0 min";
            let totalMinutes = parseInt(runtimeStr);
            let hours = Math.floor(totalMinutes / 60);
            let minutes = totalMinutes % 60;

            moviedb = new Movie({
                omdbid: movie.imdbID,
                title: movie.Title,
                poster: movie.Poster !== 'N/A' ? movie.Poster : '/assets/no-poster.png',
                plot: movie.Plot,
                genres: movie.Genre ? movie.Genre.split(', ') : [],
                imdb: `${movie.imdbRating}/10`,
                age: certification[0]?.certification || 'NR',
                duration: `${hours}h ${minutes}m`,
                languages: movie.Language ? movie.Language.split(', ') : [],
                cast: credits.data.cast,
                director: movie.Director,
                writers: movie.Writer !== 'N/A' ? movie.Writer.split(', ') : [],
                trailers: [],
                status: getmoviestatus(movie.Released),
                releasedate: movie.Released !== 'N/A' ? new Date(movie.Released) : new Date()
            });

            await moviedb.save();
        }

        res.render('admin/adminmoviedetails', { movie: moviedb });

    } catch (err) {
        console.error('Movie Controller Error:', err.message);
        res.status(500).send('Error loading movie details');
    }
});

module.exports = router;