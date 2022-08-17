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

  addObserver(observer) {
    this.#observers.push(observer);
  }

  #notifyObservers() {
    this.#observers.forEach(observer => observer(this.#data));
  }
}
