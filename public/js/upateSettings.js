import axios from 'axios';

import { async } from 'regenerator-runtime';
import { showAlert } from './alert';
// import User from '../../model/userModel';

export const updateUserSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
      setTimeout(() => {
        location.reload(true);
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
