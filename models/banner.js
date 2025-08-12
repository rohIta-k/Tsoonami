const mongoose = require('mongoose');


const bannerschema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    }
})
const Banner = new mongoose.model('Banner', bannerschema);
module.exports = Banner;