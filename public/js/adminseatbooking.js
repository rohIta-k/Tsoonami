document.querySelector('.homee').addEventListener('click', () => {
    window.location.href = '/admin'
})

const formatcontainer = document.querySelector('#bigformat');
const formatdropdown = document.querySelector('#formatdropdown');
const formatbutton = document.querySelector('#formatimg');
const modifiedSections = new Set();

const seatsData = {
    recliner: { rows: 0, columns: 0 },
    prime: { rows: 0, columns: 0 },
    classic: { rows: 0, columns: 0 }
};

formatbutton.addEventListener('click', () => {
    if (formatdropdown.style.display == "block")
        formatdropdown.style.display = 'none';
    else
        formatdropdown.style.display = "block";
});

const input = document.querySelector('#rows');
document.querySelectorAll('#formatid li').forEach(li => {
    li.addEventListener('click', () => {
        document.querySelector('#bigformat button').innerHTML = li.innerHTML;
        if (li.innerHTML === 'Recliner') {
            input.max = 3;
        } else {
            input.max = 5;
        }
        input.value = 1;
        formatdropdown.style.display = 'none';
    })
})

const make = document.querySelector('.book-tickets-button');

let count = 0;

make.addEventListener('click', () => {
    const section = document.querySelector('#bigformat button').innerHTML.toLowerCase();
    const rows = parseInt(document.querySelector('#rows').value, 10);
    const columns = parseInt(document.querySelector('#columns').value, 10);

    if (section == 'section') {
        alert('Select section first');
        return;
    }
    count++;
    if (section && seatsData[section]) {
        seatsData[section] = { rows, columns };
        modifiedSections.add(section);
    }
    const mainsection = document.querySelector(`#${section}seats`);
    mainsection.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('div');
        row.classList.add('sub-row');
        for (let j = 0; j < columns; j++) {
            const div = document.createElement('div');
            div.classList.add('seat');
            row.appendChild(div);
        }
        mainsection.appendChild(row);
    }

})

const url = new URL(window.location.href);
const pathnameParts = window.location.pathname.split('/');
const omdbid = pathnameParts[pathnameParts.length - 1]; 
const date = url.searchParams.get("date");
const month = url.searchParams.get("month");
const lang = url.searchParams.get("lang");
const format = url.searchParams.get("format");
const time = url.searchParams.get("time");
const theatre = url.searchParams.get("theatre");
const save = document.querySelector('#save');

save.addEventListener('click', async () => {
    if (count == 0) {
        alert('Nothing to save');
        return;
    }

    console.log(omdbid);

    const data = {
        omdbid, 
        date,
        month,
        language: lang,
        format,
        time,
        theatre,
    };
    modifiedSections.forEach(section => {
        data[section] = seatsData[section];
    });
    try {
        const res = await axios.post(`/admin/showtime/save`, data);
        alert(res.data.message);
    }
    catch (err) {
        console.log(err);
    }
})

const seatKey = `${omdbid}|${date}|${month}|${time}|${theatre}|${lang}|${format}`;

async function checkExistingLayout() {
    try {
        const res = await axios.get(`/admin/showtime/check/${seatKey}`);
        const layout = res.data.message;
        console.log(layout);
        if (layout == 'yes') {
            document.querySelector('.booking-summary-card').style.display = 'none';
            document.querySelector('#save').style.display = 'none';
            const seatContainers = [
                { id: 'reclinerseats' },
                { id: 'primeseats' },
                { id: 'classicseats' }
            ];

            let rowCharCode = 65;

            seatContainers.forEach(containerInfo => {
                const container = document.getElementById(containerInfo.id);
                if (!container) return;

                const rows = container.querySelectorAll('.sub-row');
                rows.forEach(row => {
                    const rowLabel = String.fromCharCode(rowCharCode++);
                    const seats = row.querySelectorAll('.seat');
                    seats.forEach((seat, index) => {
                        const seatLabel = `${rowLabel}${index + 1}`;
                        seat.textContent = seatLabel;
                        seat.setAttribute('data-seat', seatLabel);
                    });
                });
            });
            const allSeats = document.querySelectorAll('.seat');
            console.log(soldSeats);

            allSeats.forEach(seat => {
                const seatCode = seat.dataset.seat;
                if (soldSeats.includes(seatCode)) {
                    console.log('hey');
                    seat.classList.add('soldd');
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}
checkExistingLayout();