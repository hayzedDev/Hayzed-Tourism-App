export const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.remove();
};

// type is either a success or an error
export const showAlert = (type, message) => {
  hideAlert();
  const markUp = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);
  window.setTimeout(hideAlert, 5000);
};
