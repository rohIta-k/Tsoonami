
const langcontainer = document.querySelector('#spec-lang');
const bigdate = document.querySelector('#date');
const datecontainer = document.querySelector('#inside-date');
const next = document.querySelector('#next');
const prev = document.querySelector('#prev');
const formatcontainer = document.querySelector('#bigformat');
const formatdropdown = document.querySelector('#formatdropdown');
const formatbutton = document.querySelector('#formatimg');
const citycontainer = document.querySelector('#bigcity');
const citydropdown = document.querySelector('#citydropdown');
const citybutton = document.querySelector('#cityimg');
const langscontainer = document.querySelector('#biglang');
const langdropdown = document.querySelector('#languagedropdown');
const langbutton = document.querySelector('#languageimg');
const theatrecontainer = document.querySelector('#theatres');
const theatredropdown = document.querySelector('#theatredropdown');
const addtheatresimg = document.querySelector('#addtheatresimg');
const trailerlangs = document.querySelectorAll('#popuptitle button');
const frame = document.querySelector('iframe');
const closebtn = document.querySelector('#close');
const seetrailer = document.querySelector('#watchtrailer');
const addupdatebtn = document.querySelector('#add-update');


let trailers = [];
let start = new Date();
let weekindex = 0;
let selectedday;
let selectedmonth;
let selecteddate;
let selectedcity;
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
            loadfromlocalstorage(selectedcity);
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

let popularmovies = null;

function makeelements(all) {
    ulelement.innerHTML = '';
    for (const movie of all) {
        const newli = document.createElement('li');
        const hr = document.createElement('hr');
        newli.innerHTML = movie.title;
        newli.addEventListener('click', () => {
            results.style.display = 'none';
            window.location.href = `/admin/movie/${movie.id}`;
        })
        ulelement.appendChild(newli);
        ulelement.appendChild(hr);
    }
}

async function getpopularmovies() {
    const res = await axios.get('/api/tmdb/popular');
    popularmovies = res.data;
}
await getpopularmovies();

searchinput.addEventListener('focus', () => {
    results.style.display = 'block';
    makeelements(popularmovies);
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
        makeelements(popularmovies);
        return;
    }
    try {
        const res = await axios.get(`/api/tmdb/search?q=${encodeURIComponent(searched)}`);
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
        loadfromlocalstorage(selectedcity);
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
        loadfromlocalstorage(selectedcity);
    })
})


citybutton.addEventListener('click', () => {
    if (citydropdown.style.display == "block")
        citydropdown.style.display = 'none';
    else {
        citydropdown.style.display = "block";
    }

});

document.querySelectorAll('#cityid li').forEach(li => {
    li.addEventListener('click', async () => {
        console.log(JSON.parse(localStorage.getItem('moviedetailspagedraft')));
        const prevcity = selectedcity;

        if (prevcity && prevcity !== 'City') {
            console.log(`Saving before switch from ${prevcity}`);
            savetolocalstorage(prevcity);
        }
        selectedcity = li.innerHTML.trim();
        document.querySelector('#bigcity button').innerHTML = selectedcity;
        const res = await axios.get(`/api/cities/${li.innerHTML}/theatres`);
        response = res.data;
        citydropdown.style.display = 'none';
        theatredropdown.style.display = 'none';
        document.querySelector('#theatres button').innerHTML = 'Add Theatres';
        loadFromDatabase();
        loadfromlocalstorage(li.innerHTML);
    })
})

addtheatresimg.addEventListener('click', () => {
    if (document.querySelector('#bigcity button').innerHTML == 'City') {
        alert('Select City first');
    }
    else {
        if (theatredropdown.style.display == "block")
            theatredropdown.style.display = 'none';
        else {
            if (response.theatres.length != 0) {
                maketheatres(response.theatres);
                theatredropdown.style.display = "block";
            }
            else
                alert(response.message);
        }
    }

});

function maketheatres(theatres) {
    const theatreList = document.querySelector('#theatreid');
    theatreList.innerHTML = '';

    if (theatres.length === 0) return;

    for (const theatre of theatres) {
        const li = theatrelistitem(theatre);
        const div = document.createElement('div');
        theatreList.appendChild(li);
        theatreList.appendChild(div);
    }
}

function theatrelistitem(theatre) {
    const li = document.createElement('li');
    li.innerHTML = theatre.name;

    li.addEventListener('click', () => {

        if (!selectedcity || selectedcity === 'City') {
            alert('Please select a city first.');
            return;
        }

        if (!selectedformat || selectedformat === 'Format') {
            alert('Please select a format first.');
            return;
        }

        if (!selecteddate) {
            alert('Please select a date first.');
            return;
        }
        if (!selectedlanguage) {
            alert('Please select a language first.');
            return;
        }
        const isduplicate = istheatreduplicate(theatre.name);
        theatredropdown.style.display = 'none';

        if (isduplicate) {
            alert('Theatre already added');
            return;
        }

        const theatrecard = createtheatrecard(theatre);
        document.querySelector('#about-theatres').appendChild(theatrecard);
        document.querySelector('#about-theatres').appendChild(document.createElement('hr'));
        savetolocalstorage();
    });

    return li;
}

