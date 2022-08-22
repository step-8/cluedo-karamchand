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
    return this.#myPermissions.includes('roll-dice');
  }

  canPassTurn() {
    return this.#myPermissions.includes('pass-turn');
  }

  canAccuse() {
    return this.#myPermissions.includes('accuse');
  }

  canSuspect() {
    return this.#myPermissions.includes('suspect');
  }

  canUseSecretPassage() {
    return this.#myPermissions.includes('secret-passage');
  }

  isMyTurn() {
    return this.you.character === this.#data.currentPlayer.character;
  }

  hasAnyoneAccused() {
    return this.#data.accusation !== null;
  }

  hasAnyoneSuspected() {
    return this.#data.suspicion !== null;
  }

  isSuspicionRuledOut() {
    return this.hasAnyoneSuspected() && this.suspicion.ruledOut;
  }

  amISuspicionBreaker() {
    return this.suspicion.suspicionBreaker === this.you.character;
  }

  didISuspect() {
    return this.suspicion.suspectedBy === this.you.character;
  }

  get you() {
    return this.#data.you;
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
    return this.#data.suspicion;
  }

  get room() {
    return this.you.room;
  }

  get characters() {
    return this.#data.characters;
  }

  get character() {
    return this.#data.characters.find(character =>
      character.name === this.you.character);
  }

  getTurnOrder() {
    const currentPlayerIndex = this.players.findIndex(({ character }) =>
      character === this.currentPlayer.character);

    const turnOrder = [
      ...this.players.slice(currentPlayerIndex + 1),
      ...this.players.slice(0, currentPlayerIndex)
    ];

    return turnOrder;
  }

  addObserver(observer) {
    this.#observers.push(observer);
  }

  #notifyObservers() {
    this.#observers.forEach(observer => observer());
  }
}
