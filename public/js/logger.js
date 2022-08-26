class Logger {
  #logs;
  #newLogs;

  constructor() {
    this.#logs = [];
    this.#newLogs = [];
  }

  addNewLogs(logs) {
    this.#logs = this.#newLogs;
    this.#newLogs = logs;
  }

  getLatestLogs() {
    return this.#newLogs.slice(this.#logs.length);
  }
}
