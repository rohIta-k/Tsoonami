document.querySelector('.profile-icon').addEventListener('click', function () {
    this.classList.toggle('active');
});

document.getElementById("personal").addEventListener("click", () => {
    window.location.href = "/userprofile#personal";
});

document.querySelector(".menu-item:nth-child(2)").addEventListener("click", () => {
    window.location.href = "/userprofile#account";
});

document.querySelector(".menu-item:nth-child(3)").addEventListener("click", () => {
    window.location.href = "/userprofile#bookingg";
});

document.querySelector(".menu-item:nth-child(4)").addEventListener("click", () => {
    window.location.href = "/userprofile#query";
});

document.querySelector('#logg').addEventListener('click', async () => {
    try {
        const res = await axios.post('/auth/logout');
        if (res.status === 200) {
            window.location.href = '/';
        }
    } catch (err) {
        console.error('Logout failed:', err);
        alert('Error logging out. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await axios.get('/location/info', {
            withCredentials: true
        });

        const userData = res.data;
        console.log(userData.location);

        if (!userData.location) {
            console.log('hey');
            showLocationPopup();
        } else {
            setDefaultLocation(userData.location);
        }
    } catch (err) {
        console.error(err);

        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            window.location.href = '/';
        } else {
            alert('Something went wrong. Please try again later.');
        }
    }
});

function setDefaultLocation(location) {
    localStorage.setItem('userLocation', location);
    document.getElementById('locname').innerText = location;
    getshowingmovies(location);
}

function showLocationPopup() {
    document.querySelector('.FullPopup').style.display = 'block';
    document.querySelector('#backdrop').style.display = 'block';
}

document.querySelector('#locname').addEventListener('click', () => {
    document.querySelector('.FullPopup').style.display = 'block';
    document.querySelector('#backdrop').style.display = 'block';
});

document.querySelectorAll('.Imgbox').forEach(box => {
    box.addEventListener('click', async () => {
        document.querySelector('#locname').innerHTML = box.querySelector('.Namebox').innerHTML;
        const locationValue = document.querySelector('#locname').innerHTML.trim();
        if (!locationValue) {
            alert('Please enter your location');
            return;
        }
        try {
            const res = await axios.post('/location',
                { location: locationValue },
                { withCredentials: true }
            );

            alert(res.data.message);
            setDefaultLocation(res.data.location);
            document.querySelector('.FullPopup').style.display = 'none';
            document.querySelector('#backdrop').style.display = 'none';
            getshowingmovies(box.querySelector('.Namebox').innerHTML);
        } catch (err) {
            console.error(err);
            alert('Your session expired. Please sign in again.');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    });
});

function renderMovies(allmovies) {
    document.querySelector('#nowshowing').innerHTML = '';
    document.querySelector('#upcomingmovies').innerHTML = '';
    if (allmovies.length != 0) {
        for (let movie of allmovies) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.addEventListener('click', () => {
                window.location.href = `/user/movie/${movie.omdbid}?q=${document.querySelector('#locname').innerHTML}`;
            });
            const mimg = document.createElement('img');
            mimg.src = movie.poster;
            mimg.loading = "lazy";
            card.appendChild(mimg);
            const newtwodiv = document.createElement('div');
            newtwodiv.classList.add('info');
            const newsubdiv = document.createElement('div');
            newsubdiv.innerHTML = movie.title;
            const secrow = document.createElement('div');
            secrow.classList.add('second-row');
            const newsubtwodiv = document.createElement('div');
            newsubtwodiv.innerHTML = `| ${movie.age} |`;
            newtwodiv.appendChild(newsubdiv);
            secrow.appendChild(newsubtwodiv);
            newtwodiv.appendChild(secrow);
            card.appendChild(newtwodiv);
            if (movie.status == 'nowshowing') {
                document.querySelector('#nowshowing').appendChild(card);
            }
            if (movie.status == 'upcoming') {
                document.querySelector('#upcomingmovies').appendChild(card);
            }
        }
    }
}

