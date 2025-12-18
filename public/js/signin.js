
const authUI = {
  loginSection: document.querySelector('#login-container'),
  registerSection: document.querySelector('#register-container'),
  logBtn: document.querySelector('#logbutton'),
  regBtn: document.querySelector('#regbutton'),
  messageBox: document.querySelector('.message'),
  loginForm: document.querySelector('#login-form'),
  regForm: document.querySelector('#register-form')
};

function switchTab(mode) {
  const isReg = mode === 'reg';
  
  authUI.loginSection.style.display = isReg ? 'none' : 'block';
  authUI.registerSection.style.display = isReg ? 'block' : 'none';
  
  authUI.regBtn.classList.toggle('active', isReg);
  authUI.logBtn.classList.toggle('active', !isReg);
  
  authUI.messageBox.innerHTML = '';
}

authUI.logBtn.addEventListener('click', () => switchTab('log'));
authUI.regBtn.addEventListener('click', () => switchTab('reg'));


const displayMsg = (msg, isError = true) => {
  authUI.messageBox.innerHTML = `<span style="color: ${isError ? '#ff5b5c' : '#28a745'};">${msg}</span>`;
};


authUI.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  displayMsg('Authenticating...', false);

  const email = document.querySelector('#login-email').value.trim();
  const password = document.querySelector('#login-password').value;

  try {
    const { data } = await axios.post('/auth/login', 
      { email, password }, 
      { withCredentials: true } 
    );
    

    if (data.token) localStorage.setItem('token', data.token);

    displayMsg(data.message || 'Login successful! Redirecting...', false);

    setTimeout(() => {
      window.location.href = data.role === 'admin' ? '/admin' : '/user';
    }, 800);

  } catch (err) {
    const errorMsg = err.response?.data?.message || err.response?.data || 'Login failed';
    displayMsg(errorMsg);
  }
});


authUI.regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  displayMsg('Creating account...', false);
  
  const formData = {
    name: document.querySelector('#register-name').value.trim(),
    email: document.querySelector('#register-email').value.trim(),
    password: document.querySelector('#register-password').value
  };

  try {
    const { data } = await axios.post('/auth/register', formData);
    displayMsg('Success! Check your email to verify your account.', false);

    setTimeout(() => switchTab('log'), 2500);
  } catch (err) {

    const errors = err.response?.data?.errors;
    displayMsg(Array.isArray(errors) ? errors.join(', ') : (err.response?.data?.message || 'Registration failed'));
  }
});