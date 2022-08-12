class Player {
  #playerId;
  #playerName;
  #characterName;
  #cards;
  #permissions;

  constructor(playerId, playerName, characterName) {
    this.#playerId = playerId;
    this.#playerName = playerName;
    this.#characterName = characterName;
    this.#cards = [];
    this.#permissions = { rollDice: false, passTurn: false };
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

  enableDice() {
    this.#permissions.rollDice = true;
  }

  enablePassTurn() {
    this.#permissions.passTurn = true;
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
