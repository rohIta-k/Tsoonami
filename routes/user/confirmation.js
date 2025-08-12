const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const QRCode = require('qrcode');
const fs = require('fs');
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
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const booking = user.bookings.find(b => b.ticketCode === ticketCode);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    const qrData = JSON.stringify({ ticketCode });
    const qrDataUrl = await QRCode.toDataURL(qrData);
    const poster = booking.poster;
    const title = booking.title;
    const lang = booking.language;
    const format = booking.format;
    const seats = booking.seats;
    const theatre = booking.theatre;
    const time = booking.time;
    const day = booking.day;
    const date = booking.date;
    const month = booking.month;
    const cost = booking.cost;
    const payment_id = booking.payment_id;


    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const kiranaFontPath = path.join(__dirname, '..', '..', 'public', 'fonts', 'KirangHaerang-Regular.ttf');
    const interFontPath = path.join(__dirname, '..', '..', 'public', 'fonts', 'Inter_18pt-Regular.ttf');
    const JosefinExtraLFontPath = path.join(__dirname, '..', '..', 'public', 'fonts', 'JosefinSans-Regular.ttf');
    const JosefinLightFontPath = path.join(__dirname, '..', '..', 'public', 'fonts', 'JosefinSans-Medium.ttf');

    doc.registerFont('JosefinEL', JosefinExtraLFontPath);
    doc.registerFont('JosefinL', JosefinLightFontPath);
    doc.registerFont('KiranaHearang', kiranaFontPath);
    doc.registerFont('Inter', interFontPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="booking_confirmation.pdf"`);
    doc.pipe(res);
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ECECEC');

    doc.fillColor('#000');

    doc.rect(0, 0, 595, 50).fill('#E94B48');

    doc.font('KiranaHearang')
      .fontSize(22)
      .fill('#fff')
      .text('TSOONAMI', 20, 15);

    doc.font('Inter').fontSize(14);
    const textWidth = doc.widthOfString('BOOKING CONFIRMATION');
    const rightMargin = 20;
    const pageWidth = doc.page.width;

    doc.fill('#fff').text(
      'BOOKING CONFIRMATION',
      pageWidth - textWidth - rightMargin,
      18
    );

    doc.roundedRect(20, 70, 555, 220, 10)
      .fill('#fff')
      .strokeColor('#ccc')
      .lineWidth(1)
      .stroke();

    if (poster && poster.startsWith('http')) {
      const imageRequest = await fetch(poster);
      const imageBuffer = await imageRequest.arrayBuffer();

      const posterHeight = 180; 
      const posterWidth = 110;  
      doc.image(Buffer.from(imageBuffer), 30, 85, {
        width: posterWidth,
        height: posterHeight
      });
    }
    const cardX = 145;
    const cardY = 80;
    const cardWidth = 230; 
    const cardHeight = 170;
    const cardRadius = 10;

    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
      .fill('#FAFAFA'); 

    doc.fillColor('#000');

    const padding = 10;
    let textX = cardX + padding;
    let textY = cardY + padding;

    doc.font('JosefinL').fontSize(14).fill('#000').text(title, textX, textY);
    textY += 17; 

    doc.font('JosefinEL').fontSize(12).fill('#666').text(`${lang}, ${format}`, textX, textY);
    textY += 23; 

    let seatString = Array.isArray(seats)
      ? seats.filter(s => s && s.trim() !== '').join(', ')
      : seats.split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .join(', ');

    const boxWidth = 180;
    const texttwoWidth = doc.widthOfString(seatString);
    const textXCentered = textX + (boxWidth - texttwoWidth) / 2;

    doc.roundedRect(textX, textY, boxWidth, 25, 8).fill('#f5f5f5');
    doc.font('JosefinL')
      .fontSize(12)
      .fill('#000')
      .text(seatString, textXCentered, textY + 7);

    textY += 40; 

    doc.font('JosefinL')
      .fontSize(12)
      .fill('#A72929')
      .text(theatre, textX, textY, { width: 180 });

    textY += 35; 

    doc.font('JosefinL').fontSize(12).fill('#A72929').text(time, textX, textY);
    textY += 18;

    const formattedDate = `${day}, ${date} ${month}, 2025`;

    doc.font('JosefinL')
      .fontSize(12)
      .fill('#000')
      .text(formattedDate, textX, textY);

    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    const qrX = cardX + cardWidth + 35; 
    const qrY = cardY + 20;
    doc.image(qrBuffer, qrX, qrY, { width: 80, height: 80 });

    const imgPath = path.join(__dirname, '..', '..', 'public', 'assets', 'confirmed.png');
    const imgWidth = 60;
    const imgHeight = 60;
    const imgX = qrX + (80 - imgWidth) / 2; 
    const imgY = qrY + 80 + 10; 

    doc.image(imgPath, imgX, imgY, { width: imgWidth, height: imgHeight });

    const marginX = 20;
    const rectWidth = doc.page.width - marginX * 2;
    const rectY = 300;
    const rectHeight = 40;

    doc.roundedRect(marginX, rectY, rectWidth, rectHeight, 8).fill('#ffffff');

    const paddingX = 10;
    const texttwoY = rectY + (rectHeight - 12) / 2; 

    const costText = 'You have paid'
    doc.font('JosefinL').fontSize(12).fill('#666')
      .text('You have paid ', marginX + paddingX, texttwoY, { continued: true })
      .fill('#000').text(` ${costText} INR ${cost}`);

    const bookingText = `Booking ID: ${payment_id}`;
    const bookingTextWidth = doc.widthOfString(bookingText);
    doc.font('JosefinL').fill('#666')
      .text('Booking ID: ', marginX + rectWidth - bookingTextWidth - paddingX, texttwoY, { continued: true })
      .fill('#000').text(payment_id);


    const pageHeight = doc.page.height; 
    const bottomMargin = 20;

    let y = pageHeight - bottomMargin - 40; 

    doc.font('JosefinEL').fontSize(10).fill('#666')
      .text('*The holder of a physical ticket / digital ticket is deemed to be the owner of the ticket(s).', 20, y);

    y += 20; 

    const pagetwoHeight = doc.page.height;
    const bottomtwoMargin = 20;
    const paddingtwoX = 10; 
    const paddingY = 4;
    const boxHeight = 20;

    const margintwoX = 20;
    const boxWidthtwo = doc.page.width - marginX * 2;

    const ytwo = pagetwoHeight - bottomtwoMargin - boxHeight;

    doc.roundedRect(margintwoX, ytwo, boxWidthtwo, boxHeight, 5).fill('#d9d9d9');

    doc.font('JosefinL').fontSize(12).fill('#191818ff')
      .text('Mail us at: Customercare@tsoonami.com', margintwoX + paddingtwoX, y + paddingY, {
        continued: true
      });

    doc.font('JosefinL').fontSize(10).fill('#666')
      .text(new Date().toLocaleDateString(), margintwoX - 20, ytwo + paddingY, {
        align: 'right',
        width: boxWidth - paddingtwoX
      });


    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).send('Error generating PDF');
    }
  }
});


router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      payment_id,
      tmdbid,
      date,
      month,
      day,
      lang,
      format,
      time,
      cost,
      theatre,
      seats
    } = req.body;  
    console.log(seats);

    const cleanedSeats = seats
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
    console.log(cleanedSeats);

    const costNumber = Number(cost);
    if (isNaN(costNumber)) {
      return res.status(400).json({ error: 'Invalid cost value' });
    }

    const movie = await Movie.findOne({ tmdbid }).lean();
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const ticketCode = crypto.randomBytes(8).toString('hex');

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.bookings.push({
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
      tmdbid,
      ticketCode,
      cost: costNumber,
      used: false
    });

    await user.save();
    const fullDate = new Date();
    if (date && month) {
      const dateNum = parseInt(date);
      const monthIndex = new Date(`${month} 1, 2025`).getMonth();
      const thisYear = new Date().getFullYear();
      fullDate.setFullYear(thisYear, monthIndex, dateNum);
      fullDate.setHours(0, 0, 0, 0);
    }
    const showtime = await Showtime.findOne({
      tmdbid,
      language: lang,
      format,
      date: fullDate,
      time,
      theatre
    });

    if (!showtime) {
      console.warn('Matching showtime not found for sold seat update');
    } else {
      showtime.sold.push(...cleanedSeats);
      await showtime.save();
    }
    res.json({
      message: 'Booking created',
      ticketCode,
      payment_id
    });

  } catch (error) {
    console.error(error);
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
      tmdbid: booking.tmdbid,
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