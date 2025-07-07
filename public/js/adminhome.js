const leftscroll = document.querySelector('#leftscroll');
const rightscroll = document.querySelector('#rightscroll');
const imagedisplay = document.querySelector('#showimage');
const images = ["https://img.freepik.com/premium-vector/realistic-popcorn-cinema-movie-watching-concept-online-filmshow-entertainment-3d-cinematic-objects-two-tickets-snack-drink-promotion-flyer-vector-horizontal-isolated-poster_176411-4140.jpg", "https://c8.alamy.com/comp/K36B8T/gladiator-gladiator-date-2000-K36B8T.jpg", "https://tse2.mm.bing.net/th/id/OIP.qPInwQjH7P3VHvWZuIBLCAAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"];
let index = 0;
leftscroll.addEventListener('click', () => {
    index -= 1;
    if (index === -1)
        index = (images.length) - 1;
    imagedisplay.src = images[index];
})
rightscroll.addEventListener('click', () => {
    index += 1;
    if (index === images.length)
        index = 0;
    imagedisplay.src = images[index];
})