const express = require('express');
const router = express.Router();
const Movie = require('../../models/movie');
const QRCode = require('qrcode');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const crypto = require('crypto');
const User = require('../../models/user');
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


    // Create PDF
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

    // Reset fill color for next elements (otherwise everything stays gray)
    doc.fillColor('#000');

    doc.rect(0, 0, 595, 50).fill('#E94B48');

    // "TSOONAMI" in Kirana Hearang
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

    doc.roundedRect(20, 70, 555, 220, 10) // last arg = corner radius
      .fill('#fff')
      .strokeColor('#ccc')
      .lineWidth(1)
      .stroke();

    // Poster
    if (poster && poster.startsWith('http')) {
      const imageRequest = await fetch(poster);
      const imageBuffer = await imageRequest.arrayBuffer();

      const posterHeight = 180; // 90% of card height
      const posterWidth = 110;  // slightly wider than before (was 100)

      doc.image(Buffer.from(imageBuffer), 30, 85, {
        width: posterWidth,
        height: posterHeight
      });
    }
    // Card background — covers only text area, with padding
    const cardX = 145;
    const cardY = 80;
    const cardWidth = 230; // narrower so QR code is outside
    const cardHeight = 170;
    const cardRadius = 10;

    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
      .fill('#FAFAFA'); // very light gray

    // Reset fill color for text
    doc.fillColor('#000');

    // Apply padding for text inside the card
    const padding = 10;
    let textX = cardX + padding;
    let textY = cardY + padding;

    // Title
    doc.font('JosefinL').fontSize(14).fill('#000').text(title, textX, textY);
    textY += 17; // spacing after title

    doc.font('JosefinEL').fontSize(12).fill('#666').text(`${lang}, ${format}`, textX, textY);
    textY += 23; // spacing after lang/format

    // If seats is an array:
    let seatString = Array.isArray(seats)
      ? seats.filter(s => s && s.trim() !== '').join(', ')
      : seats.split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .join(', ');

    // Draw seats in center of box
    const boxWidth = 180;
    const texttwoWidth = doc.widthOfString(seatString);
    const textXCentered = textX + (boxWidth - texttwoWidth) / 2;

    doc.roundedRect(textX, textY, boxWidth, 25, 8).fill('#f5f5f5');
    doc.font('JosefinL')
      .fontSize(12)
      .fill('#000')
      .text(seatString, textXCentered, textY + 7);

    // Add space below seats before theatre name
    textY += 40; // instead of 0 — this pushes it down

    // Theatre name in #A72929
    doc.font('JosefinL')
      .fontSize(12)
      .fill('#A72929')
      .text(theatre, textX, textY, { width: 180 });

    textY += 35; // move further down for next item

    doc.font('JosefinL').fontSize(12).fill('#A72929').text(time, textX, textY);
    textY += 18;

    const formattedDate = `${day}, ${date} ${month}, 2025`;

    doc.font('JosefinL')
      .fontSize(12)
      .fill('#000')
      .text(formattedDate, textX, textY);

    // QR Code completely outside the card
    // Convert QR base64 string to buffer
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

    // QR Code completely outside the card
    const qrX = cardX + cardWidth + 35; // moved 10px more to the right
    const qrY = cardY + 20;
    doc.image(qrBuffer, qrX, qrY, { width: 80, height: 80 });

    // Example image before QR
    const imgPath = path.join(__dirname, '..', '..', 'public', 'assets', 'confirmed.png');
    const imgWidth = 60;
    const imgHeight = 60;
    const imgX = qrX + (80 - imgWidth) / 2; // center under QR
    const imgY = qrY + 80 + 10; // QR height (80) + 10px gap

    doc.image(imgPath, imgX, imgY, { width: imgWidth, height: imgHeight });

    // PAYMENT BAR
    const marginX = 20; // left/right margin
    const rectWidth = doc.page.width - marginX * 2;
    const rectY = 300;
    const rectHeight = 40;

    // Rounded rectangle background
    doc.roundedRect(marginX, rectY, rectWidth, rectHeight, 8).fill('#ffffff');

    // Padding inside the card
    const paddingX = 10;
    const texttwoY = rectY + (rectHeight - 12) / 2; // vertically center for font size 12

    // Left side text: Payment
    const costText = 'You have paid'
    doc.font('JosefinL').fontSize(12).fill('#666')
      .text('You have paid ', marginX + paddingX, texttwoY, { continued: true })
      .fill('#000').text(` ${costText} INR ${cost}`);

    // Right side text: Booking ID
    const bookingText = `Booking ID: ${payment_id}`;
    const bookingTextWidth = doc.widthOfString(bookingText);
    doc.font('JosefinL').fill('#666')
      .text('Booking ID: ', marginX + rectWidth - bookingTextWidth - paddingX, texttwoY, { continued: true })
      .fill('#000').text(payment_id);


    // FOOTER
    const pageHeight = doc.page.height; // A4 height = 842pt in PDFKit
    const bottomMargin = 20;

    // Start drawing 20px above the page bottom
    let y = pageHeight - bottomMargin - 40; // enough space for your content

    // Disclaimer text
    doc.font('JosefinEL').fontSize(10).fill('#666')
      .text('*The holder of a physical ticket / digital ticket is deemed to be the owner of the ticket(s).', 20, y);

    y += 20; // move down for the box

    // Email box
    const pagetwoHeight = doc.page.height;
    const bottomtwoMargin = 20;
    const paddingtwoX = 10; // inside padding
    const paddingY = 4;
    const boxHeight = 20;

    // Calculate box width so it spans almost the whole page with margins
    const margintwoX = 20;
    const boxWidthtwo = doc.page.width - marginX * 2;

    // Position it near the bottom
    const ytwo = pagetwoHeight - bottomtwoMargin - boxHeight;

    // Background rounded rectangle
    doc.roundedRect(margintwoX, ytwo, boxWidthtwo, boxHeight, 5).fill('#d9d9d9');

    // Text inside the box
    doc.font('JosefinL').fontSize(12).fill('#191818ff')
      .text('Mail us at: Customercare@tsoonami.com', margintwoX + paddingtwoX, y + paddingY, {
        continued: true
      });

    // Date aligned to right inside the same rounded box
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
      seats = ''
    } = req.body;  // <-- changed from req.query to req.body

    // Clean seats
    const cleanedSeats = seats
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const costNumber = Number(cost);
    if (isNaN(costNumber)) {
      return res.status(400).json({ error: 'Invalid cost value' });
    }

    // Find movie
    const movie = await Movie.findOne({ tmdbid }).lean();
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Generate ticket code
    const ticketCode = crypto.randomBytes(8).toString('hex');

    // Find user from token payload (verifyToken sets req.user.id)
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Push booking into embedded bookings array
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

    // Respond with ticketCode and payment_id so frontend can redirect
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

    // Find user (verifyToken sets req.user.id)
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find booking with the ticketCode inside user's bookings
    const booking = user.bookings.find(b => b.ticketCode === ticketCode);
    if (!booking) {
      return res.status(404).send('Booking not found');
    }

    // Prepare data for rendering
    const data = {
      payment_id: booking.payment_id, // If you want to store and use payment_id, you may need to save it in booking too
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

    // Generate QR code based on the ticketCode
    const qrData = JSON.stringify({ ticketCode });
    const qrImage = await QRCode.toDataURL(qrData);

    res.render('user/userbookingconfirmation', { data, qrImage });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});




module.exports = router;