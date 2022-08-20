const showErrorMessage = () => {
  const cookie = document.cookie;

  const errorMessageElement = document.querySelector('.error-message');
  if (cookie === 'error=40') {
    errorMessageElement.innerText = 'Please enter valid room id';
    return;
  }

  if (cookie === 'error=50') {
    errorMessageElement.innerText = 'Game already started!';
  }

};

window.onload = showErrorMessage;
