const { isEqual } = require('../utils/isEqual.js');
const { AwaitingAcknowledgement } = require('./acknowledgement.js');
const { Suspicion } = require('./suspicion.js');

class Game {
  #gameId;
  #players;
  #characters;
  #envelope;
  #board;

  #numberOfPlayers;
  #currentPlayerIndex;
  #diceValue;
  #isStarted;
  #possibleMoves;
  #accusation;
  #suspicion;
  #acknowledgement;

  constructor(gameId, players, characters, envelope, board) {
    this.#gameId = gameId;
    this.#players = players;
    this.#characters = characters;
    this.#envelope = envelope;
    this.#board = board;

    this.#numberOfPlayers = players.length;
    this.#currentPlayerIndex = 0;
    this.#diceValue = [1, 1];
    this.#isStarted = false;
    this.#possibleMoves = [];
    this.#accusation = null;
    this.#suspicion = null;
  }

  get players() {
    return this.#players;
  }

  get #currentPlayer() {
    return this.#players[this.#currentPlayerIndex];
  }

  get #currentPlayerCharacter() {
    return this.#characters[this.#currentPlayerIndex];
  }

  get isStarted() {
    return this.#isStarted;
  }

  #disable(action) {
    this.#currentPlayer.disable(action);
  }

  #enable(action) {
    this.#currentPlayer.enable(action);
  }

  isAllowed(playerId, action) {
    const player = this.#findPlayer(playerId);
    return player.isAllowed(action);
  }

  #getPlayerRoom(player) {
    const character = this.#characters.find(character =>
      character.info.name === player.character);

    return this.#board.getRoom(character.position);
  }

  #isCurrentPlayerInsideRoom() {
    const characterPosition = this.#currentPlayerCharacter.position;
    return this.#board.isInsideRoom(characterPosition);
  }

  #manageSuspectPermission() {
    const player = this.#currentPlayer;
    const room = this.#getPlayerRoom(player);
    const roomName = room && room.name;

    if (this.#isCurrentPlayerInsideRoom() && player.canSuspectHere(roomName)) {
      return player.enable('suspect');
    }

    player.disable('suspect');
  }

  #manageSecretPassagePermission() {
    const room = this.#getPlayerRoom(this.#currentPlayer);
    if (room && room.secretPassage) {
      this.#enable('secret-passage');
      this.#enable('move');
    }
  }

  #enablePermissions() {
    const actions = ['roll-dice', 'accuse', 'pass-turn'];
    actions.forEach(action => this.#enable(action));
    this.#manageSuspectPermission('suspect');
    this.#manageSecretPassagePermission();
  }

  #disablePermissions() {
    const actions = [
      'roll-dice', 'suspect', 'pass-turn', 'accuse', 'move', 'secret-passage'
    ];
    actions.forEach(action => this.#disable(action));
  }

  start() {
    this.#isStarted = true;
    this.#enablePermissions();
  }

  #changePlayer() {
    let index = this.#currentPlayerIndex;
    do {
      index++;
      this.#currentPlayerIndex = index % this.#numberOfPlayers;
    } while (this.#currentPlayer.hasAccused);
  }

  isCurrentPlayer(playerId) {
    return this.#currentPlayer.isYourId(playerId);
  }

  passTurn() {
    this.#possibleMoves = [];
    this.#disablePermissions();
    this.#changePlayer();
    this.#enablePermissions();
    this.#accusation = null;
    this.#suspicion = null;
  }

  rollDice(diceRoller) {
    this.#diceValue = [diceRoller(), diceRoller()];
    this.#disable('roll-dice');
    this.#enable('move');
  }

  #moveCharacter(characterName, position) {
    const character = this.#characters.find(character =>
      character.name === characterName);

    character.position = position;
  }

  move(newPosition) {
    const prevPosition = this.#currentPlayerCharacter.position;

    if (!isEqual(prevPosition, newPosition)) {
      this.#currentPlayer.unblock();
    }

    this.#currentPlayerCharacter.position = newPosition;

    this.#manageSuspectPermission('suspect');
    this.#disable('move');
    this.#disable('secret-passage');

    this.#possibleMoves = [];
  }

  useSecretPassage() {
    const player = this.#currentPlayer;
    const room = this.#getPlayerRoom(player);
    this.move(room.secretPassage);
    this.#disable('roll-dice');
    this.#possibleMoves = [];
  }

  #isAccusationCorrect(cards) {
    return Object.keys(cards).every(category =>
      cards[category] === this.#envelope[category]);
  }

  accuse(accusedCards) {
    const player = this.#currentPlayer;
    if (!player.isAllowed('accuse')) {
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

  suspect(playerId, suspectedCards) {
    const player = this.#currentPlayer;
    const room = this.#getPlayerRoom(player);
    const roomName = room && room.name;

    if (!player.isYourId(playerId) || !player.isAllowed('suspect')) {
      return false;
    }

    const { position } = this.#currentPlayerCharacter;
    this.#moveCharacter(suspectedCards.character, position);

    const suspicionBreaker = this.#findSuspicionBreaker(suspectedCards);
    const suspicionBreakerCharacter =
      suspicionBreaker ? suspicionBreaker.character : null;

    const suspectedBy = player.profile.character;
    const suspicion = new Suspicion(
      suspectedBy,
      suspectedCards,
      suspicionBreakerCharacter
    );

    this.#suspicion = suspicion;
    player.disable('suspect');
    player.disable('secret-passage');
    player.disable('roll-dice');
    player.blockRoom = roomName;

    this.#acknowledgement = new AwaitingAcknowledgement(this.#players);
    return true;
  }

  ruleOutSuspicion(playerId, rulingOutCard) {
    const ruledOutBy = this.#findPlayer(playerId).character;
    return this.#suspicion.ruleOut(ruledOutBy, rulingOutCard);
  }

  acknowledgeSuspicion(playerId) {
    if (!this.#suspicion) {
      return;
    }

    const player = this.#findPlayer(playerId);
    this.#acknowledgement.acknowledgeFrom(player);

    if (this.#acknowledgement.hasEveryoneAcknowledged()) {
      this.#suspicion = null;
    }
  }

  injectPossibleMoves(possibleMoves) {
    this.#possibleMoves = possibleMoves;
  }

  #findPlayer(playerId) {
    return this.#players.find(player => player.isYourId(playerId));
  }

  getState(playerId) {
    const playerState = this.#players.map(player => player.profile);
    const you = this.#findPlayer(playerId);
    const room = this.#getPlayerRoom(you);

    const { playerId: currentPlayerId } = this.#currentPlayer.info;
    const moves = playerId === currentPlayerId ? this.#possibleMoves : [];
    const characters = this.#characters.map(character => character.info);

    const suspicion = this.#suspicion ?
      this.#suspicion.getSuspicion(you.character) : null;

    const state = {
      gameId: this.#gameId,
      you: { ...you.info, room },
      characters,
      players: playerState,
      diceValue: this.#diceValue,
      currentPlayer: this.#currentPlayer.profile,
      accusation: this.#accusation,
      suspicion,
      possibleMoves: [...moves]
    };

    return state;
  }

  equals(otherGame) {
    const areGamesEqual = otherGame instanceof Game &&
      otherGame.#gameId === this.#gameId;

    const arePlayersEqual = otherGame.#players.every((player, index) =>
      player.equals(this.#players[index]));

    const areCharactersEqual = otherGame.#characters.every((character, index) =>
      character.equals(this.#characters[index]));

    return areGamesEqual && arePlayersEqual && areCharactersEqual;
  }
}

module.exports = { Game };
