const { Cards } = require('./cards.js');
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
  #suspicion;
  #respondSuspicion;

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
    this.#suspicion = null;
    this.#possibleMoves = [];
    this.#board = board;
    this.#respondSuspicion = false;
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

  #getPlayerRoom(player) {
    const character = this.#characters.find(character =>
      character.info.name === player.character);

    return this.#board.getRoom(character.position);
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

  #isCurrentPlayerInsideRoom() {
    const characterPosition = this.#currentPlayerCharacter.position;
    return this.#board.isInsideRoom(characterPosition);
  }

  #manageSuspectPermission() {
    if (this.#isCurrentPlayerInsideRoom()) {
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

  #distributeCards() {
    const cards = new Cards();
    cards.distribute(this.#maxPlayers);
    const { envelope, sets } = cards.info;

    this.#envelope = envelope;

    this.#players.forEach((player, index) =>
      player.addCards(sets[index]));
  }

  start() {
    this.#isStarted = true;
    this.#distributeCards();
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

  #enableDice() {
    this.currentPlayer.enableDice();
  }

  #enablePass() {
    this.currentPlayer.enablePassTurn();
  }

  #changePlayer() {
    let index = this.#currentPlayerIndex;
    do {
      index++;
      this.#currentPlayerIndex = index % this.#maxPlayers;
    } while (this.currentPlayer.hasAccused);
  }

  passTurn() {
    this.#possibleMoves = [];
    this.#disablePermissions();
    this.#changePlayer();
    this.#enablePermissions();
    this.#accusation = null;
    this.#suspicion = null;
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

  #findSuspicionBreaker(suspectedCards) {
    const cards = Object.values(suspectedCards);
    const index = this.#currentPlayerIndex;
    const players = [
      ...this.#players.slice(index + 1), ...this.#players.slice(0, index)
    ];

    return players.find(player => player.hasAnyOf(cards));
  }

  stopSuspicionRes() {
    this.#respondSuspicion = true;
  }

  suspect(playerId, suspectedCards) {
    this.#respondSuspicion = false;
    const player = this.currentPlayer;

    if (!player.isYourId(playerId) || !player.isAllowedToSuspect()) {
      return false;
    }

    const suspicionBreaker = this.#findSuspicionBreaker(suspectedCards);
    const suspicionBreakerCharacter =
      suspicionBreaker ? suspicionBreaker.character : null;

    this.#suspicion = {
      suspectedBy: { ...player.profile },
      suspectedCards: { ...suspectedCards },
      suspicionBreakerCharacter
    };

    player.disableSuspect();
    return true;
  }

  injectPossibleMoves(possibleMoves) {
    this.#possibleMoves = possibleMoves;
  }

  getState(playerId) {
    const playerState = this.#players.map(player => player.profile);
    const you = this.#players.find(player => player.isYourId(playerId));
    const room = this.#getPlayerRoom(you);

    const currentPlayerId = this.currentPlayer.info.playerId;
    const moves = playerId === currentPlayerId ? this.#possibleMoves : [];
    const characters = this.#characters.map(character => character.info);

    const state = {
      gameId: this.#gameId,
      you: { ...you.info, room },
      maxPlayers: this.#maxPlayers,
      characters,
      players: playerState,
      diceValue: this.#diceValue,
      currentPlayer: this.currentPlayer.profile,
      accusation: this.#accusation,
      suspicion: null,
      possibleMoves: [...moves]
    };

    if (!this.#respondSuspicion) {
      state.suspicion = this.#suspicion;
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
