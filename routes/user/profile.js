const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware');
const User = require('../../models/user');
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get('/', verifyToken, async (req, res) => {
    try {
        // If admin, no need to query DB
        if (req.user.isAdmin) {
            return res.json({
                email: req.user.email,
                name: 'Admin',
                role: 'admin'
            });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const data = {
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            location: user.location,
            bookings: user.bookings,    // Array of booking objects
            inquiries: user.inquiries,
            mobile: user.mobile,
            lastname: user.lastname,
            gender:user.gender // Array of inquiry objects
        };

        // Render userprofile.ejs (or whatever template engine you use)
        res.render('user/userprofile', { data });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/update', verifyToken, async (req, res) => {
    try {
        const allowedFields = ["name", "lastname", "mobile", "gender", "email"];
        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== "") {
                updates[field] = req.body[field];
            }
        }

        // Extra mobile validation
        if (updates.mobile && !/^[0-9]{10}$/.test(updates.mobile)) {
            return res.status(400).json({ error: "Invalid mobile number format" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true, runValidators: true, select: "-password" }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Profile updated successfully", user: updatedUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;