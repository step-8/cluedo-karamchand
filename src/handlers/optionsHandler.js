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
  const { session, body, game } = req;
  const { ...accusedCards } = body;
  game.accuse(session.userId, accusedCards);
  res.sendStatus(201);
};

const passTurn = (req, res) => {
  const { game } = req;
  game.passTurn();
  res.json(game.getState(req.session.userId));
};

module.exports = { rollDice, handleAccusation, passTurn };
