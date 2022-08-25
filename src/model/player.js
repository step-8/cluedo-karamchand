class Player {
  #playerId;
  #playerName;
  #characterName;
  #cards;
  #permissions;
  #hasAccused;
  #blockedRoom;

  constructor(playerId, playerName, characterName, cards) {
    this.#playerId = playerId;
    this.#playerName = playerName;
    this.#characterName = characterName;
    this.#cards = cards;
    this.#permissions = new Set();
    this.#hasAccused = false;
    this.#blockedRoom = null;
  }

  get id() {
    return this.#playerId;
  }

  get character() {
    return this.#characterName;
  }

  get hasAccused() {
    return this.#hasAccused;
  }

  set blockRoom(room) {
    this.#blockedRoom = room;
  }

  unblock() {
    this.#blockedRoom = null;
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

  canSuspectHere(room) {
    return this.#blockedRoom !== room;
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
      character: this.#characterName
    };
  }

  get info() {
    return {
      playerId: this.#playerId,
      name: this.#playerName,
      character: this.#characterName,
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
