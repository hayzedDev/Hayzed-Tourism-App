import axios from 'axios';
import { async } from 'regenerator-runtime';
import { showAlert } from './alert';

export const signup = async (name, email, pass, passConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password: pass,
        passwordConfirm: passConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Account Created! Please Check your Inbox On How To Get Started.'
      );
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
