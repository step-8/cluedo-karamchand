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

  get id() {
    return this.#playerId;
  }

  get character() {
    return this.#characterName;
  }

  set position(newPosition) {
    this.#position = newPosition;
  }

  get hasAccused() {
    return this.#hasAccused;
  }

  addCards(cards) {
    this.#cards = cards;
  }

  isYourId(id) {
    return this.#playerId === id;
  }

  hasAnyOf(cards) {
    return cards.some(card => this.#cards.includes(card));
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

  isAllowedToSuspect() {
    return this.#permissions.suspect;
  }

  allowToAccuse() {
    this.#permissions.accuse = true;
  }

  enableSuspect() {
    this.#permissions.suspect = true;
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

  disableSuspect() {
    this.#permissions.suspect = false;
  }

  accused() {
    this.#hasAccused = true;
    this.#permissions.accuse = false;
    this.disableDice();
    this.disableSuspect();
    this.disablePassTurn();
  }

  get profile() {
    return {
      name: this.#playerName,
      character: this.#characterName,
      position: this.#position
    };
  }

  get info() {
    return {
      playerId: this.#playerId,
      name: this.#playerName,
      character: this.#characterName,
      position: this.#position,
      cards: [...this.#cards],
      permissions: { ...this.#permissions }
    };
  }

  equals(otherPlayer) {
    return otherPlayer instanceof Player &&
      otherPlayer.#playerId === this.#playerId &&
      otherPlayer.#playerName === this.#playerName &&
      otherPlayer.#characterName === this.#characterName;
  }
}

module.exports = { Player };
