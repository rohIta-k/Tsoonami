const axios=require('axios');
const tmdb=axios.create({
    root:'https://api.themoviedb.org/3',
    params:{
        apikey:process.env.tmdb-api-key,
        language:'en-US'
    }
});
module.exports=tmdb;