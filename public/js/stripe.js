import 'regenerator-runtime/runtime';

import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { async } from 'regenerator-runtime';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    const stripe = await loadStripe(
      'pk_test_51KmAGYLnqQtGiopwMphGVnhuV3ivrS8rHYKcWGsMh4U5VVuNZy7zSOfvpxSXNEc7YJVUWXgJpT5xb55KAHR8JE2T00plAahiYW'
    );
    // 1) Get checkout session form the checkout endpoint on our server

    const session = await axios({
      method: 'GET',
      url: `/api/v1/booking/checkout-session/${tourId}`,
    });
    // console.log(session);
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
    // 2) Create checkout form + charge the credit card
  } catch (err) {
    showAlert('error', err);
    console.log(err);
  }
};
