const rollDice = (req, res) => {
  const { game } = req;
  game.rollDice();
  game.disableDice();
  res.end('');
};

module.exports = { rollDice };
