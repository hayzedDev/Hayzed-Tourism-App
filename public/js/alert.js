export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.remove();
};

// type is either a success or an error
export const showAlert = (type, message, time = 5) => {
  hideAlert();
  const markUp = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);
  window.setTimeout(hideAlert, time * 1000);
};
