let count = 0;
let cost = 0;

document.querySelector('.homee').addEventListener('click', () => {
    window.location.href = '/user'
})
const seatselectioncontainer = document.querySelector('.seat-placeholders');
const summary = document.querySelector('#details');
const price = document.querySelector('#cost');
const total = document.querySelector('#total');
const book = document.querySelector('.book-tickets-button');
const selectedSeatLabels = new Set();
const seatPrices = {
    'Recliner': 325,
    'Prime': 200,
    'Classic': 250
};
const finalseats = [];
function updateSummaryDisplay() {
    if (count === 0) {
        document.querySelector('#summary').style.display = 'none';
    } else {
        document.querySelector('#summary').style.display = 'flex';
    }
    price.textContent = `Rs ${cost}`;
    total.textContent = `Rs ${cost + 100}`;
}

function attachSeatListeners() {
    const seats = document.querySelectorAll('.seat');
    seats.forEach((div) => {
        div.addEventListener('click', () => {
            const currentColor = getComputedStyle(div).backgroundColor;
            const section = div.getAttribute('data-section');
            const seatPrice = seatPrices[section];
            if (currentColor === 'rgb(255, 192, 203)') {
                if (count >= 12) {
                    alert('Maximum of 12 seats can be selected');
                    return;
                }
                div.style.backgroundColor = '#e91e63';
                div.style.color = '#ffffff';
                const newdiv = document.createElement('div');
                newdiv.classList.add('placeholder-box');
                newdiv.innerHTML = div.innerHTML;
                seatselectioncontainer.appendChild(newdiv);
                selectedSeatLabels.add(div.innerHTML);
                summary.textContent = Array.from(selectedSeatLabels).join(', ');
                count++;
                cost += seatPrice;
                updateSummaryDisplay();

            } else if (currentColor === 'rgb(176, 224, 230)') {
                alert('Cannot select sold seats');
                return;

            } else {
                div.style.backgroundColor = '#ffc0cb';
                div.style.color = 'black';
                document.querySelectorAll('.placeholder-box').forEach(one => {
                    if (one.innerHTML == div.innerHTML)
                        one.remove();
                })
                selectedSeatLabels.delete(div.innerHTML);
                summary.textContent = Array.from(selectedSeatLabels).join(', ');
                count--;
                cost -= seatPrice;
                updateSummaryDisplay();
            }
        });
    });
}
const urlParams = new URLSearchParams(window.location.search);

const tmdbid = window.location.pathname.split('/').pop();

const date = urlParams.get('date');
const day = urlParams.get('day');
const month = urlParams.get('month');
const lang = urlParams.get('lang');
const format = urlParams.get('format');
const time = urlParams.get('time');
const theatre = urlParams.get('theatre');
async function sendSeatsToBackend() {

    const dataToSend = {
        tmdbid,
        date,
        day,
        month,
        lang,
        format,
        time,
        theatre,
        seats: finalseats
    };
    try {
        const res = await axios.post('/admin/showtime/update', dataToSend)
    }
    catch (err) {
        console.log(err);
    }

}
book.addEventListener('click', function (e) {
    const totalCost = cost + 100;
    if (totalCost == 100) {
        alert('Select seats');
        return;
    }
    finalseats.length = 0;
    document.querySelectorAll('.placeholder-box').forEach(one => {
        finalseats.push(one.textContent);
    })

    const options = {
        key: "rzp_test_s6SKXE2OTgq7sH",
        amount: Number(totalCost) * 100,
        currency: "INR",
        name: "Tsoonami",
        image: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
        handler: async function (response) {
            alert("Payment Successful!");

            const bookingData = {
                payment_id: response.razorpay_payment_id,
                tmdbid,
                date,
                day,
                month,
                lang,
                format,
                time,
                theatre,
                seats: finalseats.join('\n'),
                cost: totalCost
            };

            try {
                const res = await axios.post('/user/confirmation', bookingData);

                // Axios throws on HTTP errors, so if we are here, status is 2xx
                const data = res.data;

                // Redirect to confirmation page using ticketCode
                window.location.href = `/user/confirmation/${encodeURIComponent(data.ticketCode)}`;
            } catch (err) {
                if (err.response && err.response.data && err.response.data.error) {
                    alert('Booking failed: ' + err.response.data.error);
                } else {
                    alert('An error occurred during booking.');
                }
                console.error('Error during booking:', err);
            }
        },
        prefill: {
            name: "Test User",
            email: "test@example.com",
            contact: "9999999999"
        },
        theme: {
            color: "#FF5B5C"
        }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
        alert("Payment Failed: " + response.error.description);
        console.error("Razorpay error", response.error);
    });
    rzp.open();
    e.preventDefault();
});

updateSummaryDisplay();

window.addEventListener('DOMContentLoaded', () => {
    attachSeatListeners();
    const allSeats = document.querySelectorAll('.seat');
    console.log(soldSeats);

    allSeats.forEach(seat => {
        const seatCode = seat.dataset.seat;
        if (soldSeats.includes(seatCode)) {
            console.log('hey');
            seat.classList.add('soldd');
        }
    });
});


