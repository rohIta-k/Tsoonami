

# 🎟 Tsoonami

Tsoonami is a sleek and modern movie ticket booking website that allows users to explore movies, select showtimes, choose seats, and book tickets effortlessly — all in one place.

---
## 🌟 Key Features

### 🎬 User Experience
- 🔍 **Easy Discovery** — Search auto-complete and multi-language/format filters (2D, 3D, IMAX).
- 👤 **User Profile Page** —  Comprehensive dashboard for managing personal data, booking history, and support inquiries.
- 🎬 **Now Showing & Upcoming Movies** — Card-style display with details.
- 📄 **Complete Movie Details** — Cast, synopsis, duration, ratings, etc.
- 🎭 **Theatre & Showtime Filters** — Filter by genre, language, location, or preferred time.
- 🪑 **Seat Selection** — Interactive seat map with ticket summary.
- 💳 **Billing & Payment Portal** — Integrated Razorpay payment gateway for instant, safe transactions.
- ⬇ **Download Ticket Option** — Save or print your ticket.
- 📞 **Support Desk(Contact Us) Page** — User inquiries are directly routed to the Admins. They can monitor, review, and manage all incoming user queries

### 🛠  Admin Controls
- 🔑 **Privileged Admin Access** — Secure authentication gateway that grants admin access only to predefined credentials.
- 🎛 **Controls Panel** — Manage theatres, banners, and other content.
- ➕ **Add / Remove Movie Cards** — Update listings instantly.
- 🕒 **Create Theatre Showtimes** — Set schedules for screenings.
- 🪑 **Seat Matrix Management** — Define and update seating layouts.
- 📬 **View User Queries** — Review user feedback and questions.

## ⚙️ 🏗️ Backend & API Design

- **OMDB API Integration** — Queries and fetches movie data from [The Movie Database](https://www.omdbapi.com/).
- **Database Caching** — Stores movie information locally after first fetch for faster subsequent results.
- **Persistent User Sessions** — Login and sign-in information stored securely using HTTP cookies.
- **Scheduled Status Updates** — A `cron` job runs nightly to dynamically update the status of movies (e.g., upcoming → now showing).
- **Razorpay API** — Simulates real-world payment processing for seat bookings, providing secure and seamless transaction handling.

## 🗄 Database Structure
- **Users Database** — Stores user profiles, authentication data, and queries.
- **Theatres Database** — Contains theatre details, saved locations, and available screen times.
- **Cities Database** — Holds city information along with their respective theatres.
- **Showtime Database** — Maintains seating layouts and schedule for each show.
- **Movie Database** - Stores movied details like title, genres, languages, rating, cast, plot fetched from OMDB API.

## 🛠️ Technology Stack

| Layer | Technology | 
| :--- | :--- | 
| **Frontend** | JavaScript, EJS, CSS3 | 
| **Backend** | Node.js, Express.js | 
| **Database** | MongoDB (Mongoose ODM) | 
| **Payments** | Razorpay SDK | 

---


# 🚀 Hosted Link

Access the live version of **Tsooonami** at:  
[https://tsoonami.onrender.com](https://tsoonami.onrender.com)

---

# 💳 Test Card Credentials

To test the payment flow locally or in development, you can use the following **test card credentials** provided by Razorpay:

| Card Number         | CVV  | Expiry Date  |
|---------------------|------|--------------|
| 2305 3242 5784 8228 | 123  | Any future date (e.g., 12/30) |

---

# 🎟Local Setup Guide

## 1️⃣ Clone the Repository
```bash
# Using SSH
git clone git@github.com:yourusername/tsooonami.git

# OR using HTTPS
git clone https://github.com/yourusername/tsooonami.git

cd tsooonami
```
2️⃣ Install Dependencies
```bash
npm install
```
3️⃣ Create Environment Variables
```bash
PORT=3000
JWT_SECRET=your_jwt_secret
EMAIL_USER=youremail@example.com
EMAIL_PASS=your_email_app_password
CLIENT_URL=http://localhost:3000
TMDB_API_KEY=your-tmdb-api-key
YOUTUBE_API_KEY=your-youtube-data-api-v3
NODE_ENV=development
SESSION_SECRET=your_session_secret
MONGO_URI=your_mongodb_connection_string
```
4️⃣Run the Project

Run the app with Node:
```bash
node index.js
```
---
## 👥 Team Members

- **Rohita Kotra** — 2024IMT-070
- **T Tharani** — 2024BEE-034
---




