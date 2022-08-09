class Player {
  #playerId;
  #playerName;
  #characterName;
  #cards;

  constructor(playerId, playerName, characterName) {
    this.#playerId = playerId;
    this.#playerName = playerName;
    this.#characterName = characterName;
    this.#cards = [];
  }

  equals(otherPlayer) {
    return otherPlayer instanceof Player &&
      otherPlayer.#playerId === this.#playerId &&
      otherPlayer.#playerName === this.#playerName &&
      otherPlayer.#characterName === this.#characterName;
  }

  addCard(card) {
    this.#cards.push(card);
  }

  get profile() {
    return {
      name: this.#playerName,
      character: this.#characterName
    };
  }

  get info() {
    return {
      playerId: this.#playerId,
      name: this.#playerName,
      character: this.#characterName,
      cards: this.#cards
    };
  }
}

module.exports = { Player };
