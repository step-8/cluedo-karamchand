class Player {
  #playerId;
  #playerName;
  #characterName;
  #cards;
  #permissions;
  #hasAccused;
  #position;

  constructor(playerId, playerName, characterName, position) {
    this.#playerId = playerId;
    this.#playerName = playerName;
    this.#characterName = characterName;
    this.#position = position;
    this.#cards = [];
    this.#permissions =
      { rollDice: false, accuse: false, passTurn: false, suspect: false };
    this.#hasAccused = false;
  }

  set position(pos) {
    this.#position = pos;
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

  disableAccuse() {
    this.#permissions.accuse = false;
  }

  get profile() {
    return {
      name: this.#playerName,
      character: this.#characterName,
      position: this.#position
    };
  }

  accused() {
    this.#hasAccused = true;
    this.#permissions.accuse = false;
  }

  get info() {
    return {
      playerId: this.#playerId,
      name: this.#playerName,
      character: this.#characterName,
      position: this.#position,
      cards: this.#cards,
      permissions: this.#permissions
    };
  }
}

module.exports = { Player };
