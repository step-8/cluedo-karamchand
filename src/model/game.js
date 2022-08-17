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
  #possibleMoves;
  #board;

  constructor(gameId, maxPlayers, characters, board) {
    this.#gameId = gameId;
    this.#maxPlayers = maxPlayers;
    this.#players = [];
    this.#currentPlayerIndex = 0;
    this.#characters = characters;
    this.#envelope = {};
    this.#diceValue = [1, 1];
    this.#isStarted = false;
    this.#accusation = null;
    this.#possibleMoves = [];
    this.#board = board;
  }

  get players() {
    return this.#players;
  }

  get currentPlayer() {
    return this.#players[this.#currentPlayerIndex];
  }

  get #currentPlayerCharacter() {
    return this.#characters[this.#currentPlayerIndex];
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

  #disableAccuse() {
    this.currentPlayer.disableAccuse();
  }

  #manageSuspectPermission() {
    const currentCharacter = this.#currentPlayerCharacter.position;
    if (this.#board.isInsideRoom(currentCharacter)) {
      return this.currentPlayer.enableSuspect();
    }

    this.currentPlayer.disableSuspect();
  }

  #disableSuspect() {
    this.currentPlayer.disableSuspect();
  }

  #enablePermissions() {
    this.#enableDice();
    this.#allowToAccuse();
    this.#enablePass();
    this.#manageSuspectPermission();
  }

  #disablePermissions() {
    this.disableDice();
    this.disablePass();
    this.#disableAccuse();
    this.#disableSuspect();
  }

  start() {
    this.#isStarted = true;
    this.#enablePermissions();
  }

  addPlayer(playerId, playerName) {
    if (this.isReady()) {
      return false;
    }

    const { name: characterName, position } =
      this.#characters[this.#players.length].info;

    const player = new Player(playerId, playerName, characterName, position);
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
    this.#possibleMoves = [];
    this.#disablePermissions();
    this.#changePlayer();
    this.#enablePermissions();
    this.#accusation = null;
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

  move(newPosition) {
    this.currentPlayer.position = newPosition;
    this.#currentPlayerCharacter.position = newPosition;
    this.#manageSuspectPermission();
    this.#possibleMoves = [];
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

  injectPossibleMoves(possibleMoves) {
    this.#possibleMoves = possibleMoves;
  }

  getState(playerId) {
    const playerState = this.#players.map(player => player.profile);
    const [you] = this.#players.filter(player =>
      player.info.playerId === playerId);

    const currentPlayerId = this.currentPlayer.info.playerId;
    const moves = playerId === currentPlayerId ? this.#possibleMoves : [];
    const characters = this.#characters.map(character => character.info);

    const state = {
      gameId: this.#gameId,
      you: { ...you.info },
      maxPlayers: this.#maxPlayers,
      characters,
      players: playerState,
      diceValue: this.#diceValue,
      currentPlayer: this.currentPlayer.profile,
      accusation: this.#accusation,
      possibleMoves: [...moves]
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
