const fetchJSON = (request) => fetch(request.url, request.options)
  .then(response => response.json())
  .catch(error => {
    throw new Error(error);
  });

const API = {
  getGame: () => fetchJSON({ url: '/api/game', options: { method: 'GET' } })
};
