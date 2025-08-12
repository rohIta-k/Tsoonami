const express = require('express');
const router = express.Router();
const multer = require('multer');
const Banner = require('../../models/banner');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

function getFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}


router.post('/', upload.single('image'), async (req, res) => {
    const filePath = req.file.path;
    const imagepath = `/assets/${req.file.filename}`;
    
    try {
        const hash = getFileHash(filePath);

        const existingBanner = await Banner.findOne({ hash });
        if (existingBanner) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'Banner already exists' });
        }

        const banner = new Banner({ image: imagepath, hash });
        await banner.save();
        res.status(200).json({ message: 'Banner uploaded', banner });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error uploading banner' });
    }
});

router.get('/', async (req, res) => {
    try {
        const banners = await Banner.find({});
        res.json(banners);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch banners' });
    }
});

router.delete('/:id', async (req, res) => {
    const bannerid = req.params.id;

    try {
        const banner = await Banner.findByIdAndDelete(bannerid);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const filePath = path.join(__dirname, '../public', banner.image); 
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('File deletion error:', err);
            }
        });

        res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete banner' });
    }
});

module.exports = router;
