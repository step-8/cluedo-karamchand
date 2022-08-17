class GameState {
  #data;
  #observers;

  constructor() {
    this.#data = null;
    this.#observers = [];
  }

  setData(newData) {
    this.#data = newData;
    this.#notifyObservers();
  }

  canRollDice() {
    return this.#data.you.permissions.rollDice;
  }

  canPassTurn() {
    return this.#data.you.permissions.passTurn;
  }

  canAccuse() {
    return this.#data.you.permissions.accuse;
  }

  canSuspect() {
    return this.#data.you.permissions.suspect;
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

  get envelope() {
    return this.#data.envelope;
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }

  #notifyObservers() {
    this.#observers.forEach(observer => observer(this.#data));
  }
}
