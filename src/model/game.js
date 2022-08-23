const { Cards } = require('./cards.js');
const { Player } = require('./player.js');
const { Suspicion } = require('./suspicion.js');

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

  #disable(action) {
    this.currentPlayer.disable(action);
  }

  #enable(action) {
    this.currentPlayer.enable(action);
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

  isReady() {
    return this.#maxPlayers === this.#players.length;
  }

  #isCurrentPlayerInsideRoom() {
    const characterPosition = this.#currentPlayerCharacter.position;
    return this.#board.isInsideRoom(characterPosition);
  }

  #manageSuspectPermission(action) {
    if (this.#isCurrentPlayerInsideRoom()) {
      return this.currentPlayer.enable(action);
    }

    this.currentPlayer.disable(action);
  }

  #manageSecretPassagePermission() {
    const room = this.#getPlayerRoom(this.currentPlayer);
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

  #changePlayer() {
    let index = this.#currentPlayerIndex;
    do {
      index++;
      this.#currentPlayerIndex = index % this.#maxPlayers;
    } while (this.currentPlayer.hasAccused);
  }

  isCurrentPlayer(playerId) {
    return this.currentPlayer.isYourId(playerId);
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

    const player = this.#players.find(player =>
      player.character === character.name);

    player && (player.position = position);
  }

  move(newPosition) {
    this.currentPlayer.position = newPosition;
    this.#currentPlayerCharacter.position = newPosition;

    this.#manageSuspectPermission('suspect');
    this.#disable('move');
    this.#disable('secret-passage');

    this.#possibleMoves = [];
  }

  useSecretPassage() {
    const player = this.currentPlayer;
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
    const player = this.currentPlayer;
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
    const player = this.currentPlayer;

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
    return true;
  }

  ruleOutSuspicion(playerId, rulingOutCard) {
    const ruledOutBy = this.#findPlayer(playerId).character;
    return this.#suspicion.ruleOut(ruledOutBy, rulingOutCard);
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

    const currentPlayerId = this.currentPlayer.info.playerId;
    const moves = playerId === currentPlayerId ? this.#possibleMoves : [];
    const characters = this.#characters.map(character => character.info);

    const suspicion = this.#suspicion ?
      this.#suspicion.getSuspicion(you.character) : null;

    const state = {
      gameId: this.#gameId,
      you: { ...you.info, room },
      maxPlayers: this.#maxPlayers,
      characters,
      players: playerState,
      diceValue: this.#diceValue,
      currentPlayer: this.currentPlayer.profile,
      accusation: this.#accusation,
      suspicion,
      possibleMoves: [...moves]
    };

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
