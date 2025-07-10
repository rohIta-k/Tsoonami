const express = require('express');
require('dotenv').config();
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', (req, res) => {
    res.render('admin/adminhome');
})

app.listen(3000, () => {
    console.log("listening on port 3000");
})