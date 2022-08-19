const playerHtml = (player, you) => {
  const character = player.character;

  const usernameDom = [['div', { className: 'name' }, player.name]];
  if (character === you.character) {
    usernameDom.push(['div', {}, '(You)']);
  }

  return generateHTML(['div', { id: character, className: 'character' },
    ['div', { className: 'character-img' },
      ['img', { src: `/images/${character}.png` }, '']],
    ['div', { className: 'player-name' }, ...usernameDom]]);
};

const addPlayers = ({ players, maxPlayers, you }, poller) => {
  const playerList = players.map((player) => playerHtml(player, you));
  const playersElement = document.querySelector('.players');
  playersElement.replaceChildren(...playerList);

  if (maxPlayers === playerList.length) {
    poller.stopPolling();
    document.querySelector('#start-game').click();
  }
};

const generateLobby = (game) => {
  const username = game.you.name;
  document.querySelector('.username').innerText = `Hey ${username}!`;

  const roomId = 'Room ID: ' + game.gameId;
  document.querySelector('.room-id').replaceChildren(roomId);
  addPlayers(game);
};

const updateStatus = ({ players, maxPlayers }) => {
  const restOfPlayers = maxPlayers - players.length;
  const statusEle = document.querySelector('#status-msg');
  const msg = restOfPlayers > 1 ? 'players' : 'player';
  statusEle.innerText = `Waiting for ${restOfPlayers} ${msg}...`;
};

const updateLobby = (poller) => API.getGame()
  .then(gameData => {
    addPlayers(gameData, poller);
    updateStatus(gameData);
  });

const main = () => {
  API.getGame()
    .then(gameData => {
      generateLobby(gameData);
    })

  const poller = new Poller(() => updateLobby(poller), 500);
  poller.startPolling();
};

window.onload = main;
