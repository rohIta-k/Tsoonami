const mongoose = require('mongoose');


const castschema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true
    },
    profile_path:
    {
        type: String
    },
    character:
    {
        type: String
    }
});

const trailerschema = new mongoose.Schema({
    language: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
});


const movieschema = new mongoose.Schema({
    tmdbid: {
        type: Number,
        required: true,
        unique: true
    },
    title:
    {
        type: String,
        required: true
    },
    poster: {
        type: String,
        required: true
    },
    plot: {
        type: String,
        required: true
    },
    genres: {
        type: [String],
        required: true
    },
    imdb: {
        type: String,
        required: true
    },
    age: {
        type: String
    },
    duration: {
        type: String,
        required: true
    },
    languages: {
        type: [String],
        required: true
    },
    cast: {
        type: [castschema]
    },
    director: {
        type: String,
        required: true
    },
    writers: {
        type: [String],
        required: true
    },
    trailers: {
        type: [trailerschema]
    },
    status: {
        type: String,
        enum: ['nowshowing', 'upcoming'],
        required: true
    },
    releasedate: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Movie', movieschema);