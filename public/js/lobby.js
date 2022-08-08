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
    ['div', { className: 'logo' }, ''],
    ['div', { className: 'character-name' }, character],
    ['div', { className: 'player-name' }, player.name]]);
};

const generateLobby = xhr => {
  const game = JSON.parse(xhr.response);
  const roomId = 'Room id: ' + game.gameId;
  document.querySelector('.room-id').replaceChildren(roomId);

  const playerList = game.players.map(playerHtml);
  const players = document.querySelector('.players');
  players.replaceChildren(...playerList);

  if (game.maxPlayers === playerList.length) {
    document.querySelector('form').submit();
  }
};

const updateLobby = () => {
  sendRequest('GET', '/api/game', '', generateLobby);
};

const main = () => {
  setInterval(() => {
    updateLobby();
  }, 1000);
};

window.onload = main;
