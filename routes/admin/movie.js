const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const languages = require('../../config/languages');
const tmdb = require('../admin/tmdb');
const axios = require('axios');
const youtube = require('../../config/youtube');
const Theatre = require('../../models/theatres');
const moment = require('moment');

async function gettrailers(title, language) {

    const query = `${title} official trailer ${language}`;
    const response = await youtube.get('/search', {
        params: {
            q: query,
            maxResults: 1
        }
    });
    const item = response.data.items?.[0];
    if (!item || !item.id?.videoId || !item.snippet) return null;

    return {
        language,
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url
    };
};

function getmoviestatus(releasedate) {
    const today = new Date();
    const release = new Date(releasedate);
    const diff = (today - release) / (1000 * 60 * 60 * 24);
    if (diff >= 0) {
        return 'nowshowing';
    }
    else {
        return 'upcoming';
    }
}
router.get('/genres/:location', async (req, res) => {
    try {
        let { genres, languages } = req.query;
        const location = req.params.location;
        if (!genres) genres = [];
        else if (!Array.isArray(genres)) genres = [genres];

        if (!languages) languages = [];
        else if (!Array.isArray(languages)) languages = [languages];

        console.log("Genres:", genres);
        console.log("Languages:", languages);

        // Step 1: Query by genres/languages
        const query = {};
        if (genres.length > 0) {
            query.genres = { $in: genres };
        }
        if (languages.length > 0) {
            query.languages = { $in: languages };
        }

        const matchingMovies = await Movie.find(query);
        console.log("Matching movies before theatre filter:", matchingMovies.length);

        // Step 2: Filter by theatre showtimes
        const allTheatres = await Theatre.find({
            city: new RegExp(`^${location.trim()}$`, 'i')
        });
        console.log(allTheatres);
        const now = new Date();
        const validTmdbIds = new Set();

        allTheatres.forEach(theatre => {
            theatre.showtimes.forEach(time => {
                const dateTimeStr = `${theatre.date} ${time}`;
                const fullDateTime = moment(dateTimeStr, 'D-MMM HH:mm').toDate();

                if (fullDateTime > now) {
                    validTmdbIds.add(theatre.tmdbid);
                }
            });
        });

        // Step 3: Final movie filter
        const filteredMovies = matchingMovies.filter(movie =>
            validTmdbIds.has(movie.tmdbid)
        );

        console.log("Filtered movies after theatre check:", filteredMovies.length);
        res.json(filteredMovies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});



router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {

        let moviedb = await Movie.findOne({ tmdbid: id });
        if (!moviedb) {
            const [movie, certification, credits] = await Promise.all([
                tmdb.getmoviebyid(id),
                tmdb.getcertification(id),
                tmdb.getmoviecredits(id)
            ]);
            console.log(movie);
            console.log(certification);
            const castnondb = credits.data.cast.slice(0, 8).map(actor => ({
                name: actor.name,
                profile_path: actor.profile_path,
                character: actor.character
            }));
            const directornondb = credits.data.crew.find(c => (c.job === 'Director'))?.name;
            const writercrew = credits.data.crew.filter(c => (c.job === 'Writer' || c.job === 'Screenplay' || c.job === 'Story' || c.job === 'Dialogue'));
            const map = new Map();
            writercrew.forEach(person => {
                if (!map.has(person.id)) {
                    map.set(person.id, person);
                }
            });
            const writersnondb = Array.from(map.values()).map(w => w.name);
            const originallang = movie.original_language;
            const originallanguage = languages.find(lang => lang.code === originallang);
            const otherlanguages = languages.filter(lang => lang.code !== originallang);

            const primarytrailer = originallanguage
                ? await gettrailers(movie.title, originallanguage.label)
                : null;
            console.log(primarytrailer);

            const trailerPromises = otherlanguages.map(language => gettrailers(movie.title, language.label));
            const results = await Promise.all(trailerPromises);

            let trailers = [primarytrailer, ...results].filter(Boolean);

            const seen = new Set();
            trailers = trailers.filter(trailer => {
                if (seen.has(trailer.videoId)) return false;
                seen.add(trailer.videoId);
                return true;
            });
            let filtered = [];
            if (getmoviestatus(movie.release_date) === 'upcoming') {
                filtered = trailers.filter(m => m.title.toLowerCase().includes('trailer') && m.title.toLowerCase().replace(/\s+/g, '').includes(movie.title.toLowerCase().replace(/\s+/g, '')));
            }
            else {
                filtered = trailers.filter(m => m.title.toLowerCase().includes('trailer') && m.title.toLowerCase().includes('official') && m.title.toLowerCase().replace(/\s+/g, '').includes(movie.title.toLowerCase().replace(/\s+/g, '')));
            }
            console.log(filtered);

            let minutes = movie.runtime;
            let hours = parseInt(minutes / 60);
            minutes = minutes % 60;
            moviedb = new Movie({
                tmdbid: movie.id,
                title: movie.title,
                poster: `https://image.tmdb.org/t/p/w185${movie.poster_path}`,
                plot: movie.overview,
                genres: movie.genres.map(g => g.name),
                imdb: `${movie.vote_average.toFixed(1)}/10`,
                age: certification[0]?.certification || 'NR',
                duration: `${hours}h ${minutes}m`,
                languages: [...new Set(filtered.map(t => t.language))],
                cast: castnondb,
                director: directornondb,
                writers: writersnondb,
                trailers: filtered,
                status: getmoviestatus(movie.release_date),
                releasedate: movie.release_date
            });

            await moviedb.save();
        }
        res.render('admin/adminmoviedetails', { movie: moviedb });
    }
    catch (err) {
        console.log('not able to fetch movie');
        console.log(err.message);
        console.log("Error:", err.response?.status, err.response?.data);
    }
})


module.exports = router;