const express = require('express');
const router = express.Router();
const City = require('../../models/city');
router.use(express.json());

router.post('/:city/theatres', async (req, res) => {
    const { city: cityname } = req.params;
    const { name: theatrename, location: theatrelocation } = req.body;
    try {
        const city = await City.findOne({ name: { $regex: `^${cityname}$`, $options: 'i' } });

        if (!city) {
            return res.status(404).json({ error: 'City not found.' });
        }
        const existing = city.theatres.find(
            t => t.name.toLowerCase() === theatrename.toLowerCase() && t.location.toLowerCase() === theatrelocation.toLowerCase()
        );
        if (existing) {
            return res.status(200).json({ message: 'Theatre already exists' });
        }

        const namematch = city.theatres.find(t => t.name.toLowerCase() === theatrename.toLowerCase());
        if (namematch) {
            namematch.location = theatrelocation;
            await city.save();
            return res.status(200).json({ message: 'Theatre updated successfully.' });
        }

        city.theatres.push({ name: theatrename, location: theatrelocation });
        await city.save();

        res.status(200).json({ message: 'Theatre added successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
})
router.get('/:city/theatres', async (req, res) => {
    const { city } = req.params;
    const cityname = await City.findOne({ name: city });
    if (cityname.theatres.length === 0)
        return res.status(200).json({ message: 'No theatres', theatres: [] });
    res.json({ message: '', theatres: cityname.theatres });
    console.log(res.data);
})
router.delete('/:city/theatres/:theatrename', async (req, res) => {
    const { city: cityname, theatrename } = req.params;
    try {
        const city = await City.findOne({ name: { $regex: `^${cityname}$`, $options: 'i' } });
        city.theatres = city.theatres.filter(
            t => t.name.toLowerCase() != theatrename.toLowerCase());
        await city.save();

        res.status(200).json({ message: 'Theatre removed successfully.' });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
})
module.exports = router;