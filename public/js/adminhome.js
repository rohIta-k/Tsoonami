document.querySelector('.profile-icon').addEventListener('click', function () {
    this.classList.toggle('active');
});

document.getElementById("personal").addEventListener("click", () => {
    window.location.href = "/profile#personal";
});

document.querySelector(".menu-item:nth-child(2)").addEventListener("click", () => {
    window.location.href = "/profile#query";
});

document.querySelector('#adminlogg').addEventListener('click', () => {
    window.location.href = '/';
});

function renderMovies(allmovies) {
    if (allmovies.length != 0) {
        for (let movie of allmovies) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.addEventListener('click', () => {
                // Changed from tmdbid to omdbid
                window.location.href = `/admin/movie/${movie.omdbid}`;
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
            newsubtwodiv.innerHTML = `${movie.age}   |`;
            newtwodiv.appendChild(newsubdiv);
            secrow.appendChild(newsubtwodiv);
            const rembutton = document.createElement('button');
            rembutton.classList.add('removebutton');
            rembutton.innerHTML = 'Remove';
            rembutton.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    // Changed from tmdbid to omdbid
                    const res = await axios.delete(`/api/theatres/${movie.omdbid}`);
                    alert(res.data.message);
                    card.remove();
                } catch (err) {
                    console.error(err);
                    alert('Failed to delete the movie.');
                }
            })
            secrow.appendChild(rembutton);
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

async function getshowingmovies() {
    let allmovies = await axios.get(`/api/theatres/movies`);
    allmovies = allmovies.data;
    console.log(allmovies);
    requestIdleCallback(() => {
        renderMovies(allmovies);
    });
}
await getshowingmovies();

document.getElementById("bannerimage").addEventListener("change", function () {
    const fileInput = this;
    const fileNameDisplay = document.getElementById("file-name-display");

    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = fileInput.files[0].name;
    } else {
        fileNameDisplay.textContent = "No file chosen";
    }
});

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
            // OMDB search results usually return 'id' or 'imdbID'
            window.location.href = `/admin/movie/${movie.id}`;
        })
        ulelement.appendChild(newli);
        ulelement.appendChild(hr);
    }
}

