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
        selectedquery = li.innerHTML;
        document.querySelector('#biginquiry button').innerHTML = li.innerHTML;
        formatdropdown.style.display = 'none';
    })
})

document.getElementById('submit').addEventListener('click', async (e) => {
    e.preventDefault();

    const inquiryType = document.querySelector('#biginquiry button').innerHTML.trim();
    const message = document.getElementById('issueDescription').value.trim();
    
    if (inquiryType === 'Select Type' || inquiryType === '' || !message) {
        alert('Please fill out all fields.');
        return;
    }

    try {
        
        const res = await axios.post('/contact', {
            inquiryType,
            message
        }, {
            withCredentials: true 
        });

        alert('Inquiry sent successfully!');
        document.getElementById('issueDescription').value = '';
        document.querySelector('#biginquiry button').innerHTML = 'Select Type';
        
    } catch (err) {
        console.error(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            alert('Your session has expired. Please log in again.');
            window.location.href = '/';
        } else {
            alert(err.response?.data?.error || 'Failed to send inquiry.');
        }
    }
});