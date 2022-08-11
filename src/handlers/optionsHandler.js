const rollDice = (req, res) => {
  const { game } = req;
  game.rollDice();
  game.disableDice();
  res.json(game.getState(req.session.userId));
};

module.exports = { rollDice };
