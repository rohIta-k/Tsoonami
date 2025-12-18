const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const omdb = require('../admin/omdb'); 

router.get('/:id', async (req, res) => {
    const { id } = req.params; 
    
    try {
        let moviedb = await Movie.findOne({ omdbid: id }).lean();
        if (!moviedb) {
            const response = await omdb.get('/', { params: { i: id, plot: 'full' } });
            
            if (response.data.Response === "True") {
                moviedb = {
                    title: response.data.Title,
                    poster: response.data.Poster,
                    plot: response.data.Plot,
                    genres: response.data.Genre.split(', '),
                    age: response.data.Rated,
                    duration: response.data.Runtime,
                    director: response.data.Director,
                    imdb: response.data.imdbRating
                };
            }
        }

        if (!moviedb) {
            return res.status(404).send('Movie not found');
        }

        res.render('user/usermoviedetails', { movie: moviedb });
    }
    catch (err) {
        console.error('Error fetching movie details:', err.message);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;