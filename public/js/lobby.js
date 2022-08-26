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

const generateLobby = (lobby) => {
  const username = lobby.you.name;
  document.querySelector('.username').innerText = `Hey ${username}!`;

  const roomId = 'Room ID: ' + lobby.id;
  document.querySelector('.room-id').replaceChildren(roomId);
  addPlayers(lobby);
};

const updateStatus = ({ players, maxPlayers }) => {
  const restOfPlayers = maxPlayers - players.length;
  const statusEle = document.querySelector('#status-msg');
  const msg = restOfPlayers > 1 ? 'players' : 'player';
  statusEle.innerText = `Waiting for ${restOfPlayers} ${msg}...`;
};

const showLeavePopup = () => {
  document.querySelector('.popup-container').style.visibility = 'visible';
};

const closeLeavePopup = () => {
  document.querySelector('.popup-container').style.visibility = 'hidden';
};

const updateLobby = (poller) => API.getLobby()
  .then(lobbyStats => {
    addPlayers(lobbyStats, poller);
    updateStatus(lobbyStats);
  });

const setupLeavePopup = () => {
  document.querySelector('#leave-lobby').onclick = showLeavePopup;
  document.querySelector('#leave-cancel-btn').onclick = closeLeavePopup;
};

const main = () => {
  setupLeavePopup();

  API.getLobby()
    .then(lobbyStats => generateLobby(lobbyStats));

  const poller = new Poller(() => updateLobby(poller), 500);
  poller.startPolling();
};

window.onload = main;
