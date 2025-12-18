const express = require('express');
const router = express.Router();
const omdb = require('../admin/omdb');
const Showtime = require('../../models/showtime');
const Theatre = require('../../models/theatres');
router.use(express.json());

const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier?.toLowerCase() === 'pm' && hours < 12) hours += 12;
    if (modifier?.toLowerCase() === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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
        omdbid: id,
        language: lang,
        format: format,
        date: { $gte: start, $lte: end },
        theatre: theatre
    });
    res.send(existing);
});
router.get('/check/:seatkey', async (req, res) => {
    try {
        const [omdbid, date, month, time, theatre, lang, format] = req.params.seatkey.split('|');
        
        const fullDate = makeUTCDate(date, month, new Date().getUTCFullYear());

        const existingShowtime = await Showtime.findOne({
            omdbid: omdbid,
            language: lang,
            format: format,
            theatre: theatre,
            date: fullDate,
            time: time 
        });

        const hasLayout = existingShowtime && (existingShowtime.recliner || existingShowtime.prime || existingShowtime.classic);

        res.json({ message: hasLayout ? 'yes' : 'no' });
    } catch (err) {
        console.error("Check layout error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/save', async (req, res) => {
    try {
        const { omdbid, date, month, language, format, time, theatre } = req.body;
        const fullDate = makeUTCDate(date, month, new Date().getUTCFullYear());

        const filter = { omdbid, language, format, date: fullDate, time, theatre };
        const update = {};
        if (req.body.recliner) update.recliner = req.body.recliner;
        if (req.body.prime) update.prime = req.body.prime;
        if (req.body.classic) update.classic = req.body.classic;

        await Showtime.findOneAndUpdate(filter, update, { upsert: true, new: true });
        res.status(200).json({ message: 'Saved successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/update', async (req, res) => {
    try {
        const { omdbid, date, month, lang, format, time, theatre, seats } = req.body;
        const monthIndex = new Date(`${month} 1, 2025`).getMonth();
        const fullDate = new Date(Date.UTC(new Date().getFullYear(), monthIndex, parseInt(date), 0, 0, 0, 0));

        const existing = await Showtime.findOne({
            omdbid,
            language: lang,
            format: format,
            date: fullDate,
            time: time,
            theatre: theatre
        });

        if (existing) {
            existing.sold.push(...seats);
            await existing.save();
            res.status(200).send('Updated');
        }
    } catch (err) {
        res.status(500).send('Error');
    }
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const movie = await omdb.getmoviebyid(id); 

        const { date, month, day, time, lang, format, theatre } = req.query;
        const { start, end } = getUTCDateRange(date, month, new Date().getUTCFullYear());

        const existing = await Showtime.findOne({
            omdbid: id,
            language: lang,
            format: format,
            date: { $gte: start, $lte: end },
            time: time,
            theatre: theatre
        });

        const newobject = {
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

        res.render('admin/adminseatbooking', { newobject });
    } catch (err) {
        console.error("Error loading seat booking:", err.message);
        res.status(500).send("Failed to load movie details from OMDB");
    }
});

module.exports = router;