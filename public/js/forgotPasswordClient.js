import axios from 'axios';
import { async } from 'regenerator-runtime';
import { showAlert } from './alert';

export const forgotPasswordClient = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgotPassword',
      data: {
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        'Email successfully sent! Please check your inbox on how to reset your password.'
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 5000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const resetPasswordClient = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm,
      },
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Password Changed successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