function istheatreduplicate(name) {
    const alltitles = document.querySelectorAll('.movie-title');
    return Array.from(alltitles).some(title => title.innerHTML === name);
}
function clean(val) {
    return encodeURIComponent(String(val || '').replace(/\s+/g, ' ').trim());
}
function convertTo12Hour(time24) {
    const [hour, minute] = time24.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12; // 0 becomes 12
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}


function createtheatrecard(theatre) {
    const bigdiv = document.createElement('div');
    bigdiv.classList.add('about-one');
    bigdiv.setAttribute('data-location', theatre.location);

    const subdiv = document.createElement('div');
    subdiv.classList.add('name-info');

    const titleplus = document.createElement('div');
    titleplus.classList.add('name-close');

    const title = document.createElement('span');
    title.classList.add('movie-title');
    title.innerHTML = theatre.name;

    const close = document.createElement('span');
    close.classList.add('material-symbols-outlined');
    close.innerHTML = 'close';
    close.addEventListener('click', () => {
        bigdiv.remove()
        savetolocalstorage();
    });

    titleplus.appendChild(title);
    titleplus.appendChild(close);

    const infospan = createinfobutton(theatre);
    subdiv.appendChild(titleplus);
    subdiv.appendChild(infospan);

    const showtimediv = document.createElement('div');
    showtimediv.classList.add('manage-showtime');

    const allshowtimes = document.createElement('div');
    allshowtimes.classList.add('all-showtimes');

    const addbtn = document.createElement('button');
    addbtn.classList.add('plus');
    addbtn.innerHTML = '+';
    addbtn.addEventListener('click', () => {
        const parent = addbtn.parentElement;
        const existingtimeinputs = parent.querySelectorAll('input[type="time"]');

        for (let input of existingtimeinputs) {
            if (!input.value) {
                alert("Please set time for all existing showtimes before adding a new one.");
                return;
            }
        }
        const oneshowtime = document.createElement('div');
        oneshowtime.classList.add('each-showtime');

        // Create time input and subtract inside this scope
        const timeinput = document.createElement('input');
        timeinput.type = 'time';
        timeinput.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        timeinput.addEventListener('focus', (e) => {
            e.stopPropagation();
        });
        timeinput.addEventListener('change', () => {
            sortshowtimes(allshowtimes);
            savetolocalstorage();
        });

        // Subtract button
        const subtract = document.createElement('span');
        subtract.classList.add('subtract');
        subtract.innerHTML = '-';
        subtract.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            // Don't redirect, just remove the block
            oneshowtime.remove();
            savetolocalstorage();
        });

        // Back button / label (optional UI element)
        const back = document.createElement('div');
        back.innerHTML = 'm';

        // Append all
        oneshowtime.appendChild(back);
        oneshowtime.appendChild(timeinput);
        oneshowtime.appendChild(subtract);

        // Main click for redirect
        oneshowtime.addEventListener('click', (e) => {
            // Protect from accidental redirect
            if (
                e.target.closest('.subtract') ||
                e.target.closest('input[type="time"]')
            ) {
                return;
            }
            console.log("Redirect triggered", e.target);


            const timeinputvalue = timeinput.value;
            if (!timeinputvalue) {
                alert('Please select a valid time');
                return;
            }

            const convertedtime = convertTo12Hour(timeinputvalue);
            const tselecteddate = clean(localStorage.getItem('selecteddate'));
            const tselectedmonth = clean(localStorage.getItem('selectedmonth'));
            const tselectedlanguage = clean(localStorage.getItem('selectedlanguage'));
            const tselectedformat = clean(localStorage.getItem('selectedformat'));
            const tselectedday = clean(localStorage.getItem('selectedday'));

            window.location.href = `/admin/showtime/${id}?date=${encodeURIComponent(tselecteddate)}&day=${encodeURIComponent(tselectedday)}&month=${encodeURIComponent(tselectedmonth)}&lang=${tselectedlanguage}&format=${tselectedformat}&time=${encodeURIComponent(convertedtime)}&theatre=${encodeURIComponent(theatre.name)}`;
        });
        allshowtimes.appendChild(oneshowtime);
        parent.insertBefore(allshowtimes, addbtn);
    })
    showtimediv.appendChild(allshowtimes);
    showtimediv.appendChild(addbtn);

    bigdiv.appendChild(subdiv);
    bigdiv.appendChild(showtimediv);


    return bigdiv;
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
function savetolocalstorage(cityOverride = null) {

    const selected = cityOverride || selectedcity;
    if (!selected || selected === 'City') return;
    if (!selecteddate || !selectedmonth) {
        return;
    }

    if (!selectedformat || selectedformat === 'Format') {
        return;
    }
    if (!selectedlanguage || selectedlanguage === 'Language') {
        return;
    }

    const data = [];

    document.querySelectorAll('.about-one').forEach(card => {
        const name = card.querySelector('.movie-title')?.innerText;
        const location = card.getAttribute('data-location') || '';
        const showtimes = Array.from(card.querySelectorAll('input[type="time"]'))
            .map(input => input.value)
            .filter(val => val);
        data.push({ name, location, showtimes });
    });
    const alldrafts = JSON.parse(localStorage.getItem('moviedetailspagedraft') || '{}');
    const fulldate = `${selecteddate}-${selectedmonth}`
    if (!alldrafts[selected]) alldrafts[selected] = {};
    if (!alldrafts[selected][fulldate]) alldrafts[selected][fulldate] = {};
    if (!alldrafts[selected][fulldate][selectedlanguage]) alldrafts[selected][fulldate][selectedlanguage] = {};
    alldrafts[selected][fulldate][selectedlanguage][selectedformat] = data;
    localStorage.setItem('moviedetailspagedraft', JSON.stringify(alldrafts));

    console.log(data);
    console.log(JSON.parse(localStorage.getItem('moviedetailspagedraft')));
}

