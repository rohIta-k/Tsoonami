const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const path = require('path');
const crypto = require('crypto');
const User = require('../../models/user');
const Showtime = require('../../models/showtime');
const verifyToken = require('../middleware');

router.use(express.json());

router.get('/pdf/:ticketCode', verifyToken, async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const user = await User.findById(req.user.id);
    const booking = user?.bookings.find(b => b.ticketCode === ticketCode);

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    
    const cleanSeats = booking.seats
      .flatMap(s => s.split('\n'))
      .map(s => s.trim())
      .filter(s => s !== "");

    const qrBuffer = await QRCode.toBuffer(JSON.stringify({ ticketCode }));

    const doc = new PDFDocument({ size: 'A4', margin: 0 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Tsoonami_Ticket_${ticketCode}.pdf"`);
    doc.pipe(res);

    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ECECEC');
    doc.rect(0, 0, 595, 50).fill('#E94B48');

    doc.font('Helvetica-Bold').fontSize(22).fill('#fff').text('TSOONAMI', 20, 15);
    doc.fontSize(14).text('BOOKING CONFIRMATION', 380, 18);

    doc.roundedRect(20, 70, 555, 220, 10).fill('#fff').strokeColor('#ccc').stroke();

    if (booking.poster) {
      const response = await fetch(booking.poster);
      const buffer = Buffer.from(await response.arrayBuffer());
      doc.image(buffer, 30, 85, { width: 110, height: 160 });
    }

    doc.fillColor('#000').font('Helvetica-Bold').fontSize(16).text(booking.title, 155, 90);
    doc.font('Helvetica').fontSize(12).fillColor('#666').text(`${booking.language} | ${booking.format}`, 155, 110);

    doc.fillColor('#E94B48').text(booking.theatre, 155, 140);
    doc.fillColor('#000').text(`Seats: ${cleanSeats.join(', ')}`, 155, 160);
    doc.text(`Time: ${booking.time}`, 155, 180);
    doc.text(`Date: ${booking.day}, ${booking.date} ${booking.month}`, 155, 200);

    doc.image(qrBuffer, 460, 90, { width: 90, height: 90 });

    doc.roundedRect(20, 310, 555, 40, 8).fill('#fff');
    doc.fillColor('#666').fontSize(12).text(`Payment ID: ${booking.payment_id}`, 30, 325);
    doc.fillColor('#000').text(`Amount Paid: INR ${booking.cost}`, 430, 325);

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating PDF');
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { payment_id, omdbid, date, month, day, lang, format, time, cost, theatre, seats } = req.body;

    const cleanedSeats = seats
      .split(/[\n,]+/)
      .map(s => s.trim())
      .filter(s => s !== "");

    const movie = await Movie.findOne({ omdbid }).lean();
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const user = await User.findById(req.user.id);
    const isDuplicate = user.bookings.some(b => b.payment_id === payment_id);
    if (isDuplicate) {
      return res.status(400).json({ error: 'Booking already exists for this payment' });
    }

    const ticketCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const newBooking = {
      payment_id,
      theatre,
      language: lang,
      day,
      date: Number(date),
      month,
      format,
      seats: cleanedSeats,
      title: movie.title,
      poster: movie.poster,
      time,
      omdbid, 
      ticketCode,
      cost: Number(cost),
      used: false,
      bookedAt: new Date()
    };

    user.bookings.push(newBooking);
    await user.save();

    const monthIndex = new Date(`${month} 1, 2025`).getMonth();
    const fullDate = new Date(Date.UTC(new Date().getFullYear(), monthIndex, parseInt(date), 0, 0, 0, 0));

    await Showtime.findOneAndUpdate(
      { omdbid, language: lang, format, date: fullDate, time, theatre },
      { $push: { sold: { $each: cleanedSeats } } },
      { upsert: true }
    );

    res.json({ message: 'Booking created', ticketCode, payment_id });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:ticketCode', verifyToken, async (req, res) => {
  try {
    const { ticketCode } = req.params;
    const user = await User.findById(req.user.id).lean();
    if (!user) {
        return res.status(404).send('User not found');
    }

    const booking = user.bookings.find(b => b.ticketCode === ticketCode);
    if (!booking) {
        return res.status(404).send('Booking not found');
    }

    const data = {
      payment_id: booking.payment_id,
      omdbid: booking.omdbid, 
      date: booking.date,
      month: booking.month,
      day: booking.day,
      lang: booking.language,
      format: booking.format,
      time: booking.time,
      theatre: booking.theatre,
      seats: booking.seats.join(', '),
      poster: booking.poster,
      title: booking.title,
      cost: booking.cost
    };

    const qrData = JSON.stringify({ ticketCode });
    const qrImage = await QRCode.toDataURL(qrData);
    res.render('user/userbookingconfirmation', { data, qrImage });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;