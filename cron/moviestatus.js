const cron = require('node-cron');
const Movie = require('../models/movie'); 

async function updateMovieStatuses() {
    const today = new Date().toISOString().split('T')[0];
    try {
        const result = await Movie.updateMany(
            { status: 'upcoming', releasedate: today },
            { $set: { status: 'nowshowing' } }
        );
        console.log(`[${new Date().toLocaleString()}] Updated ${result.modifiedCount} movies to "now showing".`);
    } catch (err) {
        console.error('Error updating movie statuses:', err);
    }
}

function startMovieStatusUpdater() {
    cron.schedule('1 0 * * *', updateMovieStatuses);
}


module.exports = startMovieStatusUpdater;
