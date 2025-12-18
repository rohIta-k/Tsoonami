const axios = require('axios');

const omdb = axios.create({
    baseURL: 'https://www.omdbapi.com/',
    params: {
        apikey: process.env.OMDB_API_KEY 
    }
});

module.exports = omdb;