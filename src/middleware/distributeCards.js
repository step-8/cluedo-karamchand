const randomInt = (number) => Math.floor(Math.random() * number);

const getRandomCard = (deck) => deck[randomInt(deck.length)];

const getEnvelopeCards = (cards) => {
  const envelope = [];
  for (const deck in cards) {
    const randomCard = getRandomCard(cards[deck]);
    envelope.push(randomCard);
  }
  return envelope;
};

const getRemainingCards = (cards, envelope) => {
  const allCards = Object.values(cards).flat();
  return allCards.filter(card => !envelope.includes(card));
};

const shuffleCards = (deck) => {
  const cards = deck.slice();
  const shuffledCards = [];

  while (cards.length) {
    const [card] = cards.splice(randomInt(cards.length), 1);
    shuffledCards.push(card);
  }
  return shuffledCards;
};

const nextPlayer = (players, index) => {
  return players[index % players.length];
};

const distribute = (cards, players) => {
  let index = 0;
  let player = players[index];

  while (cards.length) {
    const card = cards.shift();
    player.addCard(card);
    index++;
    player = nextPlayer(players, index);
  }
};

const distributeCards = (cards) => (req, res, next) => {
  const { game } = req;
  if (game.isEnvelopePresent()) {
    return next();
  }
  const envelope = getEnvelopeCards(cards);
  game.addEnvelope(envelope);
  const remainingCards = getRemainingCards(cards, envelope);
  const shuffledCards = shuffleCards(remainingCards);
  distribute(shuffledCards, game.players);
  next();
};

module.exports = { distributeCards };
