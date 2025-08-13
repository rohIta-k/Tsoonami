const express = require('express');
const router = express.Router();
const axios = require('axios');
const tmdb = require('../admin/tmdb');
const Showtime = require('../../models/showtime');
const Theatre = require('../../models/theatres');
router.use(express.json());

const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
    }
    if (modifier.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
    }

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    return `${hh}:${mm}`;
};

const makeUTCDate = (date, month, year) => {
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    return new Date(Date.UTC(year, monthIndex, parseInt(date), 0, 0, 0, 0));
};

const getUTCDateRange = (date, month, year) => {
    const start = makeUTCDate(date, month, year);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 23, 59, 59, 999));
    return { start, end };
};
router.get('/find', async (req, res) => {
    const { id, date, month, lang, format, theatre } = req.query;
    const { start, end } = getUTCDateRange(date, month, new Date().getUTCFullYear());
    const existing = await Showtime.find({
        tmdbid: id,
        language: lang,
        format: format,
        date: { $gte: start, $lte: end },
        theatre: theatre
    });
    console.log(existing);
    res.send(existing);
})

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
        date: { $gte: start, $lte: end },
        time: time,
        theatre: theatre
    });
    console.log(existing);
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
        newobject.sold = existing.sold || [];
    }
    res.render('admin/adminseatbooking', { newobject });
})
router.post('/save', async (req, res) => {
    try {
        const { tmdbid, date, month, language, format, time, theatre } = req.body;
        const fullDate = makeUTCDate(date, month, new Date().getUTCFullYear());
        const filter = {
            tmdbid,
            language,
            format,
            date: fullDate,
            time,
            theatre
        };
        const update = {};
        if (req.body.recliner) update.recliner = req.body.recliner;
        if (req.body.prime) update.prime = req.body.prime;
        if (req.body.classic) update.classic = req.body.classic;
        const options = { upsert: true, new: true };
        const result = await Showtime.findOneAndUpdate(filter, update, options);
        res.status(200).json({ message: 'Saved successfully' });
    } catch (err) {
        console.error('Error saving', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }

})
router.get('/check/:seatkey', async (req, res) => {
    try {
        const key = req.params.seatkey;

        const [tmdbid, date, month, time, theatre, lang, format] = key.split('|');
        const dateString = `${date}-${month}`;
        const timestring = convertTo24Hour(time);
        console.log(tmdbid, dateString, timestring, theatre, lang, format);
        const show = await Theatre.findOne({
            tmdbid: parseInt(tmdbid),
            language: lang,
            format: format,
            name: theatre,
            date: dateString,
            showtimes: timestring
        });
        if (show) {
            res.json({ message: 'yes' });
        }
        else {
            res.json({ message: 'no' });
        }
    }
    catch (err) {
        console.log(err.message);
    }
});
router.post('/update', async (req, res) => {
    try {
        const {
            tmdbid, date, day, month, lang, format, time, theatre, seats } = req.body;
        const fullDate = new Date();
        if (date && month) {
            const dateNum = parseInt(date);
            const monthIndex = new Date(`${month} 1, 2025`).getMonth();
            const thisYear = new Date().getFullYear();
            fullDate = new Date(Date.UTC(thisYear, monthIndex, dateNum, 0, 0, 0, 0));
        }
        const existing = await Showtime.findOne({
            tmdbid: tmdbid,
            language: lang,
            format: format,
            date: fullDate,
            time: time,
            theatre: theatre
        });
        existing.sold.push(...seats);


        await existing.save();
    }
    catch (err) {
        console.log(err);
    }
})

module.exports = router;