const express = require('express');
const axios = require('axios');
const router = express.Router();
const Movie=require('../../models/movie');

router.get('/:id/trailers', async (req, res) => {
  const { id } = req.params;

  try {
    const movie = await Movie.findOne({ tmdbid: id });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const trailers = movie.trailers || [];
    const title = movie.title;

    res.json({ title, trailers });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch trailers from DB' });
  }
});
module.exports = router;