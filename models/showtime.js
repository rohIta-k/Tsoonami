const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/movieinfo')
    .then(() => {
        console.log("connection open");
    })
    .catch(err => {
        console.log('oh no error');
    })
const seatschema = new mongoose.Schema({
    rows: Number,
    columns: Number
})

const showtimeschema = new mongoose.Schema({
    tmdbid: {
        type: Number,
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
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    theatre: {
        type: String,
        required: true
    },
    recliner: {
        type: seatschema
    },
    prime: {
        type: seatschema
    },
    classic: {
        type: seatschema
    }
})
showtimeschema.index({
    tmdbid: 1,
    date: 1,
    time: 1,
    theatre: 1,
    language: 1,
    format: 1
}, { unique: true });
const Showtime = new mongoose.model('Showtime', showtimeschema);
if (require.main === module) {
    Showtime.syncIndexes()
        .then(() => {
            console.log("Indexes synced successfully!");
            mongoose.disconnect();
        })
        .catch(err => {
            console.error("Index sync failed:", err);
            mongoose.disconnect();
        });
}
module.exports = Showtime;