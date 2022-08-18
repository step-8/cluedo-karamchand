const { Game } = require('../model/game.js');
const { Board } = require('../model/board.js');
const { Character } = require('../model/character.js');

const randomIntBetween = (start, end) => {
  const diff = end - start;
  const randomNumber = Math.floor(Math.random() * diff);
  return randomNumber + start;
};

const generateGameId = () => {
  return Array(5).fill(0).map(() =>
    String.fromCharCode(randomIntBetween(65, 90))).join('');
};

const createCharacters = (charactersDetails) => {

  return charactersDetails
    .map(({ name, position }) => new Character(name, position));
};

const createGame =
  (gameId, maxPlayers, hostId, hostName, boardData) => {
    const { cellPositions, roomPositions, characterDetails } = boardData;

    const board = new Board(cellPositions, roomPositions);
    const characters = createCharacters(characterDetails);
    const game =
      new Game(gameId, maxPlayers, characters, board);

    game.addPlayer(hostId, hostName);

    return game;
  };

const hostGame = (games, boardData) => (req, res) => {
  let { maxPlayers } = req.body;
  const { userId, username } = req.session;

  maxPlayers = parseInt(maxPlayers);
  maxPlayers = maxPlayers > 2 && maxPlayers <= 6 ? maxPlayers : 3;

  const gameId = generateGameId();
  games[gameId] =
    createGame(gameId, maxPlayers, userId, username, boardData);
  req.session.gameId = gameId;

  res.redirect(`/lobby/${gameId}`);
};

module.exports = { hostGame };
