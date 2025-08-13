const express = require('express');
const router = express.Router();
const tmdb=require('../../routes/admin/tmdb');
const Showtime = require('../../models/showtime');
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const movie = await tmdb.getmoviebyid(id);
    const { date, month, day, time, lang, format, theatre } = req.query;
    const { start, end } = getUTCDateRange(date, month, new Date().getUTCFullYear());
    console.log(start, end);
    console.log({
        tmdbid: parseInt(id),
        language: lang.trim(),
        format: format.trim(),
        dateRange: { start, end },
        time,
        theatre: theatre.trim()
    });
    const existing = await Showtime.findOne({
        tmdbid: id,
        language: lang,
        format: format,
        date:{ $gte: start, $lte: end },
        time: time,
        theatre: theatre
    });
    const newobject = {
        title: movie.title,
        language: lang,
        format: format,
        day: day,
        date: date,
        month: month,
        time: time,
        theatre: theatre,
        recliner: null,
        prime: null,
        classic: null,
        sold: []
    }
    if (existing) {
        newobject.recliner = existing.recliner || null;
        newobject.prime = existing.prime || null;
        newobject.classic = existing.classic || null;
        newobject.sold=existing.sold||[];
    }
    console.log(newobject);
    res.render('user/userseatbooking', { newobject });
})
module.exports=router;