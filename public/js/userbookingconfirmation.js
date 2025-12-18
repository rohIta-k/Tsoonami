
document.querySelector('.homee').onclick = () => window.location.href = '/user';
async function downloadTicket(ticketCode) {
    if (!ticketCode) return alert('Invalid Ticket Code');

    try {

        const btn = document.querySelector('.download-button');
        const originalText = btn.innerText;
        btn.innerText = 'Downloading...';
        btn.disabled = true;

        const res = await axios.get(`/user/confirmation/pdf/${encodeURIComponent(ticketCode)}`, { 
            responseType: 'blob' 
        });


        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `TSOONAMI-Ticket-${ticketCode}.pdf`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        btn.innerText = originalText;
        btn.disabled = false;

    } catch (error) {
        console.error('Error downloading ticket:', error);
        alert('Could not download ticket. Please try again.');
        
        const btn = document.querySelector('.download-button');
        btn.innerText = 'Download Ticket';
        btn.disabled = false;
    }
}


document.querySelector('.download-button').addEventListener('click', async () => {

    const ticketCode = window.location.pathname.split('/').pop();

    if (ticketCode) {
        await downloadTicket(ticketCode);
    } else {
        alert('Ticket code not found.');
    }
});