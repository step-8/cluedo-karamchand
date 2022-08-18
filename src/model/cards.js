const randomInt = (number) => Math.floor(Math.random() * number);

const distributeCards = (cards, count) => {
  let index = 0;
  return cards.reduce((sets, card) => {
    sets[index] = sets[index] || [];
    sets[index].push(card);
    index = (index + 1) % count;
    return sets;
  }, []);
};

class Cards {
  #characters;
  #rooms;
  #weapons;
  #envelope;
  #distributedCards;

  constructor() {
    this.#characters = [
      'scarlett',
      'mustard',
      'green',
      'peacock',
      'plum',
      'white'
    ];
    this.#rooms = [
      'kitchen',
      'ballroom',
      'conservatory',
      'billiard',
      'library',
      'study',
      'hall',
      'lounge',
      'dining'
    ];
    this.#weapons = [
      'revolver',
      'wrench',
      'dagger',
      'rope',
      'candlestick',
      'pipe'
    ];
    this.#envelope = null;
    this.#distributedCards = null;
  }

  #createEnvelope() {
    const characters = this.#characters;
    const [character] = characters.splice(randomInt(characters.length), 1);

    const rooms = this.#rooms;
    const [room] = rooms.splice(randomInt(rooms.length), 1);

    const weapons = this.#weapons;
    const [weapon] = weapons.splice(randomInt(weapons.length), 1);

    return { character, room, weapon };
  }

  #shuffleCards() {
    const cards = [...this.#characters, ...this.#weapons, ...this.#rooms];
    const shuffledCards = [];

    while (cards.length) {
      const [card] = cards.splice(randomInt(cards.length), 1);
      shuffledCards.push(card);
    }

    return shuffledCards;
  }

  distribute(setCount) {
    this.#envelope = this.#createEnvelope();
    const shuffledCards = this.#shuffleCards();
    this.#distributedCards = distributeCards(shuffledCards, setCount);
  }

  get info() {
    return {
      envelope: { ...this.#envelope },
      sets: [...this.#distributedCards]
    };
  }
}

module.exports = { Cards };
