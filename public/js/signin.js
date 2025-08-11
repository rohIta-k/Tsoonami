
const signin = document.querySelector('#register');
signin.style.display = 'none';

const login = document.querySelector('#login');
const signbutton = document.querySelector('#regbutton');
const logbutton = document.querySelector('#logbutton');
const messages = document.querySelector('.message');

let selected;

logbutton.addEventListener('click', () => {
  messages.innerHTML = '';
  selected = 'login';
  signbutton.classList.remove('active');
  logbutton.classList.add('active');
  signin.style.display = 'none';
  login.style.display = 'block';
});

signbutton.addEventListener('click', () => {
  messages.innerHTML = '';
  selected = 'signin';
  logbutton.classList.remove('active');
  signbutton.classList.add('active');
  login.style.display = 'none';
  signin.style.display = 'block';
});

document.querySelector('#login-submit').addEventListener('click', async (e) => {
  e.preventDefault();
  messages.innerHTML = '';

  const email = document.querySelector('#login-email').value.trim();
  const password = document.querySelector('#login-password').value;

  if (!email || !password) {
    messages.innerHTML = 'Please enter both email and password.';
    return;
  }

  try {
    const res = await axios.post('/auth/login', { email, password }, { withCredentials: true });

    messages.innerHTML = `<span style="color:green;">${res.data.message || 'Login successful'}</span>`;

    setTimeout(() => {
      if (res.data.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/user';
      }
    }, 500);

  } catch (err) {
    if (err.response?.status === 403) {
      messages.innerHTML = `<span style="color:red;">${err.response.data || 'Please verify your email before logging in'}</span>`;
    } else {
      messages.innerHTML = `<span style="color:red;">${err.response.data || 'Login failed'}</span>`;
    }
  }
});

document.querySelector('#register-submit').addEventListener('click', async (e) => {
  e.preventDefault();

  const name = document.querySelector('#register-name').value;
  const email = document.querySelector('#register-email').value;
  const password = document.querySelector('#register-password').value;
  const data = { name, email, password };

  try {
    const res = await axios.post('/auth/register', data);
    messages.innerHTML = `<span style="color:green;">${'Registration successful! Please check your email to verify your account'}</span>`;
    selected = 'login';
    signbutton.classList.remove('active');
    logbutton.classList.add('active');
    signin.style.display = 'none';
    login.style.display = 'block';
  }
  catch (err) {
    if (err.response?.data?.errors) {
      messages.innerHTML = `<span style="color:red;">${err.response.data.errors.join(', ') || 'Please verify your email before logging in'}</span>`;
    } else {
      messages.innerHTML = `<span style="color:red;">${err.response?.data?.message || 'Registration failed'}</span>`;

    }
  }
});


document.querySelectorAll('input').forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });
});
