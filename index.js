const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const { router: tmdbroute, getmoviebyid, getcertification, getmoviecredits } = require('./routes/admin/tmdb');
const { router: languageroute, getlanguage } = require('./routes/admin/languages');
const youtuberoute = require('./routes/admin/youtube');
const movieroute = require('./routes/admin/movie');
const cityroute = require('./routes/admin/city');
const theatreroute = require('./routes/admin/theatres');
const bannerroute = require('./routes/admin/banner');
const showtimeroute = require('./routes/admin/showtime');
const adminprofileroute=require('./routes/admin/adminprofile');
const usermovieroute = require('./routes/user/usermovie');
const cronfunction = require('./cron/moviestatus');
const usershowtimeroute = require('./routes/user/usershowtime');
const confirmationroute = require('./routes/user/confirmation');
const authroute = require('./routes/auth');
const locationroute = require('./routes/user/location');
const contactroute = require('./routes/contact');
const profileroute = require('./routes/user/profile');


const searchroute = require('./routes/user/search');


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB Atlas');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000
    }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use('/api/tmdb', tmdbroute);
app.use('/api/languages', languageroute);
app.use('/api/youtube', youtuberoute);
app.use('/admin/movie', movieroute);
app.use('/api/cities', cityroute);
app.use('/api/theatres', theatreroute);
app.use('/api/banners', bannerroute);
app.use('/admin/showtime', showtimeroute);
app.use('/profile',adminprofileroute);
app.use('/user/movie', usermovieroute);


app.use('/user/search', searchroute);
app.use('/user/showtime', usershowtimeroute);
app.use('/user/confirmation', confirmationroute);
app.use('/auth', authroute);
app.use('/location', locationroute);
app.use('/contact', contactroute);
app.use('/userprofile', profileroute);



app.get('/admin', (req, res) => {
    res.render('admin/adminhome');
})
app.get('/user', async (req, res) => {
    res.render('user/userhome');
})

app.get('/privacypolicy', (req, res) => {
    res.render('privacypolicy');
})
app.get('/admin/Contactus', (req, res) => {
    res.render('admin/admincontactus');
})
app.get('/user/Contactus', (req, res) => {
    res.render('user/usercontactus');
})
app.get('/', (req, res) => {
    res.render('signIn');
})

app.listen(3000, () => {
    console.log("listening on port 3000");
})
cronfunction();