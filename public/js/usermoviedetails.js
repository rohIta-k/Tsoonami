document.querySelector('.homee').addEventListener('click', () => {
    window.location.href = '/user'
})
const langcontainer = document.querySelector('#spec-lang');
const bigdate = document.querySelector('#date');
const datecontainer = document.querySelector('#inside-date');
const next = document.querySelector('#next');
const prev = document.querySelector('#prev');
const formatcontainer = document.querySelector('#bigformat');
const formatdropdown = document.querySelector('#formatdropdown');
const formatbutton = document.querySelector('#formatimg');
const langscontainer = document.querySelector('#biglang');
const langdropdown = document.querySelector('#languagedropdown');
const langbutton = document.querySelector('#languageimg');
const trailerlangs = document.querySelectorAll('#popuptitle button');
const frame = document.querySelector('iframe');
const closebtn = document.querySelector('#close');
const seetrailer = document.querySelector('#watchtrailer');


let trailers = [];
let start = new Date();
let weekindex = 0;
let selectedday;
let selectedmonth;
let selecteddate;
const urlParams = new URLSearchParams(window.location.search);
const selectedcity = urlParams.get('q');
localStorage.setItem('selectedcity', selectedcity);
let response;
let selectedformat = '';
let selectedlanguage = '';
let currentStartDate = null;
let currentEndDate = null;
let weekIndex = 0;
let allDates = [];

function displaydates(start, releaseDate = null, status = 'nowshowing') {
    const base = new Date(start);
    const today = new Date();
    const limitDate = new Date(today);

    limitDate.setDate(today.getDate() + (status === 'nowshowing' ? 13 : 13));

    let startDate = new Date(base);
    if (status === 'upcoming' && releaseDate) {
        const release = new Date(releaseDate);
        const releaseOnlyDate = new Date(release.getFullYear(), release.getMonth(), release.getDate());
        if (releaseOnlyDate > startDate) {
            startDate = new Date(releaseOnlyDate);
        }
    }

    let endDate = new Date(limitDate);

    allDates = [];

    for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
    ) {
        allDates.push(new Date(date));
    }

    renderdatewindow();
}

function renderdatewindow() {
    datecontainer.innerHTML = '';

    const windowDates = allDates.slice(weekIndex * 7, weekIndex * 7 + 7);

    windowDates.forEach(date => {
        const day = date.toLocaleDateString('en-GB', { weekday: 'short' });
        const month = date.toLocaleDateString('en-GB', { month: 'short' });
        let daynumber = date.getDate();

        const newdiv = document.createElement('div');
        newdiv.classList.add('date-card');

        const mspan = document.createElement('span');
        mspan.innerHTML = month;
        mspan.classList.add('month');

        const yspan = document.createElement('span');
        yspan.innerHTML = daynumber;
        yspan.classList.add('datee');

        const espan = document.createElement('span');
        espan.innerHTML = day;
        espan.classList.add('day');

        newdiv.appendChild(mspan);
        newdiv.appendChild(yspan);
        newdiv.appendChild(espan);

        newdiv.addEventListener('click', () => {
            document.querySelectorAll('.date-card').forEach(card => {
                card.classList.remove('selected');
            });
            newdiv.classList.add('selected');

            selectedday = day;
            selectedmonth = month;
            selecteddate = daynumber;
            localStorage.setItem('selecteddate', selecteddate);
            localStorage.setItem('selectedmonth', selectedmonth);
            localStorage.setItem('selectedday', selectedday);
            loadFromDatabase();
        });

        datecontainer.appendChild(newdiv);
    });

    prev.disabled = weekIndex === 0;
    next.disabled = (weekIndex + 1) * 7 >= allDates.length;
}

next.addEventListener('click', () => {
    if ((weekIndex + 1) * 7 < allDates.length) {
        weekIndex++;
        renderdatewindow();
    }
});

prev.addEventListener('click', () => {
    if (weekIndex > 0) {
        weekIndex--;
        renderdatewindow();
    }
});


displaydates(start, mrelease, mstatus);

const searchfield = document.querySelector('#searchfield');
const searchinput = document.querySelector('#searchfield input')
const results = document.querySelector('#results');
const ulelement = document.querySelector('#results-ul');


function makeelements(all) {
    ulelement.innerHTML = '';
    for (const movie of all) {
        const newli = document.createElement('li');
        const hr = document.createElement('hr');
        newli.innerHTML = movie.title;
        newli.addEventListener('click', () => {
            results.style.display = 'none';
            window.location.href = `/user/movie/${movie.tmdbid}`;
        })
        ulelement.appendChild(newli);
        ulelement.appendChild(hr);
    }
}


