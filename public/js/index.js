import 'regenerator-runtime/runtime';

import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateUserSettings } from './upateSettings';
import { bookTour } from './stripe';
import {
  forgotPasswordClient,
  resetPasswordClient,
} from './forgotPasswordClient';
import { signup } from './signup';
import { async } from 'regenerator-runtime/runtime';
import { showAlert } from './alert';

// DOM elements
const userData = document.querySelector('.form-user-data');
const loginBtn = document.querySelector('.form--login-btn');
const signupBtn = document.querySelector('.btn--sign-up');
const forgotPasswordBtn = document.querySelector('.btn--forgot-password');
const resetPassword = document.querySelector('.reset--my-password');
const sendEmail = document.querySelector('.btn--send--forgetPassword--email');
const userPasswordBtn = document.querySelector('.form-user-settings');
const mapBox = document.getElementById('map');
const logoutBtn = document.querySelector('.nav__el--logout');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const photoInput = document.getElementById('photo');
const oldPasswordEl = document.getElementById('password-current');
const newPasswordEl = document.getElementById('password');
const newPasswordConfirmEl = document.getElementById('password-confirm');
const btnSavePassword = document.querySelector('.btn-save--password');
const booking = document.getElementById('book-tour');

// Delegation
if (mapBox) {
  const location = JSON.parse(mapBox.dataset.locations);
  displayMap(location);
}

if (loginBtn) {
  loginBtn.addEventListener('submit', async function (e) {
    e.preventDefault();
    const loginButton = document.querySelector('.btn--green');
    loginButton.textContent = 'LOGGING IN...';

    const email = document.querySelector('.form__input--email');
    const password = document.querySelector('.form__input--password');

    await login(email.value, password.value);
    loginButton.textContent = 'LOG IN';
    password.value = '';
  });
}
if (sendEmail)
  sendEmail.addEventListener('click', async (e) => {
    e.preventDefault();
    sendEmail.textContent = 'PROCESSING...';
    const email = document.getElementById('emailForgotPassword').value;
    await forgotPasswordClient(email);
    sendEmail.textContent = 'SEND EMAIL!';
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userData)
  userData.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = nameInput.value;
    const email = emailInput.value;
    const photo = photoInput.files[0];

    const form = new FormData();

    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);
    updateUserSettings(form, 'name, email & photo');
    // updateUserSettings({ name, email }, 'name & email');
  });

if (userPasswordBtn)
  userPasswordBtn.addEventListener('submit', async function (e) {
    e.preventDefault();
    btnSavePassword.textContent = 'Updating...';
    const oldPassword = oldPasswordEl.value;
    const newPassword = newPasswordEl.value;
    const newPasswordConfirm = newPasswordConfirmEl.value;

    await updateUserSettings(
      { oldPassword, newPassword, newPasswordConfirm },
      'password'
    );
    [oldPassword, newPassword, newPassword].forEach((el) => (el = ''));
    btnSavePassword.textContent = 'SAVE PASSWORD';
  });

if (booking)
  booking.addEventListener('click', function (e) {
    e.preventDefault();
    e.target.textContent = 'Processing...';
    const { tourId } = booking.dataset;

    bookTour(tourId);
  });
if (resetPassword)
  resetPassword.addEventListener('click', async (e) => {
    e.preventDefault();
    resetPassword.textContent = 'PROCESSING...';

    const passResetField = document.querySelector('.password--reset');
    const passResetConfirmField = document.querySelector(
      '.password--reset--confirm'
    );
    const token = window.location.pathname.split('/')[2];

    await resetPasswordClient(
      passResetField.value,
      passResetConfirmField.value,
      token
    );

    resetPassword.textContent = 'RESET PASSWORD';
    passResetField.value = '';
    passResetConfirmField.value = '';
  });

if (signupBtn)
  signupBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    signupBtn.textContent = 'CREATING ACCOUNT...';
    const name = document.querySelector('.form__input--signup-name');
    const email = document.querySelector('.form__input--email--signup');

    const password = document.getElementById('passwordSignup');

    const passwordConfirm = document.getElementById('passwordSignupConfirm');

    await signup(
      name.value,
      email.value,
      password.value,
      passwordConfirm.value
    );

    signupBtn.textContent = 'CREATE ACCOUNT';
    password.value = passwordConfirm.value = '';
  });

const alerts = document.querySelector('body').dataset.alert;

if (alerts) {
  showAlert('success', alerts, 10);

  const { host, pathname } = window.location;
  const pageAccessedByReload =
    (window.performance.navigation &&
      window.performance.navigation.type === 1) ||
    window.performance
      .getEntriesByType('navigation')
      .map((nav) => nav.type)
      .includes('reload');
  if (pageAccessedByReload) window.location.replace(`${host}${pathname}`);

  // window.location.href = `${host}${pathname}`;
}
