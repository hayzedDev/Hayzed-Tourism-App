import axios from 'axios';
import { async } from 'regenerator-runtime';
import { showAlert } from './alert';

export const login = async (email, pass) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password: pass,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      // alert('Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);

    // alert(err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      if (window.location.pathname === '/me') {
        window.location.href = '/';
        return;
      }

      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out, please try again');
  }
};
