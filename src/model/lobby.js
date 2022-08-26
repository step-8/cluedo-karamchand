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

  #rearrangePlayers() {
    this.#players.forEach((player, index) => {
      player.character = this.#characters[index];
    });
  }

  removePlayer(id) {
    const playerIndex = this.#players.findIndex((player) => player.id === id);
    const removedPlayer =
      playerIndex === -1 ? [] : this.#players.splice(playerIndex, 1);

    this.#rearrangePlayers();
    return removedPlayer;
  }

  getStats() {
    const players = this.#players.map(({ id, name, character }) => {
      return { id, name, character };
    });

    return { id: this.#id, maxPlayers: this.#maxPlayers, players };
  }
}

module.exports = { Lobby };
