const { findPossibleMoves } = require('./rollDiceHandler.js');

const diceRoller = () => Math.ceil(Math.random() * 6);

const rollDice = (cellPositions) => (req, res) => {
  const { game, session: { userId } } = req;
  game.rollDice(diceRoller);

  const { diceValue, you } = game.getState(userId);
  const moves = diceValue[0] + diceValue[1];
  const possibleMoves = findPossibleMoves(cellPositions, moves, you.position);
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

const handleSuspect = (req, res) => {
  const { session, body, game } = req;
  const { ...suspectedCards } = body;

  game.suspect(session.userId, suspectedCards);
  setTimeout(() => {
    game.stopSuspicionRes();
  }, 5000);
  res.sendStatus(201);
};

module.exports = { rollDice, handleAccusation, passTurn, handleSuspect };
