
document.querySelector('.homee').addEventListener('click', () => {
    window.location.href = '/user';
})
async function downloadTicket(ticketCode) {
    try {
        const res = await axios.get(`/user/confirmation/pdf/${encodeURIComponent(ticketCode)}`, { responseType: 'blob' });

        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${ticketCode}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Error downloading ticket:', error);
        alert(error.response?.data?.error || 'Failed to download ticket.');
    }
}


// Only download PDF when button is clicked
document.querySelector('.download-button').addEventListener('click', async () => {
    // Get the full URL path, e.g. "/user/confirmation/994ee6f0cf50bef8"
    const path = window.location.pathname;

    // Split by "/" and get the last part, which is the ticketCode
    const parts = path.split('/');
    const ticketCode = parts[parts.length - 1];

    console.log(ticketCode);  // "994ee6f0cf50bef8"

    await downloadTicket(ticketCode);
});
