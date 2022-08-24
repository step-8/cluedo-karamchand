const isEqual = (array1, array2) =>
  array1.every((element, index) => element === array2[index]);

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

    return { id: this.#id, players };
  }
}

module.exports = { Lobby };