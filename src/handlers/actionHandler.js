const { findPossibleMoves } = require('../utils/findPossibleMoves.js');

const diceRoller = () => Math.ceil(Math.random() * 6);

const getPlayerCharacter = (player, characters) => {
  return characters.find(({ name }) => name === player.character);
};

const rollDice = (cellPositions) => (req, res) => {
  const { game, session: { userId } } = req;
  game.rollDice(diceRoller);

  const { diceValue, you, characters } = game.getState(userId);
  const { position } = getPlayerCharacter(you, characters);
  const moves = diceValue[0] + diceValue[1];
  const possibleMoves = findPossibleMoves(cellPositions, moves, position);

  game.injectPossibleMoves(possibleMoves);

  res.json(game.getState(userId));
};

const handleAccusation = (req, res) => {
  const { body, game } = req;
  const { ...accusedCards } = body;
  game.accuse(accusedCards);
  res.sendStatus(201);
};

const passTurn = (req, res) => {
  const { game } = req;
  game.passTurn();
  res.json(game.getState(req.session.userId));
};

const useSecretPassage = (req, res) => {
  const { game } = req;
  game.useSecretPassage();
  res.sendStatus(201);
};

const moveCharacter = (req, res) => {
  const { game } = req;
  const { position } = req.body;
  game.move(JSON.parse(position));
  res.sendStatus(201);
};

module.exports = {
  rollDice,
  handleAccusation,
  passTurn,
  useSecretPassage,
  moveCharacter
};