function loadfromlocalstorage(city) {
    console.log(JSON.parse(localStorage.getItem('moviedetailspagedraft')));
    const alldrafts = JSON.parse(localStorage.getItem('moviedetailspagedraft') || '{}');
    const fulldate = `${selecteddate}-${selectedmonth}`;
    const data = alldrafts?.[city]?.[fulldate]?.[selectedlanguage]?.[selectedformat] || [];
    if (data == '')
        return;
    console.log(data);
    rendertheatreblocks(data);
}
function rendertheatreblocks(data = []) {
    document.querySelector('#about-theatres').innerHTML = '';

    for (let theatre of data) {
        const card = createtheatrecard({ name: theatre.name, location: theatre.location });
        const container = card.querySelector('.all-showtimes');

        for (let time of theatre.showtimes) {
            const oneshowtime = document.createElement('div');
            oneshowtime.classList.add('each-showtime');

            const timeinput = document.createElement('input');
            timeinput.type = 'time';
            timeinput.value=time;
            timeinput.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            timeinput.addEventListener('focus', (e) => {
                e.stopPropagation();
            });
            timeinput.addEventListener('change', () => {
                e.stopPropagation();
                sortshowtimes(allshowtimes);
            });

            const subtract = document.createElement('span');
            subtract.classList.add('subtract');
            subtract.innerHTML = '-';
            subtract.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                oneshowtime.remove();
            });

            const back = document.createElement('div');
            back.innerHTML = 'm';

            oneshowtime.appendChild(back);
            oneshowtime.appendChild(timeinput);
            oneshowtime.appendChild(subtract);


            oneshowtime.addEventListener('click', (e) => {
                if (
                    e.target.closest('.subtract') ||
                    e.target.closest('input[type="time"]')
                ) {
                    return;
                }
                console.log("Redirect triggered", e.target);


                const timeinputvalue = timeinput.value;
                if (!timeinputvalue) {
                    alert('Please select a valid time');
                    return;
                }

                const convertedtime = convertTo12Hour(timeinputvalue);
                const tselecteddate = clean(localStorage.getItem('selecteddate'));
                const tselectedmonth = clean(localStorage.getItem('selectedmonth'));
                const tselectedlanguage = clean(localStorage.getItem('selectedlanguage'));
                const tselectedformat = clean(localStorage.getItem('selectedformat'));
                const tselectedday = clean(localStorage.getItem('selectedday'));

                window.location.href = `/admin/showtime/${id}?date=${encodeURIComponent(tselecteddate)}&day=${encodeURIComponent(tselectedday)}&month=${encodeURIComponent(tselectedmonth)}&lang=${tselectedlanguage}&format=${tselectedformat}&time=${encodeURIComponent(convertedtime)}&theatre=${encodeURIComponent(theatre.name)}`;
            });
            container.appendChild(oneshowtime);
        }

        document.querySelector('#about-theatres').appendChild(card);
        document.querySelector('#about-theatres').appendChild(document.createElement('hr'));
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

addupdatebtn.addEventListener('click', async () => {
    try {
        const alldrafts = JSON.parse(localStorage.getItem('moviedetailspagedraft') || '{}');

        const res = await axios.post(`/api/theatres/${id}`, {
            data: alldrafts
        });

        alert(res.data.message);

        localStorage.removeItem('moviedetailspagedraft');
        localStorage.removeItem('selectedcity');
        localStorage.removeItem('selecteddate');
        localStorage.removeItem('selectedmonth');
        localStorage.removeItem('selectedformat');
        localStorage.removeItem('selectedlanguage');

        window.location.reload();

    } catch (err) {
        alert("Failed to update");
        console.error(err);
    }
});

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
    if (!citycontainer.contains(event.target)) {
        citydropdown.style.display = 'none';
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
    localStorage.removeItem('moviedetailspagedraft');

    document.querySelector('#bigcity button').innerText = 'City';
    document.querySelector('#bigformat button').innerText = 'Format';
    document.querySelector('#biglang button').innerText = 'Language';

    document.querySelectorAll('.date-card').forEach(card => {
        card.classList.remove('selected');
    });

    selectedcity = null;
    selecteddate = null;
    selectedmonth = null;
    selectedformat = null;
    selectedlanguage = null;

});

