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
    ['div', { className: 'character-img' },
      ['img', { src: `/images/${character}.png` }, '']],
    ['div', { className: 'player-name' }, player.name]]);
};

const addPlayers = ({ players, maxPlayers }) => {
  const playerList = players.map(playerHtml);
  const playersElement = document.querySelector('.players');
  playersElement.replaceChildren(...playerList);

  if (maxPlayers === playerList.length) {
    document.querySelector('#start-game').click();
  }
};

const generateLobby = () => {
  sendRequest('GET', '/api/game', '', (xhr) => {
    const game = JSON.parse(xhr.response);

    const username = game.you.name;
    document.querySelector('.username').innerText = `Hey ${username}!`;

    const roomId = 'Room ID: ' + game.gameId;
    document.querySelector('.room-id').replaceChildren(roomId);
    addPlayers(game);
  });
};

const updateStatus = ({ players, maxPlayers }) => {
  const restOfPlayers = maxPlayers - players.length;
  const statusEle = document.querySelector('.status');
  statusEle.innerText = `Waiting for ${restOfPlayers} players...`;
};

const updateLobby = () => {
  sendRequest('GET', '/api/game', '', (xhr) => {
    const game = JSON.parse(xhr.response);
    addPlayers(game);
    updateStatus(game);
  });
};

const main = () => {
  generateLobby();

  setInterval(() => {
    updateLobby();
  }, 500);
};

window.onload = main;
