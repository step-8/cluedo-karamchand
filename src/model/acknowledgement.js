class AwaitingAcklowledgement {
  #players;

  constructor(players) {
    this.#players = new Set(players);
  }

  acknowledgeFrom(player) {
    this.#players.delete(player);
  }

  hasEveryoneAcknowledged() {
    return this.#players.size === 0;
  }
}

module.exports = { AwaitingAcklowledgement };
