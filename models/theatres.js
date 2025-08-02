const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/movieinfo')
    .then(() => {
        console.log("connection open");
    })
    .catch(err => {
        console.log('oh no error');
    })

const theatreschema = new mongoose.Schema({
    tmdbid: {
        type: Number,
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