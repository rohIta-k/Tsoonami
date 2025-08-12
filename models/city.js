const mongoose = require('mongoose');


const theatreschema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true }
});

const cityschema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai', 'Ahmedabad', 'Jaipur', 'Visakhapatnam']
    },
    theatres: [theatreschema]
});
const City = new mongoose.model('City', cityschema);

const cities = ['Bangalore', 'Chennai', 'Delhi', 'Hyderabad', 'Kolkata', 'Mumbai', 'Ahmedabad', 'Jaipur', 'Visakhapatnam'];

async function preloadCities() {
    for (const city of cities) {
        const exists = await City.findOne({ name: city });
        if (!exists) {
            await City.create({ name: city, theatres: [] });
            console.log(`Created city: ${city}`);
        } else {
            console.log(`City already exists: ${city}`);
        }
    }
}

module.exports = City;