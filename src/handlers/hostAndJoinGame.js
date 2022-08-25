const { Lobby } = require('../model/lobby.js');

const randomIntBetween = (start, end) => {
  const diff = end - start;
  const randomNumber = Math.floor(Math.random() * diff);
  return randomNumber + start;
};

const generateRoomId = () => {
  return Array(5).fill(0).map(() =>
    String.fromCharCode(randomIntBetween(65, 90))).join('');
};

const hostGame = (lobbies, characters) => (req, res) => {
  const { userId, username } = req.session;
  let { maxPlayers } = req.body;

  maxPlayers = parseInt(maxPlayers);
  maxPlayers = maxPlayers > 2 && maxPlayers <= 6 ? maxPlayers : 3;

  const roomId = generateRoomId();
  const lobby = new Lobby(roomId, maxPlayers, characters);
  lobby.addPlayer(userId, username);

  lobbies[roomId] = lobby;
  req.session.roomId = roomId;
  res.redirect(`/lobby/${roomId}`);
};

const joinGame = (req, res) => {
  const { lobby, session: { userId, username, roomId } } = req;

  if (lobby.isFull()) {
    res.cookie('error', '50', { maxAge: 3000 });
    return res.redirect('/');
  }

  lobby.addPlayer(userId, username);
  res.redirect(`/lobby/${roomId}`);
};

module.exports = { hostGame, joinGame };
