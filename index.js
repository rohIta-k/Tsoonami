const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const { router: tmdbroute, getmoviebyid, getcertification, getmoviecredits } = require('./routes/admin/tmdb');
const { router: languageroute, getlanguage } = require('./routes/admin/languages');
const youtuberoute = require('./routes/admin/youtube');
const movieroute = require('./routes/admin/movie');
const cityroute = require('./routes/admin/city');
const theatreroute = require('./routes/admin/theatres');
const bannerroute = require('./routes/admin/banner');
const showtimeroute = require('./routes/admin/showtime');
const usermovieroute=require('./routes/user/usermovie');
const cronfunction = require('./cron/moviestatus');

const searchroute=require('./routes/user/search');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/tmdb', tmdbroute);
app.use('/api/languages', languageroute);
app.use('/api/youtube', youtuberoute);
app.use('/admin/movie', movieroute);
app.use('/api/cities', cityroute);
app.use('/api/theatres', theatreroute);
app.use('/api/banners', bannerroute);
app.use('/admin/showtime', showtimeroute);
app.use('/user/movie',usermovieroute);

app.use('/user/search',searchroute);

app.get('/admin', (req, res) => {
    res.render('admin/adminhome');
})
app.get('/user',async(req,res)=>{
    res.render('user/userhome');
})


app.listen(3000, () => {
    console.log("listening on port 3000");
})
cronfunction();