const express = require('express');
const router = express.Router();
const verifyToken = require('./middleware');
const User = require('../models/user');
const admins = require('../config/admins');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.post('/', verifyToken, async (req, res) => {
    try {
        const { inquiryType, message } = req.body;

        if (!inquiryType|| !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const inquiry = {
            inquiryType,
            message,
            createdAt: new Date()
        };

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.inquiries.push(inquiry);
        await user.save();

        await Promise.all(admins.map(async (admin) => {
            if (admin._id) {
                const adminUser = await User.findById(admin._id);
                if (adminUser) {
                    adminUser.inquiries.push(inquiry);
                    await adminUser.save();
                }
            }
        }));

        res.status(201).json({ message: 'Inquiry submitted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
