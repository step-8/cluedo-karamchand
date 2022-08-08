const showErrorMessage = () => {
  const cookie = document.cookie;

  if (cookie !== 'error=30') {
    return;
  }

  const errorMessageElement = document.querySelector('.error-message');
  errorMessageElement.innerText = 'Provide your name!';
};

window.onload = showErrorMessage;
