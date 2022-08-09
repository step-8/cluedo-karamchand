const { Player } = require('./player.js');

class Game {
  #gameId;
  #maxPlayers;
  #players;
  #characters;

  constructor(gameId, maxPlayers) {
    this.#gameId = gameId;
    this.#maxPlayers = maxPlayers;
    this.#players = [];
    this.#characters = [
      'scarlett',
      'mustard',
      'green',
      'white',
      'peacock',
      'plum'
    ];
  }

  equals(otherGame) {
    const isGameEqual = otherGame instanceof Game &&
      otherGame.#gameId === this.#gameId &&
      otherGame.#maxPlayers === this.#maxPlayers;

    const arePlayersEqual = otherGame.#players.every((player, index) => {
      return player.equals(this.#players[index]);
    });

    return isGameEqual && arePlayersEqual;
  }

  isReady() {
    return this.#maxPlayers === this.#players.length;
  }

  addPlayer(playerId, playerName) {
    if (this.isReady()) {
      return false;
    }

    const character = this.#characters[this.#players.length];
    const player = new Player(playerId, playerName, character);
    this.#players.push(player);
    return true;
  }

  get state() {
    const playerState = this.#players.map(player => player.info);

    return {
      gameId: this.#gameId,
      maxPlayers: this.#maxPlayers,
      characters: this.#characters,
      players: playerState
    };
  }
}

module.exports = { Game };
