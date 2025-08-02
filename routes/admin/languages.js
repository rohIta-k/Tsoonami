const express = require('express');
const axios = require('axios');
const router = express.Router();
const languages = require('../../config/languages');

function getlanguage(code) {
    return languages.find(l => (l.code === code));
}
router.get('/', (req, res) => {
    res.json(languages);
})
module.exports = {router,getlanguage};