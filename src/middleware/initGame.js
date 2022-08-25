const { Game } = require('../model/game.js');
const { Player } = require('../model/player.js');
const { Character } = require('../model/character.js');
const { Board } = require('../model/board.js');
const { Room } = require('../model/room.js');

const randomInt = (number) => Math.floor(Math.random() * number);

const distribute = (cards, count) => {
  let index = 0;
  return cards.reduce((sets, card) => {
    sets[index] = sets[index] || [];
    sets[index].push(card);
    index = (index + 1) % count;
    return sets;
  }, []);
};

const shuffleCards = (characters, rooms, weapons) => {
  const cards = [...characters, ...weapons, ...rooms];
  const shuffledCards = [];

  while (cards.length) {
    const [card] = cards.splice(randomInt(cards.length), 1);
    shuffledCards.push(card);
  }

  return shuffledCards;
};

const distributeCards = (cards, playersCount) => {
  const characters = [...cards.characters];
  const rooms = [...cards.rooms];
  const weapons = [...cards.weapons];

  const [character, room, weapon] =
    [characters, rooms, weapons].flatMap((suite) => {
      return suite.splice(randomInt(suite.length), 1);
    });
  const envelope = { character, room, weapon };

  const shuffledCards = shuffleCards(characters, rooms, weapons);
  const distributedCards = distribute(shuffledCards, playersCount);

  return { envelope, distributedCards };
};

const createPlayers = (playersInfo, cards) => {
  return playersInfo.map(({ id, name, character }, index) =>
    new Player(id, name, character, cards[index]));
};

const createCharacters = (charactersInfo) => {
  return charactersInfo.map(({ name, position }) =>
    new Character(name, position));
};

const createRooms = (roomsDetails) => {
  return roomsDetails.map(({ name, position, entryPoint, secretPassage }) =>
    new Room(name, position, entryPoint, secretPassage));
};

const createGame = (id, playersCount, playersInfo, gameDetails, cards) => {
  const { cellPositions, roomDetails, characterDetails } = gameDetails;

  const { envelope, distributedCards } = distributeCards(cards, playersCount);
  const players = createPlayers(playersInfo, distributedCards);
  const characters = createCharacters(characterDetails);
  const board = new Board(cellPositions, createRooms(roomDetails));

  return new Game(id, players, characters, envelope, board);
};

const initGame = (games, lobbies, gameDetails, cards) => (req, res, next) => {
  const { roomId } = req.session;
  const lobby = lobbies[roomId];

  if (!(roomId && lobby)) {
    return res.redirect('/');
  }

  if (!lobby.isFull()) {
    return res.redirect(`/lobby/${roomId}`);
  }

  if (games[roomId]) {
    return next();
  }

  const { id, players } = lobby.getStats();
  const playersCount = players.length;
  const game = createGame(id, playersCount, players, gameDetails, cards);
  game.start();

  games[id] = game;
  next();
};

module.exports = { initGame };
