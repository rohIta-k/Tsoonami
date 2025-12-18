const express = require('express');
const router = express.Router();
const User=require('../../models/user');
router.get('/', async (req, res) => {
    try {
        const allInquiries = await User.aggregate([
            { $match: { "inquiries.0": { $exists: true } } },
            { $unwind: "$inquiries" },
            
            {
                $project: {
                    _id: 0,
                    userName: "$name",
                    userLastName: "$lastname",
                    userEmail: "$email",
                    inquiryType: "$inquiries.inquiryType",
                    message: "$inquiries.message",
                    createdAt: "$inquiries.createdAt"
                }
            },
            
            { $sort: { createdAt: -1 } }
        ]);

        res.send({ inquiries: allInquiries });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching inquiries");
    }
});
module.exports=router;