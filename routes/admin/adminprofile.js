const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware');
const User = require('../../models/user');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', verifyToken, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).send('Access denied');
        }

        const data = {
            email: req.user.email,
            name: 'Admin',
            role: 'admin',
            inquiries: []
        };

        const usersWithInquiries = await User.find({
            inquiries: { $exists: true, $not: { $size: 0 } }
        }).select('name email inquiries');

        usersWithInquiries.forEach(user => {
            user.inquiries.forEach(inquiry => {
                data.inquiries.push({
                    name: user.name,
                    email: user.email,
                    inquiryType: inquiry.inquiryType,
                    message: inquiry.message,
                    createdAt: inquiry.createdAt
                });
            });
        });

        res.render('admin/adminprofile', { data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;