document.querySelector('.homee').addEventListener('click', () => {
  window.location.href = '/admin';
});
async function loadInquiries() {
  try {
    const res = await axios.get('/admin/inquiries');
    const inquiries = res.data.inquiries;

    const container = document.getElementById('inquiry-container');

    if (inquiries.length === 0) {
      container.innerHTML = "No inquiries found.";
      return;
    }

    container.innerHTML = inquiries.map(q => `
            <div class="one">
                <div class="user-info">
                    <span><strong>${q.userName} ${q.userLastName}</strong></span>
                    <span>${q.userEmail}</span>
                </div>
                <div class="query-text">
                    <p><strong>${q.inquiryType}:</strong> ${q.message}</p>
                    <small>${new Date(q.createdAt).toDateString()}</small>
                </div>
            </div>
        `).join('');

  } catch (err) {
    console.error("Failed to load inquiries", err);
  }
}

// Call the function
loadInquiries();