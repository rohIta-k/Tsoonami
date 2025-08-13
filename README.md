

# 🎟 Tsoonami

Tsoonami is a sleek and modern movie ticket booking website that allows users to explore movies, select showtimes, choose seats, and book tickets effortlessly — all in one place.

---
## 🚀 Features

### 🎭 Frontend — User Side
- 🏠 **Home Page** — Attractive landing page with easy navigation.
- 🔍 **Search Auto-Complete** — Quickly find movies with predictive search.
- 📍 **Location Popup** — Select preferred city or region for show listings.
- 🔑 **Sign-In Popup** — User authentication without leaving the page.
- 👤 **User Profile Page** — View and manage account details and view your queries and booking history.
- 🎬 **Now Showing & Upcoming Movies** — Card-style display with details.
- 📄 **Complete Movie Details** — Cast, synopsis, duration, ratings, etc.
- 🎥 **Watch Trailer** — Preview movies before booking.
- 🎭 **Theatre & Showtime Filters** — Filter by genre, location, or preferred time.
- 🪑 **Dynamic Seat Selection** — Interactive seat map with ticket summary.
- 💳 **Billing & Payment Portal** — Smooth checkout process with multiple payment options.
- ✅ **Ticket Confirmation Page** — Instant booking confirmation.
- ⬇ **Download Ticket Option** — Save or print your ticket.
- 📞 **Contact Us Page** — Direct communication channel.
- 📌 **Functional Footer** — Quick links and essential info.

### 🛠 Frontend — Admin Side
- 🔑 **Admin Login Popup** — Secure authentication for administrators.
- 🎛 **Controls Panel** — Manage theatres, banners, and other content.
- ➕ **Add / Remove Movie Cards** — Update listings instantly.
- ✏ **Edit Movie Information** — Modify descriptions, cast, and details.
- 🕒 **Create Theatre Showtimes** — Set schedules for screenings.
- 🪑 **Seat Matrix Management** — Define and update seating layouts.
- 📬 **View User Queries** — Review user feedback and questions.

## ⚙️ Backend Overview

The backend of **Tsooonami** is designed for efficiency, scalability, and smooth user experience, handling data storage, API interactions, and scheduled updates.

### 🔍 Data Fetching & Storage
- **TMDB API Integration** — Queries and fetches movie data from [The Movie Database](https://www.themoviedb.org/).
- **Youtube API Integration** — To get trailers in original and dubbed languages.
- **Database Caching** — Stores movie information locally after first fetch for faster subsequent results.
- **Persistent User Sessions** — Login and sign-in information stored securely using HTTP cookies.

### ⏳ Automation
- **Scheduled Status Updates** — A `cron` job runs nightly to dynamically update the status of movies (e.g., upcoming → now showing).
  
### 💳 Payment Integration
- **Razorpay API** — Simulates real-world payment processing for seat bookings, providing secure and seamless transaction handling.

### 🗄 Database Structure
- **Users Database** — Stores user profiles, authentication data, and queries.
- **Theatres Database** — Contains theatre details, saved locations, and available screen times.
- **Cities Database** — Holds city information along with their respective theatres.
- **Showtime Database** — Maintains seating layouts and schedule for each show.

### 🛠 Architecture
- **Neatly Defined Routes** — Organized RESTful API endpoints for movies, theatres, showtimes, and user management.
- **Optimized Queries** — Efficient database queries for faster data retrieval and minimal load times.

  ## 🛠 Technologies Used

- **Frontend:** HTML, CSS, JavaScript, EJS (Embedded JavaScript Templates)
- **Backend:** Node.js
- **Database:** MongoDB
- **Package Management:** npm
- **APIs & Integrations:** TMDB API, Youtube API
- **Other Tools:** Various npm packages for routing, authentication, and data handling


## 📸 Screenshots
<img width="1600" height="861" alt="image" src="https://github.com/user-attachments/assets/badbd184-3794-4149-b521-18079c52abe4" />
<img width="1600" height="865" alt="image" src="https://github.com/user-attachments/assets/24b3aa40-09eb-4463-bb2d-ecc63917adfa" />
<img width="1600" height="777" alt="image" src="https://github.com/user-attachments/assets/cfa1adb9-9d51-4a09-afb9-34c07091bc3d" />
<img width="1600" height="860" alt="image" src="https://github.com/user-attachments/assets/0a5f3992-1201-4552-8a43-f79ebb5c05c4" />
<img width="1600" height="853" alt="image" src="https://github.com/user-attachments/assets/e9836804-f8e0-4395-a86e-19853cf33b2a" />
<img width="1600" height="773" alt="image" src="https://github.com/user-attachments/assets/f55b3767-dea9-4c1c-b44a-0f2fea899956" />
<img width="1600" height="774" alt="image" src="https://github.com/user-attachments/assets/4800ba77-f96a-4825-b0e3-0561c7b4ad6c" />
<img width="1600" height="777" alt="image" src="https://github.com/user-attachments/assets/c5c1ea1b-e68d-40ca-95a8-a8f4872128fc" />

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




