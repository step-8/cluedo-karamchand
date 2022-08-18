const areObjectsEqual = (object1, object2) =>
  JSON.stringify(object1) === JSON.stringify(object2);

class GameState {
  #data;
  #myPermissions;
  #observers;

  constructor() {
    this.#data = null;
    this.#myPermissions = null;
    this.#observers = [];
  }

  setData(newData) {
    if (areObjectsEqual(this.#data, newData)) {
      return;
    }

    this.#data = newData;
    this.#myPermissions = this.#data.you.permissions;
    this.#notifyObservers();
  }

  canRollDice() {
    return this.#myPermissions.rollDice;
  }

  canPassTurn() {
    return this.#myPermissions.passTurn;
  }

  canAccuse() {
    return this.#myPermissions.accuse;
  }

  canSuspect() {
    return this.#myPermissions.suspect;
  }

  isMyTurn() {
    return this.#data.you.character === this.#data.currentPlayer.character;
  }

  hasAnyoneAccused() {
    return this.#data.accusation !== null;
  }

  hasAnyoneSuspected() {
    return this.#data.suspicion !== null;
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

  get suspicion() {
    console.log(this.#data.suspicion);
    return this.#data.suspicion;
  }

  get room() {
    return this.#data.you.room;
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }

  #notifyObservers() {
    this.#observers.forEach(observer => observer());
  }
}
