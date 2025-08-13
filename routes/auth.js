const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const z = require('zod');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const verifyToken = require('./middleware');
const admins = require('../config/admins');
const dns = require('dns').promises;
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');
const CLIENT_URL = process.env.CLIENT_URL;




const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }

});


async function isDomainValid(email) {
    try {
        const domain = email.split('@')[1];
        const mxRecords = await dns.resolveMx(domain);
        return mxRecords && mxRecords.length > 0;
    } catch {
        return false;
    }
}

const registerSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must include uppercase')
        .regex(/[a-z]/, 'Must include lowercase')
        .regex(/\d/, 'Must include a number'),
    location: z.string().optional()
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logout successful' });
});

router.post('/register', async (req, res) => {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
        const errors = Object.values(result.error.flatten().fieldErrors)
            .flat()
            .filter(Boolean);

        return res.status(400).json({ errors });
    }

    const { name, email, password } = result.data;

    const domainValid = await isDomainValid(email);
    if (!domainValid) {
        return res.status(400).json({ errors: ['Email domain does not appear to accept emails'] });
    }
    if (email.toLowerCase() === process.env.EMAIL_USER.toLowerCase()) {
        return res.status(400).json({ errors: ['Registration with this email is not allowed'] });
    }


    const existingUser = await User.findOne({ $or: [{ email }, { name }] });
    if (existingUser) {
        return res.status(400).json({ errors: ['Name or Email already exists'] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        bookings: []
    });

    await newUser.save();
    const verifyTokenJWT = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
    const verifyLink = `${CLIENT_URL}/auth/verify/${verifyTokenJWT}`;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            html: `
            <h1>Email Verification</h1>
            <p>Hello ${name},</p>
            <p>Please click the link below to verify your email:</p>
            <a href="${verifyLink}" target="_blank">${verifyLink}</a>
            <p>This link expires in 24 hours.</p>
        `
        });
    }
    catch (err) {
        await User.deleteOne({ email });
        return res.status(500).json({ errors: ['Failed to send verification email. Please try again.'] });
    }


    res.status(201).json({ message: 'User registered successfully' });
});

router.get('/verify/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.redirect('/?verified=invalid');
        }

        if (user.isVerified) {
            return res.redirect('/?verified=already');
        }

        user.isVerified = true;
        await user.save();

        res.redirect('/?verified=success');
    } catch (err) {
        res.redirect('/?verified=expired');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const admin = admins.find(admin => admin.email === email);
    if (admin) {
        const isAdminPasswordCorrect = await bcrypt.compare(password, admin.password);
        if (!isAdminPasswordCorrect) {
            return res.status(400).send('Invalid password');
        }

        const token = jwt.sign(
            { email, isAdmin: true },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });

        req.session.user = {
            email,
            isAdmin: true
        };

        return res.status(200).json({
            message: 'Admin login successful',
            role: 'admin'
        });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).exec();
    console.log(user);
    if (!user) {
        return res.status(400).send('Register account, before logging in');
    }
    if (!user.isVerified) {
        return res.status(400).send('Please verify your email before logging in.');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(400).send('Invalid password');
    }

    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            name: user.name,
            isAdmin: false
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    });

    req.session.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: false
    };

    res.status(200).json({
        message: 'User login successful',
        role: 'user'
    });
});

router.get('/dashboard', verifyToken, async (req, res) => {
    if (req.user.isAdmin) {
        res.render('admin/adminhome');
    }

    const user = await User.findById(req.user.id).select('-password');
    res.render('user/userhome')
});

module.exports = router;




