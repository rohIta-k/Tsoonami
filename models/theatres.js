const mongoose = require('mongoose');

const theatreschema = new mongoose.Schema({
    omdbid: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    showtimes: [String]
});

theatreschema.index({ tmdbid: 1, date: 1, language: 1, format: 1, city: 1, name: 1, location: 1 }, { unique: true });
const Theatre = mongoose.model('Theatre', theatreschema);

module.exports = Theatre;