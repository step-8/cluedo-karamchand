const { Player } = require('./player.js');

class Game {
  #gameId;
  #maxPlayers;
  #players;
  #characters;
  #currentPlayerIndex;
  #envelope;
  #diceValue;
  #isStarted;

  constructor(gameId, maxPlayers) {
    this.#gameId = gameId;
    this.#maxPlayers = maxPlayers;
    this.#players = [];
    this.#currentPlayerIndex = 0;
    this.#characters = [
      'scarlett',
      'mustard',
      'green',
      'white',
      'peacock',
      'plum'
    ];
    this.#envelope = [];
    this.#diceValue = [1, 1];
    this.#isStarted = false;
  }

  get players() {
    return this.#players;
  }

  get currentPlayer() {
    return this.#players[this.#currentPlayerIndex];
  }

  get isStarted() {
    return this.#isStarted;
  }

  isReady() {
    return this.#maxPlayers === this.#players.length;
  }

  #enablePermissions() {
    this.#enableDice();
    this.#enablePass();
  }

  #disablePermissions() {
    this.disableDice();
    this.disablePass();
  }

  start() {
    this.#isStarted = true;
    this.#enablePermissions();
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

  addEnvelope(envelope) {
    this.#envelope = envelope;
  }

  isEnvelopePresent() {
    return this.#envelope.length;
  }

  #enableDice() {
    this.currentPlayer.enableDice();
  }

  #enablePass() {
    this.currentPlayer.enablePassTurn();
  }

  #changePlayer() {
    let index = this.#currentPlayerIndex;
    index++;
    this.#currentPlayerIndex = index % this.#maxPlayers;
  }

  passTurn() {
    this.#disablePermissions();
    this.#changePlayer();
    this.#enablePermissions();
  }

  disableDice() {
    this.currentPlayer.disableDice();
  }

  disablePass() {
    this.currentPlayer.disablePassTurn();
  }

  rollDice(diceRoller) {
    this.#diceValue = [diceRoller(), diceRoller()];
    this.disableDice();
  }

  getState(playerId) {
    const playerState = this.#players.map(player => player.profile);
    const [you] = this.#players.filter(player =>
      player.info.playerId === playerId);

    return {
      gameId: this.#gameId,
      you: you.info,
      maxPlayers: this.#maxPlayers,
      characters: this.#characters,
      players: playerState,
      diceValue: this.#diceValue,
      currentPlayer: this.currentPlayer.profile
    };
  }

  equals(otherGame) {
    const areGamesEqual = otherGame instanceof Game &&
      otherGame.#gameId === this.#gameId &&
      otherGame.#maxPlayers === this.#maxPlayers;

    const arePlayersEqual = otherGame.#players.every((player, index) => {
      return player.equals(this.#players[index]);
    });

    return areGamesEqual && arePlayersEqual;
  }
}

module.exports = { Game };
