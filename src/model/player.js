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

  get hasAccused() {
    return this.#hasAccused;
  }

  addCards(cards) {
    this.#cards = cards;
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
}

module.exports = { Player };
