document.querySelector('.homee').addEventListener('click', () => {
    window.location.href = '/user'
})

const originalData = {
    mobile: "<%= data.mobile %>",
    name: "<%= data.name %>",
    lastname: "<%= data.lastname %>",
    gender: "<%= data.gender %>"
};
console.log(originalData);

document.addEventListener("DOMContentLoaded", () => {
    if (originalData.gender) {
        const genderInput = document.querySelector(`input[name="gender"][value="${originalData.gender}"]`);
        if (genderInput) {
            genderInput.checked = true;
        }
    }
    const container = document.getElementById("bookings-container");
    const inquirycontainer = document.getElementById('inquiry-container');
    bookings.forEach(booking => {
        const bookingCard = document.createElement("div");
        bookingCard.classList.add("one");

        const bookingDateTime = new Date(
            `${booking.day}, ${booking.date} ${booking.month} ${new Date(booking.createdAt).getFullYear()} ${booking.time}`
        );

        const now = new Date();
        const status = bookingDateTime < now ? "PAST" : "UPCOMING";

        bookingCard.innerHTML = `
        <div class="inner-div">
            <p class="booking-name">${booking.title}</p>
            <span class="upcoming">${status}</span>
        </div>
        <div class="detail-section">
            <span class="detail-label">Seat - ${booking.seats.join(", ")}</span>
            <span class="detail-label">${booking.time}</span>
            <span class="detail-label">${booking.day}, ${booking.date} ${booking.month} ${bookingDateTime.getFullYear()}</span>
        </div>
        <div class="detail-section">
            <span class="address">${booking.theatre}</span>
            <span class="booking-id">BOOKING ID: ${booking.ticketCode}</span>
        </div>
    `;

        container.appendChild(bookingCard);
    });

    inquiries.forEach(inquiry => {
        const inquiryCard = document.createElement("div");
        inquiryCard.classList.add("one");

        const createdDate = new Date(inquiry.createdAt);
        const formattedDate = createdDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        inquiryCard.innerHTML = `
            <div class="detail-section">
                <span class="detail-label">Type: ${inquiry.inquiryType}</span>
                <span class="detail-label">Date: ${formattedDate}</span>
            </div>
            <div class="detail-section">
                <div class="query">${inquiry.message}</div>
            </div>
        `;

        inquirycontainer.appendChild(inquiryCard);
    });

});

document.querySelector(".save").addEventListener("click", async () => {
    const currentData = {
        mobile: document.querySelector('input[name="email"]').value.trim(),
        name: document.querySelector('input[name="fname"]').value.trim(),
        lastname: document.querySelector('input[name="lname"]').value.trim(),
        gender: document.querySelector('input[name="gender"]:checked')?.value || ""
    };

    const mobileRegex = /^[6-9]\d{9}$/;
    if (currentData.mobile && !mobileRegex.test(currentData.mobile)) {
        alert("Please enter a valid 10-digit mobile number starting with 6-9.");
        return;
    }

    const updatedData = {};
    for (const key in currentData) {
        if (currentData[key] !== originalData[key] && currentData[key] !== "") {
            updatedData[key] = currentData[key];
        }
    }

    if (Object.keys(updatedData).length === 0) {
        alert("No changes detected.");
        return;
    }

    try {
        const res = await axios.post(
            "/userprofile/update",
            updatedData,
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (res.status !== 200) {
            throw new Error("Update failed");
        }

        alert("Profile updated successfully!");
        location.reload();
    } catch (err) {
        console.error(err);
        alert("Error updating profile.");
    }

});