async function getshowingmovies(location) {
    let allmovies = await axios.get(`/api/theatres/user/movies?q=${location}`);
    allmovies = allmovies.data;
    console.log(allmovies);
    requestIdleCallback(() => {
        renderMovies(allmovies);
    });
}

const leftscroll = document.querySelector('#leftscroll');
const rightscroll = document.querySelector('#rightscroll');
const imagedisplay = document.querySelector('#showimage');

let banners = [];
let index = 0;
async function displaybanners() {
    try {
        const res = await axios.get('/api/banners');
        banners = res.data.map(b => b.image);
        if (banners.length > 0) imagedisplay.src = banners[index];
    }
    catch (err) {
        console.log(err);
    }
}

leftscroll.addEventListener('click', () => {
    if (banners.length === 0) return;
    index = (index - 1 + banners.length) % banners.length;
    imagedisplay.src = banners[index];
});

rightscroll.addEventListener('click', () => {
    if (banners.length === 0) return;
    index = (index + 1) % banners.length;
    imagedisplay.src = banners[index];
});

displaybanners();

const searchfield = document.querySelector('#searchfield');
const searchinput = document.querySelector('#searchfield input');
const results = document.querySelector('#results');
const ulelement = document.querySelector('#results-ul');

function makeelements(all) {
    ulelement.innerHTML = '';
    for (const movie of all) {
        const newli = document.createElement('li');
        const hr = document.createElement('hr');
        newli.innerHTML = movie.title;
        console.log(movie.title);
        newli.addEventListener('click', () => {
            results.style.display = 'none';
            console.log('clicked');
            window.location.href = `/user/movie/${movie.omdbid}?q=${document.querySelector('#locname').innerHTML}`;
            console.log('clicked');
        });
        ulelement.appendChild(newli);
        ulelement.appendChild(hr);
    }
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
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
}
searchinput.addEventListener('input', debounce(handlesearch, 300));

document.addEventListener('click', (event) => {
    if (!searchfield.contains(event.target) && !results.contains(event.target)) {
        results.style.display = 'none';
    }
});

const genredropdown = document.querySelector('#genree');
const genredetails = document.querySelector('#genredetail');
genredropdown.addEventListener('click', () => {
    genredetails.classList.toggle('hidden');
});

const languagedropdown = document.querySelector('#languagee');
const languagedetails = document.querySelector('#languagedetail');
languagedropdown.addEventListener('click', () => {
    languagedetails.classList.toggle('hidden');
});

function getSelectedGenreNames() {
    const selected = Array.from(document.querySelectorAll('#genredetail li.selected'));
    return selected.map(item => item.textContent.trim());
}

function getSelectedLanguageNames() {
    const selected = Array.from(document.querySelectorAll('#languagedetail li.selected'));
    return selected.map(item => item.textContent.trim());
}

async function fetchMoviesByGenres() {
    const selectedGenres = getSelectedGenreNames();
    const selectedLanguages = getSelectedLanguageNames();

    if (selectedGenres.length === 0 && selectedLanguages.length === 0) {
        getshowingmovies(document.querySelector('#locname').innerHTML);
        return;
    }

    const params = new URLSearchParams();

    selectedGenres.forEach(g => params.append('genres', g));
    selectedLanguages.forEach(l => params.append('languages', l));

    try {
        const res = await axios.get(`/admin/movie/genres/${document.querySelector('#locname').innerHTML}?${params.toString()}`);
        renderMovies(res.data);
    } catch (err) {
        console.log(err);
    }
}

document.querySelectorAll('#genredetail li').forEach(one => {
    one.addEventListener('click', async () => {
        one.classList.toggle('selected');
        await fetchMoviesByGenres();
    });
});

document.querySelectorAll('#languagedetail li').forEach(one => {
    one.addEventListener('click', async () => {
        one.classList.toggle('selected');
        await fetchMoviesByGenres();
    });
});