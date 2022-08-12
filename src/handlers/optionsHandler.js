const diceRoller = () => Math.ceil(Math.random() * 6);

const rollDice = (req, res) => {
  const { game } = req;
  game.rollDice(diceRoller);
  game.disableDice();
  res.json(game.getState(req.session.userId));
};

module.exports = { rollDice };
