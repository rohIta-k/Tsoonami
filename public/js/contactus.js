const formatcontainer = document.querySelector('#biginquiry');
const formatdropdown = document.querySelector('#inquirydropdown');
const formatbutton = document.querySelector('#inquiryimg');
let selectedquery;

formatbutton.addEventListener('click', () => {
    if (formatdropdown.style.display == "block")
        formatdropdown.style.display = 'none';
    else
        formatdropdown.style.display = "block";
});

document.querySelectorAll('#inquiryid li').forEach(li => {
    li.addEventListener('click', () => {
        console.log(li.innerHTML);
        selectedquery = li.innerHTML;
        localStorage.setItem('selectedquery', selectedquery);
        console.log(document.querySelector('#biginquiry button'));
        document.querySelector('#biginquiry button').innerHTML = li.innerHTML;
        formatdropdown.style.display = 'none';
    })
})

document.getElementById('submit').addEventListener('click', async (e) => {
    e.preventDefault();

    const inquiryType = document.querySelector('#biginquiry button').innerHTML.trim();

    const message = document.getElementById('issueDescription').value.trim();
    console.log(inquiryType, message);

    if (!inquiryType || !message) {
        alert('Please fill out all fields.');
        return;
    }

    try {
        const token = localStorage.getItem('token'); // user must be logged in

        if (!token) {
            alert('You must be logged in to send an inquiry.');
            return;
        }

        const res = await axios.post('/contact', {
            inquiryType,
            message
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        alert('Inquiry sent successfully!');
    } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to send inquiry.');
    }
});
