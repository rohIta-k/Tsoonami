const express = require('express');
const router = express.Router();
const tmdb=require('../../routes/admin/tmdb');
const Showtime = require('../../models/showtime');
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const movie = await tmdb.getmoviebyid(id);
    const { date, month, day, time, lang, format, theatre } = req.query;
    const fullDate = new Date();
    if (date && month) {
        const dateNum = parseInt(date);
        const monthIndex = new Date(`${month} 1, 2025`).getMonth();
        const thisYear = new Date().getFullYear();
        fullDate.setFullYear(thisYear, monthIndex, dateNum);
        fullDate.setHours(0, 0, 0, 0);
    }
    const existing = await Showtime.findOne({
        tmdbid: id,
        language: lang,
        format: format,
        date: fullDate,
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