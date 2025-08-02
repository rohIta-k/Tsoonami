const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const tmdb = require('../admin/tmdb');
const axios = require('axios');
const Theatre = require('../../models/theatres');

router.get('/:id', async (req, res) => {
    const { id } = req.params;
        try {
            let moviedb = await Movie.findOne({ tmdbid: id });
            res.render('user/usermoviedetails', { movie: moviedb });
        }
        catch (err) {
            console.log('not able to fetch movie');
            console.log(err.message);
            console.log("Error:", err.response?.status, err.response?.data);
        }
})
module.exports=router;