async function getpopularmovies() {
    // Changed endpoint from tmdb to omdb
    const res = await axios.get('/api/omdb/popular');
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
        // Changed endpoint from tmdb to omdb
        const res = await axios.get(`/api/omdb/search?q=${encodeURIComponent(searched)}`);
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

const remove = document.querySelector('#removepopup');
remove.style.display = 'none';

const add = document.querySelector('#addpopup');
const addbutton = document.querySelector('#addbutton');
const removebutton = document.querySelector('#removebutton');

let selected;

addbutton.addEventListener('click', () => {
    selected = 'add';
    removebutton.classList.remove('active');
    addbutton.classList.add('active');
    remove.style.display = 'none';
    add.style.display = 'flex';
});

removebutton.addEventListener('click', () => {
    selected = 'remove';
    addbutton.classList.remove('active');
    removebutton.classList.add('active');
    add.style.display = 'none';
    remove.style.display = 'flex';
});

const citycontainer = document.querySelector('#addcity');
const citydropdown = document.querySelector('#citydropdown');

citycontainer.addEventListener('click', () => {
    if (citydropdown.style.display == "block")
        citydropdown.style.display = 'none';
    else
        citydropdown.style.display = "block";
});

document.querySelectorAll('#cityid li').forEach(li => {
    li.addEventListener('click', () => {
        document.querySelector('#addcity button').innerHTML = li.innerHTML;
        citydropdown.style.display = 'none'
    })
})

document.querySelector('#addtheatre').addEventListener('click', async () => {
    const selectedcity = document.querySelector('#addcity button').innerText.trim();
    const theatrename = document.querySelector('#filltheatre').value.trim();
    const theatrelocation = document.querySelector('#filllocation').value.trim()

    if (!theatrename || !theatrelocation || selectedcity === 'Select City') {
        alert('Please fill all details.');
        return;
    }

    try {
        const res = await axios.post(`/api/cities/${selectedcity}/theatres`, {
            name: theatrename,
            location: theatrelocation
        })
        if (res.status === 200) {
            alert(res.data.message);
            document.querySelector('#filltheatre').value = '';
            document.querySelector('#filllocation').value = '';
            document.querySelector('#addcity button').innerHTML = 'Select City';
        }
    }
    catch (err) {
        console.error(err.message);
        alert('Cannot add theatre');
    }
})

const citytwocontainer = document.querySelector('#removecity');
const citytwodropdown = document.querySelector('#remcitydropdown');
const theatredropdown = document.querySelector('#remtheatredropdown');
const managetheatresbutton = document.querySelector('#managetheatres');
const closebtn = document.querySelector('#close');

let response;

citytwocontainer.addEventListener('click', () => {
    if (citytwodropdown.style.display == "block")
        citytwodropdown.style.display = 'none';
    else {
        citytwodropdown.style.display = "block";
    }
});

document.querySelectorAll('#remcityid li').forEach(li => {
    li.addEventListener('click', async () => {
        document.querySelector('#removecity button').innerHTML = li.innerHTML;
        const res = await axios.get(`/api/cities/${li.innerHTML}/theatres`);
        response = res.data;
        citytwodropdown.style.display = 'none';
        theatredropdown.style.display = 'none';
        document.querySelector('#removetheatre button').innerHTML = 'Choose Theatre';
    })
})

function maketheatres(theatres) {
    if (theatres.length != 0) {
        document.querySelector('#remtheatreid').innerHTML = '';
        for (const theatre of theatres) {
            const newli = document.createElement('li');
            const hr = document.createElement('hr');
            newli.innerHTML = theatre.name;
            newli.addEventListener('click', () => {
                document.querySelector('#removetheatre button').innerHTML = newli.innerHTML;
                theatredropdown.style.display = 'none';
            })
            document.querySelector('#remtheatreid').appendChild(newli);
            document.querySelector('#remtheatreid').appendChild(hr);
        }
    }
}

document.querySelector('#removetheatre').addEventListener('click', () => {
    if (document.querySelector('#removecity button').innerHTML == 'Select City') {
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

document.querySelector('#removetheatree').addEventListener('click', async () => {
    const selectedcity = document.querySelector('#removecity button').innerText.trim();
    const theatrename = document.querySelector('#removetheatre button').innerText.trim();

    if (theatrename === 'Choose Theatre' || selectedcity === 'Select City') {
        alert('Please fill all details.');
        return;
    }

    try {
        const res = await axios.delete(`/api/cities/${selectedcity}/theatres/${theatrename}`);
        if (res.status === 200) {
            alert(res.data.message);
            document.querySelector('#removecity button').innerHTML = 'Select City';
            document.querySelector('#removetheatre button').innerHTML = 'Choose Theatre';
        }
    }
    catch (err) {
        console.error(err.message);
        alert('Cannot remove theatre');
    }
})

managetheatresbutton.addEventListener('click', () => {
    document.querySelector('#theatrespopup').style.display = 'flex';
    document.querySelector('#backdrop').style.display = 'block';
    document.querySelector('#bannerspopup').style.display = 'none';
})

closebtn.addEventListener('click', () => {
    document.querySelector('#theatrespopup').style.display = 'none';
    document.querySelector('#backdrop').style.display = 'none';
})

const managebanners = document.querySelector('#managebanners');
const addbannerbtn = document.querySelector('#addbannerbtn');
const closebannerbtn = document.querySelector('#closebannerpopup');

managebanners.addEventListener('click', () => {
    document.querySelector('#bannerspopup').style.display = 'flex';
    document.querySelector('#backdrop').style.display = 'block';
    document.querySelector('#theatrespopup').style.display = 'none';
})

addbannerbtn.addEventListener('click', async () => {
    const file = document.querySelector('#bannerimage');
    if (!file.files.length) {
        return alert('Please select an image.');
    }

    const formData = new FormData();
    formData.append('image', file.files[0]);

    try {
        await axios.post('/api/banners', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        file.value = '';
        await loadBanners();
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || 'Failed to upload banner.');
    }
});

async function loadBanners() {
    const bannerdisplay = document.querySelector('#bannerdisplay');
    bannerdisplay.innerHTML = '';
    try {
        const res = await axios.get('/api/banners');
        const banners = res.data;

        banners.forEach(banner => {
            const newdiv = document.createElement('div');
            newdiv.classList.add('parent');
            const img = document.createElement('img');
            img.src = banner.image;
            img.alt = 'Banner';
            img.classList.add('imgg');
            newdiv.appendChild(img);
            const delicon = document.createElement('button');
            delicon.classList.add('deletebanner');
            delicon.innerHTML = 'Delete';
            delicon.addEventListener('click', async () => {
                try {
                    const res = await axios.delete(`/api/banners/${banner._id}`);
                    await loadBanners();
                    alert(res.data.message);
                } catch (err) {
                    alert('Failed to delete banner');
                    console.error(err);
                }
            });

            newdiv.appendChild(delicon);
            bannerdisplay.appendChild(newdiv);
        });
    } catch (error) {
        alert('Failed to load banners.');
        console.error(error);
    }
}
await loadBanners();

closebannerbtn.addEventListener('click', () => {
    document.querySelector('#bannerspopup').style.display = 'none';
    document.querySelector('#backdrop').style.display = 'none';
})

document.addEventListener('click', (event) => {
    if (!citycontainer.contains(event.target)) {
        citydropdown.style.display = 'none';
    }
    if (!citytwocontainer.contains(event.target)) {
        citytwodropdown.style.display = 'none';
    }
    if (!document.querySelector('#removetheatre').contains(event.target)) {
        theatredropdown.style.display = 'none';
    }
});