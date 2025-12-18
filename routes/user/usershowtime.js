const express = require('express');
const router = express.Router();
const omdb = require('../../routes/admin/omdb'); 
const Showtime = require('../../models/showtime');

const makeUTCDate = (date, month, year) => {
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    return new Date(Date.UTC(year, monthIndex, parseInt(date), 0, 0, 0, 0));
};

const getUTCDateRange = (date, month, year) => {
    const start = makeUTCDate(date, month, year);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 23, 59, 59, 999));
    return { start, end };
};

router.get('/:id', async (req, res) => {
    const { id } = req.params; 
    const { date, month, day, time, lang, format, theatre } = req.query;

    try {
        const movie = await omdb.getmoviebyid(id);
        
        const currentYear = new Date().getUTCFullYear();
        const { start, end } = getUTCDateRange(date, month, currentYear);
        const existing = await Showtime.findOne({
            omdbid: id, 
            language: lang,
            format: format,
            date: { $gte: start, $lte: end },
            time: time,
            theatre: theatre
        });

        const newobject = {
            omdbid: id,
            title: movie.Title, 
            language: lang,
            format: format,
            day: day,
            date: date,
            month: month,
            time: time,
            theatre: theatre,
            recliner: existing?.recliner || null,
            prime: existing?.prime || null,
            classic: existing?.classic || null,
            sold: existing?.sold || []
        };

        res.render('user/userseatbooking', { newobject });

    } catch (err) {
        console.error('Seat booking fetch error:', err.message);
        res.status(500).send('Error loading seat selection. Please try again.');
    }
});

module.exports = router;