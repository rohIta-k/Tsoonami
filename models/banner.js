const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/movieinfo')
    .then(() => {
        console.log("connection open");
    })
    .catch(err => {
        console.log('oh no error');
    })

const bannerschema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    hash:{
        type:String,
        required:true
    }
})
const Banner = new mongoose.model('Banner', bannerschema);
module.exports = Banner;