const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

// 1. Updated Helper/Route names (TMDB -> OMDB)
const omdbRoute = require('./routes/admin/omdb');
const { router: languageroute } = require('./routes/admin/languages');
const movieroute = require('./routes/admin/movie');
const cityroute = require('./routes/admin/city');
const inquiryroute = require('./routes/admin/inquiry');
const theatreroute = require('./routes/admin/theatres');
const bannerroute = require('./routes/admin/banner');
const showtimeroute = require('./routes/admin/showtime');
const adminprofileroute = require('./routes/admin/adminprofile');
const usermovieroute = require('./routes/user/usermovie');
const usershowtimeroute = require('./routes/user/usershowtime');
const confirmationroute = require('./routes/user/confirmation');
const authroute = require('./routes/auth');
const locationroute = require('./routes/user/location');
const contactroute = require('./routes/contact');
const profileroute = require('./routes/user/profile');
const searchroute = require('./routes/user/search');

// Cron logic
const cronfunction = require('./cron/moviestatus');

// 2. Database Connection (Modernized options)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// 3. Middlewares
app.use(express.json()); // Essential for handling JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

// 4. API & Page Routes
app.use('/api/omdb', omdbRoute); // Updated endpoint name
app.use('/api/languages', languageroute);
app.use('/admin/movie', movieroute);
app.use('/admin/inquiries', inquiryroute);
app.use('/api/cities', cityroute);
app.use('/api/theatres', theatreroute);
app.use('/api/banners', bannerroute);
app.use('/admin/showtime', showtimeroute);
app.use('/profile', adminprofileroute);
app.use('/user/movie', usermovieroute);
app.use('/user/search', searchroute);
app.use('/user/showtime', usershowtimeroute);
app.use('/user/confirmation', confirmationroute);
app.use('/auth', authroute);
app.use('/location', locationroute);
app.use('/contact', contactroute);
app.use('/userprofile', profileroute);

// 5. Views
app.get('/admin', (req, res) => res.render('admin/adminhome'));
app.get('/user', (req, res) => res.render('user/userhome'));
app.get('/privacypolicy', (req, res) => res.render('privacypolicy'));
app.get('/admin/Contactus', (req, res) => res.render('admin/admincontactus'));
app.get('/user/Contactus', (req, res) => res.render('user/usercontactus'));
app.get('/', (req, res) => res.render('signIn'));

// 6. Server Initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`TSOONAMI server listening on port ${PORT}`);
});

cronfunction();