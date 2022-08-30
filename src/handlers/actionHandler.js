const diceRoller = () => Math.ceil(Math.random() * 6);

const rollDice = (req, res) => {
  const { game } = req;
  game.rollDice(diceRoller);

  res.sendStatus(200);
};

const handleAccusation = (req, res) => {
  const { body, game } = req;
  const { ...accusedCards } = body;
  game.accuse(accusedCards);

  res.sendStatus(201);
};

const acknowledgeAccusation = (req, res) => {
  const { game, session } = req;

  game.acknowledgeAccusation(session.userId);
  res.sendStatus(201);
};

const passTurn = (req, res) => {
  const { game } = req;
  game.passTurn();

  res.sendStatus(200);
};

const useSecretPassage = (req, res) => {
  const { game } = req;
  game.useSecretPassage();
  res.sendStatus(201);
};

const moveCharacter = (req, res) => {
  const { game } = req;
  const { position } = req.body;

  if (!game.isMoveAllowed(position)) {
    res.sendStatus(403);
    return;
  }

  game.move(position);
  res.sendStatus(201);
};

module.exports = {
  rollDice,
  handleAccusation,
  passTurn,
  useSecretPassage,
  moveCharacter,
  acknowledgeAccusation
};
