const mongoose = require('mongoose');
const Showtime = require('./models/showtime');
require('dotenv').config();

async function fixDates() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB Atlas.');

    const shows = await Showtime.find({});
    console.log(`Found ${shows.length} shows.`);

    for (const show of shows) {
      const oldDate = show.date;

      if (oldDate) {
        const intendedDay = oldDate.getUTCDate() + 1; 
        const utcDate = new Date(Date.UTC(
          oldDate.getUTCFullYear(),
          oldDate.getUTCMonth(),
          intendedDay,
          0, 0, 0, 0
        ));

        show.date = utcDate;
        await show.save();
      }
    }

    console.log('All showtimes updated to UTC midnight.');
    process.exit(0);

  } catch (err) {
    console.error(' Error fixing dates:', err);
    process.exit(1);
  }
}

fixDates();
