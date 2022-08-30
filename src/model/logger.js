class Logger {
  #logs;

  constructor(logs = []) {
    this.#logs = logs;
  }

  get logs() {
    return this.#logs.map(log => ({ ...log }));
  }

  logRollDice(actor, result) {
    const log = { actor, action: 'roll-dice', result };
    this.#logs.push(log);
  }

  logSuspicion(actor, actionData) {
    const log = { actor, action: 'suspect', actionData };
    this.#logs.push(log);
  }

  logAccusation(actor, actionData) {
    const log = { actor, action: 'accuse', actionData };
    this.#logs.push(log);
  }

  logAccusationResult(actor, result) {
    const statusLog = { actor, action: 'accusation-status', result };
    const outcomeLog = { actor, action: 'accusation-outcome', result };
    this.#logs.push(statusLog, outcomeLog);
  }

  logRuleOut(actor) {
    const log = { actor, action: 'rule-out' };
    this.#logs.push(log);
  }

  logSecretPassage(actor) {
    const log = { actor, action: 'secret-passage' };
    this.#logs.push(log);
  }

  accept(visitor) {
    visitor.visitLogger(this);
  }
}

module.exports = { Logger };
