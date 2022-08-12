const sendRequest = (method, path, content, cb) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, path);
  xhr.onload = () => {
    cb(xhr);
  };
  xhr.send(new URLSearchParams(content));
};

const playerHtml = player => {
  const character = player.character;
  return generateHTML(['div', { id: character, className: 'character' },
    ['img', { className: 'logo', src: `/images/${character}.png` }, ''],
    ['div', { className: 'player-name' }, player.name]]);
};

const addPlayers = ({ players, maxPlayers }) => {
  const playerList = players.map(playerHtml);
  const playersElement = document.querySelector('.players');
  playersElement.replaceChildren(...playerList);

  if (maxPlayers === playerList.length) {
    document.querySelector('form').submit();
  }
};

const generateLobby = () => {
  sendRequest('GET', '/api/game', '', (xhr) => {
    const game = JSON.parse(xhr.response);
    const roomId = 'Room ID: ' + game.gameId;
    document.querySelector('.room-id').replaceChildren(roomId);
    addPlayers(game);
  });
};

const updateLobby = () => {
  sendRequest('GET', '/api/game', '', (xhr) => {
    const game = JSON.parse(xhr.response);
    addPlayers(game);
  });
};

const main = () => {
  generateLobby();

  setInterval(() => {
    updateLobby();
  }, 100);
};

window.onload = main;
