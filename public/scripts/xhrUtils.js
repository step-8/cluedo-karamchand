const makeXhrRequest = (cb, method, path, body = '') => {
  const xhr = new XMLHttpRequest();

  xhr.onload = () => {
    if (xhr.status === 200) {
      cb(xhr);
      return;
    }
    console.log('Error in fetching', method, path);
  };
  xhr.open(method, path);
  xhr.send(body);
};

const get = (url, cb) => makeXhrRequest(cb, 'GET', url);

const post = (url, body, cb) => makeXhrRequest(cb, 'POST', url, body);
