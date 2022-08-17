class Poller {
  #pollFn;
  #interval;
  #intervalId;

  constructor(pollFn, interval) {
    this.#pollFn = pollFn;
    this.#interval = interval;
    this.#intervalId = null;
  }

  startPolling() {
    this.#intervalId = setInterval(this.#pollFn, this.#interval);
  }

  stopPolling() {
    clearInterval(this.#intervalId);
  }
}
