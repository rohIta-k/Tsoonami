const cron = require('node-cron');
const Movie = require('../models/movie'); 
const Showtime = require('../models/showtime'); 

async function performMovieMaintenance() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    try {
        const updateResult = await Movie.updateMany(
            { status: 'upcoming', releasedate: todayStr },
            { $set: { status: 'nowshowing' } }
        );
        console.log(`[${new Date().toLocaleString()}] Updated ${updateResult.modifiedCount} movies to "now showing".`);

        const activeMovies = await Movie.find({ status: 'nowshowing' });
        
        for (const movie of activeMovies) {
            const hasFutureShows = await Showtime.findOne({
                omdbid: movie.omdbid,
                date: { $gte: new Date(today.setHours(0,0,0,0)) } 
            });

            if (!hasFutureShows) {
                await Movie.deleteOne({ _id: movie._id });
                console.log(`[${new Date().toLocaleString()}] Deleted expired movie: ${movie.title} (ID: ${movie.omdbid})`);
            }
        }
    } catch (err) {
        console.error('Error during movie maintenance:', err);
    }
}

function startMovieStatusUpdater() {
    // Runs at 12:01 AM every day
    cron.schedule('1 0 * * *', performMovieMaintenance);
}

module.exports = startMovieStatusUpdater;