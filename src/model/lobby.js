const { isEqual } = require('../utils/isEqual.js');

class Lobby {
  #id;
  #maxPlayers;
  #characters;
  #players;

  constructor(id, maxPlayers, characters) {
    this.#id = id;
    this.#maxPlayers = maxPlayers;
    this.#characters = characters;
    this.#players = [];
  }

  equals(otherLobby) {
    return otherLobby instanceof Lobby &&
      this.#id === otherLobby.#id &&
      this.#maxPlayers === otherLobby.#maxPlayers &&
      isEqual([...this.#characters], otherLobby.#characters);
  }

  isFull() {
    return this.#players.length >= this.#maxPlayers;
  }

  addPlayer(id, name) {
    if (this.isFull()) {
      return false;
    }

    const character = this.#characters[this.#players.length];
    const player = { id, name, character };
    this.#players.push(player);
    return true;
  }

  getStats() {
    const players = this.#players.map(({ id, name, character }) => {
      return { id, name, character };
    });

    return { id: this.#id, maxPlayers: this.#maxPlayers, players };
  }
}

module.exports = { Lobby };
