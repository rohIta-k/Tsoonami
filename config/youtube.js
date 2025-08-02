const axios=require('axios');
const youtube=axios.create({
    baseURL:'https://www.googleapis.com/youtube/v3',
    params:{
        part: 'snippet',
        type:'video',
        videoEmbeddable: 'true',
        key: process.env.YOUTUBE_API_KEY,
        language:'en-US'
    }
});
module.exports=youtube;