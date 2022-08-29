const diceRoller = () => Math.ceil(Math.random() * 6);

const rollDice = (req, res) => {
  const { game } = req;
  game.rollDice(diceRoller);

  res.sendStatus(200);
};

const handleAccusation = (games) => (req, res) => {
  const { body, game } = req;
  const { ...accusedCards } = body;
  game.accuse(accusedCards);

  res.sendStatus(201);
};

const acknowledgeAccusation = (req, res) => {
  const { game, session } = req;

  const status = game.acknowledgeAccusation(session.userId);
  if (status) {
    return res.sendStatus(201);
  }

  res.sendStatus(403);
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
  game.move(JSON.parse(position));
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