searchinput.addEventListener('focus', () => {
    results.style.display = 'block';
});

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}

async function handlesearch(e) {
    const searched = e.target.value.trim();
    results.style.display = "block";
    ulelement.innerHTML = '';
    if (searched === '') {
        results.style.display = "block";
        ulelement.innerHTML = '';
        return;
    }
    try {
        const res = await axios.get(`/user/search?q=${encodeURIComponent(searched)}`);
        const searchedmovies = res.data;
        makeelements(searchedmovies);
    }
    catch (err) {
        console.log('failed to load movies');
        console.log(err);
    }
};
searchinput.addEventListener('input', debounce(handlesearch, 300));

document.addEventListener('click', (event) => {
    if (!searchfield.contains(event.target) && !results.contains(event.target)) {
        results.style.display = 'none';
    }
});

document.querySelector('.homee').addEventListener('click', () => {
    window.location.href = '/user';
})

langbutton.addEventListener('click', () => {
    if (langdropdown.style.display == "block")
        langdropdown.style.display = 'none';
    else
        langdropdown.style.display = "block";
});


document.querySelectorAll('#languageid li').forEach(li => {
    li.addEventListener('click', () => {
        selectedlanguage = li.innerHTML;
        localStorage.setItem('selectedlanguage', selectedlanguage);
        document.querySelector('#biglang button').innerHTML = li.innerHTML;
        langdropdown.style.display = 'none';
        loadFromDatabase();
    })
})


formatbutton.addEventListener('click', () => {
    if (formatdropdown.style.display == "block")
        formatdropdown.style.display = 'none';
    else
        formatdropdown.style.display = "block";
});


document.querySelectorAll('#formatid li').forEach(li => {
    li.addEventListener('click', () => {
        selectedformat = li.innerHTML;
        localStorage.setItem('selectedformat', selectedformat);
        document.querySelector('#bigformat button').innerHTML = li.innerHTML;
        formatdropdown.style.display = 'none';
        loadFromDatabase();
    })
})

