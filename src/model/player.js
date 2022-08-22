class Player {
  #playerId;
  #playerName;
  #characterName;
  #cards;
  #hasAccused;
  #position;
  #permissions;

  constructor(playerId, playerName, characterName, position) {
    this.#playerId = playerId;
    this.#playerName = playerName;
    this.#characterName = characterName;
    this.#position = position;
    this.#cards = [];
    this.#permissions = new Set();
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

  isAllowed(action) {
    return this.#permissions.has(action);
  }

  enable(action) {
    this.#permissions.add(action);
  }

  disable(action) {
    this.#permissions.delete(action);
  }

  accused() {
    this.#hasAccused = true;
    this.#permissions.clear();
    this.#permissions.add('pass-turn');
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
      permissions: [...this.#permissions]
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
