const areObjectsEqual = (object1, object2) =>
  JSON.stringify(object1) === JSON.stringify(object2);

class GameState {
  #data;
  #myPersmissions;
  #observers;

  constructor() {
    this.#data = null;
    this.#myPersmissions = null;
    this.#observers = [];
  }

  setData(newData) {
    if (areObjectsEqual(this.#data, newData)) {
      return;
    }

    this.#data = newData;
    this.#myPersmissions = this.#data.you.permissions;
    this.#notifyObservers();
  }

  canRollDice() {
    return this.#myPersmissions.rollDice;
  }

  canPassTurn() {
    return this.#myPersmissions.passTurn;
  }

  canAccuse() {
    return this.#myPersmissions.accuse;
  }

  canSuspect() {
    return this.#myPersmissions.suspect;
  }

  isMyTurn() {
    return this.#data.you.character === this.#data.currentPlayer.character;
  }

  hasAnyoneAccused() {
    return this.#data.accusation !== null;
  }

  get possibleMoves() {
    return this.#data.possibleMoves;
  }

  get players() {
    return this.#data.players;
  }

  get currentPlayer() {
    return this.#data.currentPlayer;
  }

  get diceValue() {
    return this.#data.diceValue;
  }

  get accusation() {
    return this.#data.accusation;
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }

  #notifyObservers() {
    this.#observers.forEach(observer => observer());
  }
}
