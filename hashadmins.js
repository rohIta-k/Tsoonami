const bcrypt = require('bcrypt');

const admins = [
  { email: "admin1@gmail.com", password: "Admin1112" },
  { email: "admin2@gmail.com", password: "Admin2223" }
];

async function hashPasswords() {
  for (let admin of admins) {
    const hashed = await bcrypt.hash(admin.password, 10);
    console.log(`{ email: "${admin.email}", password: "${hashed}" },`);
  }
}

hashPasswords();
