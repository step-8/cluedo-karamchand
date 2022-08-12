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
  #accusation;
  #startingPositions;

  constructor(gameId, maxPlayers, startingPositions) {
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
    this.#envelope = {};
    this.#diceValue = [1, 1];
    this.#isStarted = false;
    this.#startingPositions = startingPositions;
    this.#accusation = null;
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

  #allowToAccuse() {
    this.currentPlayer.allowToAccuse();
  }

  #enablePermissions() {
    this.#enableDice();
    this.#allowToAccuse();
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
    const position = this.#startingPositions[character].position;

    const player = new Player(playerId, playerName, character, position);
    this.#players.push(player);
    return true;
  }

  addEnvelope(envelope) {
    this.#envelope = envelope;
  }

  isEnvelopeEmpty() {
    return Object.keys(this.#envelope).length === 0;
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

  #isAccusationCorrect(cards) {
    return Object.keys(cards).every(category =>
      cards[category] === this.#envelope[category]);
  }

  accuse(playerId, accusedCards) {
    const player = this.currentPlayer;

    if (!player.isYourId(playerId) || !player.isAllowedToAccuse()) {
      return false;
    }
    const result = this.#isAccusationCorrect(accusedCards);
    this.#accusation = {
      accuser: player.profile,
      accusedCards,
      result
    };
    player.accused();
    return true;
  }

  getState(playerId) {
    const playerState = this.#players.map(player => player.profile);
    const [you] = this.#players.filter(player =>
      player.info.playerId === playerId);

    const state = {
      gameId: this.#gameId,
      you: you.info,
      maxPlayers: this.#maxPlayers,
      characters: this.#characters,
      players: playerState,
      diceValue: this.#diceValue,
      currentPlayer: this.currentPlayer.profile,
      accusation: this.#accusation
    };

    if (this.#accusation && this.currentPlayer.isYourId(playerId)) {
      state.envelope = this.#envelope;
    }
    return state;
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
