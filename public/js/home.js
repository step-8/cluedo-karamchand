const showErrorMessage = () => {
  const cookie = document.cookie;

  if (cookie !== 'error=40') {
    return;
  }

  const errorMessageElement = document.querySelector('.error-message');
  errorMessageElement.innerText = 'Please enter valid room-id';
};

window.onload = showErrorMessage;
