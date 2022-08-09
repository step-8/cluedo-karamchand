const showErrorMessage = () => {
  const cookie = document.cookie;

  if (cookie !== 'error=30') {
    return;
  }

  const errorMessageElement = document.querySelector('.error-message');
  errorMessageElement.innerText = 'Please enter username!';
};

window.onload = showErrorMessage;
