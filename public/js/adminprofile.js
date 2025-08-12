

document.querySelector('.homee').addEventListener('click', () => {
    window.location.href = '/admin'
})
document.addEventListener("DOMContentLoaded", () => {
    const inquirycontainer = document.getElementById('inquiry-container');


    inquiries.forEach(inquiry => {
        const inquiryCard = document.createElement("div");
        inquiryCard.classList.add("one");

        // Format date
        const createdDate = new Date(inquiry.createdAt);
        const formattedDate = createdDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        inquiryCard.innerHTML = `
      <div class="user-info">
      <div class='child'>
        <strong>Name:</strong> ${inquiry.name}
        </div> 
        <br>
        <div class='child'>
        <strong>Email:</strong> ${inquiry.email}
        </div>
         <br>
         <div class='child'>
        <strong>Inquiry Created:</strong> ${formattedDate}
        </div>
      </div>
      <div class="inquiry-details">
        <span><strong>Type:</strong> ${inquiry.inquiryType}</span><br>
        <div class="query">${inquiry.message}</div>
      </div>
    `;

        inquirycontainer.appendChild(inquiryCard);
    });

});