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

const distributeCards = (cards, games) => (req, res, next) => {
  const game = games[req.session.gameId];
  const envelope = getEnvelopeCards(cards);
  const remainingCards = getRemainingCards(cards, envelope);
  const shuffledCards = shuffleCards(remainingCards);
};

module.exports = { distributeCards };
