class Poller {
  #request;
  #state;
  #handlers;
  #intervalId;

  constructor(request) {
    this.#request = request;
    this.#state = null;
    this.#handlers = [];
    this.#intervalId = null;
  }

  #handle(newState) {
    if (this.#state === newState) {
      return;
    }
    this.#state = newState;
    this.#handlers.forEach(handler => handler(JSON.parse(newState)));
  }

  startPolling() {
    this.#intervalId = setInterval(() => {
      fetch(this.#request.url, this.#request.options)
        .then((response) => response.text())
        .then((newState) => this.#handle(newState));
    }, 1000);
  }

  stopPolling() {
    clearInterval(this.#intervalId);
  }

  addHandler(handler) {
    this.#handlers.push(handler);
  }
}