function clean(val) {
    return encodeURIComponent(String(val || '').replace(/\s+/g, ' ').trim());
}
function convertTo12Hour(time24) {
    const [hour, minute] = time24.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // 0 becomes 12
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function sortshowtimes(container) {
    const showtimes = Array.from(container.querySelectorAll('.each-showtime'));

    showtimes.sort((a, b) => {
        const timeA = a.querySelector('input')?.value || '';
        const timeB = b.querySelector('input')?.value || '';
        return timeA.localeCompare(timeB);
    });
    showtimes.forEach(st => container.appendChild(st));
    savetolocalstorage();

}

function createinfobutton(theatre) {
    const infospan = document.createElement('span');
    infospan.classList.add('more-info');

    const infoicon = document.createElement('span');
    infoicon.classList.add('material-symbols-outlined');
    infoicon.style.fontSize = '12px';
    infoicon.innerHTML = 'info';

    const infotext = document.createElement('span');
    infotext.innerHTML = 'More Info';

    infospan.appendChild(infoicon);
    infospan.appendChild(infotext);

    infospan.addEventListener('click', () => {
        const popup = document.createElement('div');
        popup.classList.add('infopopup');

        const text = document.createElement('div');
        text.classList.add('infopopuptext');

        const label = document.createElement('span');
        label.innerHTML = 'Location:';

        const location = document.createElement('span');
        location.innerHTML = theatre.location;

        text.appendChild(label);
        text.appendChild(location);

        const closeicon = document.createElement('span');
        closeicon.classList.add('material-symbols-outlined');
        closeicon.innerHTML = 'close';
        closeicon.style.fontSize = '16px';
        closeicon.addEventListener('click', (e) => {
            e.stopPropagation();
            popup.remove();
        });

        popup.appendChild(text);
        popup.appendChild(closeicon);
        popup.style.display = 'flex';

        infospan.appendChild(popup);
    });

    return infospan;
}

function createtheatrecard(theatre) {
    const bigdiv = document.createElement('div');
    bigdiv.classList.add('about-one');
    bigdiv.setAttribute('data-location', theatre.location);

    const subdiv = document.createElement('div');
    subdiv.classList.add('name-info');

    const title = document.createElement('span');
    title.classList.add('movie-title');
    title.innerHTML = theatre.name;
    subdiv.appendChild(title);

    const infospan = createinfobutton(theatre);
    subdiv.appendChild(infospan);
    const allShowtimes = document.createElement('div');
    allShowtimes.classList.add('all-showtimes');
    bigdiv.appendChild(subdiv);
    bigdiv.appendChild(allShowtimes);
    return bigdiv;
}
function rendertheatreblocks(data = []) {
    let counttwo = 0;
    document.querySelector('#about-theatres').innerHTML = '';

    for (let theatre of data) {
        const card = createtheatrecard({ name: theatre.name, location: theatre.location });
        const container = card.querySelector('.all-showtimes');

        for (let time of theatre.showtimes) {
            const convertedTime = convertTo12Hour(time);

            const tselectedyear = new Date().getFullYear();

            const selectedDateObj = new Date(`${selectedmonth} ${selecteddate}, ${tselectedyear}`);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const isToday = selectedDateObj.getTime() === today.getTime();

            if (isToday) {
                const [timeStr, meridian] = convertedTime.split(' ');
                const [hours, minutes] = timeStr.split(':').map(Number);

                let showtimeDate = new Date();
                showtimeDate.setHours(meridian === 'PM' && hours !== 12 ? hours + 12 : (meridian === 'AM' && hours === 12 ? 0 : hours));
                showtimeDate.setMinutes(minutes);
                showtimeDate.setSeconds(0);

                const now = new Date();

                if (showtimeDate <= now) {
                    continue;
                }
            }
            counttwo++;
            const oneshowtime = document.createElement('div');
            oneshowtime.classList.add('each-showtime');

            const timee = document.createElement('div');
            timee.innerHTML = convertTo12Hour(time);

            oneshowtime.appendChild(timee);


            oneshowtime.addEventListener('click', (e) => {
                console.log("Redirect triggered", e.target);

                const convertedtime = convertTo12Hour(time);
                const tselecteddate = clean(localStorage.getItem('selecteddate'));
                const tselectedmonth = clean(localStorage.getItem('selectedmonth'));
                const tselectedlanguage = clean(localStorage.getItem('selectedlanguage'));
                const tselectedformat = clean(localStorage.getItem('selectedformat'));
                const tselectedday = clean(localStorage.getItem('selectedday'));

                window.location.href = `/user/showtime/${id}?date=${encodeURIComponent(tselecteddate)}&day=${encodeURIComponent(tselectedday)}&month=${encodeURIComponent(tselectedmonth)}&lang=${tselectedlanguage}&format=${tselectedformat}&time=${encodeURIComponent(convertedtime)}&theatre=${encodeURIComponent(theatre.name)}`;
            });
            container.appendChild(oneshowtime);
        }
        if (counttwo != 0) {
            document.querySelector('#about-theatres').appendChild(card);
            document.querySelector('#about-theatres').appendChild(document.createElement('hr'));
        }


    }

}

function setTrailer(videoid) {
    frame.src = `https://www.youtube.com/embed/${videoid}`;
}
const firstbutton = trailerlangs[0];
if (firstbutton) {
    setTrailer(firstbutton.dataset.videoid);
}

trailerlangs.forEach(btn => {
    btn.addEventListener('click', () => {
        trailerlangs.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const videoid = btn.dataset.videoid;
        setTrailer(videoid);
    });
});

closebtn.addEventListener('click', () => {
    document.querySelector('#backdrop').style.display = 'none';
    document.querySelector('#trailerspopup').style.display = 'none';
})

seetrailer.addEventListener('click', () => {
    document.querySelector('#backdrop').style.display = 'block';
    document.querySelector('#trailerspopup').style.display = 'flex';
})

async function loadFromDatabase() {
    if (selecteddate && selectedmonth && selectedlanguage && selectedcity && selectedformat) {
        console.log('done');
        const dateString = `${selecteddate}-${selectedmonth}`;

        try {
            const response = await axios.get('/api/theatres', {
                params: {
                    tmdbid: id,
                    date: dateString,
                    language: selectedlanguage,
                    format: selectedformat,
                    city: selectedcity
                }
            });

            const data = response.data
            console.log(data);

            rendertheatreblocks(data);

        } catch (error) {
            console.error('Error loading from DB:', error.message);
        }
    }
}

document.addEventListener('click', (event) => {
    if (!formatcontainer.contains(event.target)) {
        formatdropdown.style.display = 'none';
    }
    if (!langscontainer.contains(event.target)) {
        langdropdown.style.display = 'none';
    }
});


window.addEventListener('load', () => {

    localStorage.removeItem('selectedcity');
    localStorage.removeItem('selecteddate');
    localStorage.removeItem('selectedmonth');
    localStorage.removeItem('selectedformat');
    localStorage.removeItem('selectedlanguage');
    localStorage.removeItem('selectedday');

    document.querySelector('#bigformat button').innerText = 'Format';
    document.querySelector('#biglang button').innerText = 'Language';

    document.querySelectorAll('.date-card').forEach(card => {
        card.classList.remove('selected');
    });

    selecteddate = null;
    selectedmonth = null;
    selectedformat = null;
    selectedlanguage = null;

});

