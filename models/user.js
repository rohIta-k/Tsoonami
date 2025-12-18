const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    inquiryType: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


const BookingSchema = new mongoose.Schema({
    payment_id: { type: String, required: true },
    theatre: { type: String, required: true },
    language: { type: String, required: true },
    day: { type: String, required: true },
    date: { type: Number, required: true },
    month: { type: String, required: true },
    format: { type: String, required: true },
    seats: [{ type: String, required: true }],
    title: { type: String, required: true },
    poster: { type: String },
    time: { type: String, required: true },
    ticketCode: { type: String, required: true },
    used: { type: Boolean, default: false },
    cost: {
        type: Number, required: true
    },
    omdbid: { type: String, required: true },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lastname: { type: String, default: '' },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    mobile: { type: String, default: '' },
    gender: {
        type: String, enum: ['Male', 'Female', 'Other', '']
    },
    location: {
        type: String,
        default: ''
    },
    bookings: [BookingSchema],
    inquiries: [inquirySchema]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
