class Player {
  #playerId;
  #playerName;
  #characterName;
  #cards;
  #permissions;
  #hasAccused;

  constructor(playerId, playerName, characterName) {
    this.#playerId = playerId;
    this.#playerName = playerName;
    this.#characterName = characterName;
    this.#cards = [];
    this.#permissions = { rollDice: false, accuse: false, passTurn: false };
    this.#hasAccused = false;
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

  isYourId(id) {
    return this.#playerId === id;
  }

  enableDice() {
    this.#permissions.rollDice = true;
  }

  enablePassTurn() {
    this.#permissions.passTurn = true;
  }

  isAllowedToAccuse() {
    return !this.#hasAccused && this.#permissions.accuse;
  }

  allowToAccuse() {
    this.#permissions.accuse = true;
  }

  disableDice() {
    this.#permissions.rollDice = false;
  }

  disablePassTurn() {
    this.#permissions.passTurn = false;
  }

  get profile() {
    return {
      name: this.#playerName,
      character: this.#characterName
    };
  }

  accused() {
    this.#hasAccused = true;
  }

  get info() {
    return {
      playerId: this.#playerId,
      name: this.#playerName,
      character: this.#characterName,
      cards: this.#cards,
      permissions: this.#permissions
    };
  }
}

module.exports = { Player };
