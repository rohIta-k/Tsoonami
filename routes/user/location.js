const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const verifyToken = require('../middleware');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/info', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const { location } = req.body;
        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { location },
            { new: true }
        );

        res.json({ message: 'Location updated successfully', location: user.location });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;
