const { isEqual } = require('../utils/isEqual.js');
const { AwaitingAcknowledgement } = require('./acknowledgement.js');
const { Logger } = require('./logger.js');
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
  #isRunning;
  #possibleMoves;
  #accusation;
  #suspicion;
  #acknowledgement;
  #logger;

  constructor(gameId, players, characters, envelope, board) {
    this.#gameId = gameId;
    this.#players = players;
    this.#characters = characters;
    this.#envelope = envelope;
    this.#board = board;

    this.#numberOfPlayers = players.length;
    this.#currentPlayerIndex = 0;
    this.#diceValue = [1, 1];
    this.#isRunning = false;
    this.#possibleMoves = [];
    this.#accusation = null;
    this.#suspicion = null;
    this.#logger = new Logger();
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
    return this.#isRunning;
  }

  get accusation() {
    return this.#accusation ? { ...this.#accusation } : null;
  }

  get gameId() {
    return this.#gameId;
  }

  get diceValue() {
    return this.#diceValue;
  }

  get possibleMoves() {
    return [...this.#possibleMoves];
  }

  get envelope() {
    return { ...this.#envelope };
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
      return player.enable('suspect-make');
    }

    player.disable('suspect-make');
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
    this.#manageSuspectPermission();
    this.#manageSecretPassagePermission();
  }

  #disablePermissions(actions) {
    actions.forEach(action => this.#disable(action));
  }

  #disableAllPermissions() {
    const actions = [
      'roll-dice', 'suspect-make', 'pass-turn',
      'accuse', 'move', 'secret-passage'
    ];

    this.#disablePermissions(actions);
  }

  start() {
    this.#isRunning = true;
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
    this.#disableAllPermissions();
    this.#changePlayer();
    this.#enablePermissions();
    this.#accusation = null;
    this.#suspicion = null;
  }

  rollDice(diceRoller) {
    this.#diceValue = [diceRoller(), diceRoller()];

    const playerPosition = this.#currentPlayerCharacter.position;
    const stepsToMove = this.#diceValue[0] + this.#diceValue[1];

    this.#possibleMoves = this.#board
      .findPossiblePositions(playerPosition, stepsToMove);

    this.#disable('roll-dice');
    this.#enable('move');

    const currentPlayerCharacter = this.#currentPlayerCharacter.name;
    this.#logger.logRollDice(currentPlayerCharacter, this.#diceValue);

    return [...this.#diceValue];
  }

  #moveCharacter(characterName, position) {
    const character = this.#characters.find(character =>
      character.name === characterName);
    character.position = position;
  }

  #isMoveAllowed(move) {
    return this.#possibleMoves.some(([x, y]) => x === move[0] && y === move[1]);
  }

  move(newPosition) {
    const prevPosition = this.#currentPlayerCharacter.position;

    if (!this.#isMoveAllowed(newPosition)) {
      return false;
    }

    if (!isEqual(prevPosition, newPosition)) {
      this.#currentPlayer.unblock();
    }

    this.#currentPlayerCharacter.position = newPosition;

    this.#manageSuspectPermission();
    this.#disable('move');
    this.#disable('secret-passage');

    this.#possibleMoves = [];
    return true;
  }

  useSecretPassage() {
    const player = this.#currentPlayer;
    const room = this.#getPlayerRoom(player);
    this.move(room.secretPassage);
    this.#disable('roll-dice');
    this.#possibleMoves = [];

    const currentPlayerCharacter = this.#currentPlayerCharacter.name;
    this.#logger.logSecretPassage(currentPlayerCharacter);
  }

  #isAccusationCorrect(cards) {
    return Object.keys(cards).every(category =>
      cards[category] === this.#envelope[category]);
  }

  accuse(accusedCards) {
    const player = this.#currentPlayer;

    const result = this.#isAccusationCorrect(accusedCards);
    this.#accusation = {
      accuser: player.profile,
      accusedCards,
      result
    };
    player.accused();

    const currentPlayerCharacter = this.#currentPlayerCharacter.name;
    this.#logger.logAccusation(currentPlayerCharacter, accusedCards, result);

    if (result) {
      this.#acknowledgement = new AwaitingAcknowledgement(this.#players);
    }

    return result;
  }

  #findSuspicionBreaker(suspectedCards) {
    const cards = Object.values(suspectedCards);
    const index = this.#currentPlayerIndex;
    const players = [
      ...this.#players.slice(index + 1), ...this.#players.slice(0, index)
    ];

    return players.find(player => player.hasAnyOf(cards));
  }

  #enableAcknowledge() {
    this.#players.forEach(player => player.enable('suspect-acknowledge'));
  }

  suspect(suspectedCards) {
    const player = this.#currentPlayer;
    const room = this.#getPlayerRoom(player);
    const roomName = room && room.name;

    this.#summonSuspect(suspectedCards.character);

    const suspicionBreaker = this.#findSuspicionBreaker(suspectedCards);

    let suspicionBreakerCharacter = null;
    if (suspicionBreaker) {
      suspicionBreaker.enable('suspect-rule-out');
      suspicionBreakerCharacter = suspicionBreaker.character;
    } else {
      this.#enableAcknowledge();
    }

    const suspectedBy = player.character;
    const suspicion = new Suspicion(
      suspectedBy,
      suspectedCards,
      suspicionBreakerCharacter
    );

    this.#suspicion = suspicion;

    const actions = ['suspect-make', 'secret-passage', 'roll-dice'];
    this.#disablePermissions(actions);
    player.blockRoom = roomName;

    const currentPlayerCharacter = this.#currentPlayerCharacter.name;
    this.#logger.logSuspicion(currentPlayerCharacter, suspectedCards);

    this.#acknowledgement = new AwaitingAcknowledgement(this.#players);
  }

  #summonSuspect(suspect) {
    const { position } = this.#currentPlayerCharacter;
    this.#moveCharacter(suspect, position);
  }

  ruleOutSuspicion(playerId, rulingOutCard) {
    const player = this.#findPlayer(playerId);
    const ruledOutBy = player.character;

    this.#logger.logRuleOut(ruledOutBy);
    this.#suspicion.ruleOut(ruledOutBy, rulingOutCard);
    player.disable('suspect-rule-out');
    this.#enableAcknowledge();
  }

  acknowledgeSuspicion(playerId) {
    if (!this.#suspicion) {
      return;
    }

    const player = this.#findPlayer(playerId);
    this.#acknowledgement.acknowledgeFrom(player);
    player.disable('suspect-acknowledge');

    if (this.#acknowledgement.hasEveryoneAcknowledged()) {
      this.#suspicion = null;
    }
  }

  acknowledgeAccusation(playerId) {
    if (!this.#accusation) {
      return false;
    }

    const player = this.#findPlayer(playerId);
    this.#acknowledgement.acknowledgeFrom(player);

    if (this.#acknowledgement.hasEveryoneAcknowledged()) {
      this.#accusation = null;
      this.#isRunning = false;
      this.#disablePermissions();
    }

    return true;
  }

  #findPlayer(playerId) {
    return this.#players.find(player => player.isYourId(playerId));
  }

  accept(visitor, playerId) {
    visitor.visitGame(this);
    visitor.visitCurrentPlayer(this.#currentPlayer);
    this.#players.forEach(player => player.accept(visitor));
    this.#characters.forEach(character => character.accept(visitor));

    const you = this.#findPlayer(playerId);
    const roomInfo = this.#getPlayerRoom(you);
    visitor.visitYou(you, roomInfo);
    visitor.visitLogger(this.#logger);

    this.#suspicion && this.#suspicion.accept(visitor);
    if (!this.#isRunning) {
      visitor.visitEnvelope(this);
    }
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
