const assert = require('assert');
const { Board } = require('../src/model/board.js');
const { Character } = require('../src/model/character.js');
const { Game } = require('../src/model/game.js');

const createGame = (players, characters, board) => {
  const game = new Game(1, players.length, characters, board);
  players.forEach((player, index) => {
    game.addPlayer(index + 1, player);
  });

  return game;
};

describe('Game', () => {
  let characters;
  let board;

  beforeEach(() => {
    characters = [
      new Character('scarlett', [1, 1]),
      new Character('mustard', [2, 2]),
      new Character('green', [3, 3])
    ];
    const rooms = [{
      'name': 'kitchen',
      'position': [
        4,
        6
      ],
      'entryPoint': [
        4,
        7
      ]
    }];
    board = new Board([[0, 7]], rooms);
  });

  it('Should equate game', () => {
    const game1 = new Game(1, 2, characters, board);
    const game2 = new Game(1, 2, characters, board);

    assert.ok(game1.equals(game2));
  });

  it('should add player to game', () => {
    const game1 = new Game(1, 2, characters, board);
    const game2 = new Game(1, 2, characters, board);

    assert.ok(game1.addPlayer(1, 'bob'));
    assert.ok(game2.addPlayer(1, 'bob'));
    assert.ok(game1.equals(game2));
  });

  it('Should not add player to game if max players reached', () => {
    const game = new Game(1, 1, characters, board);
    game.addPlayer(1, 'bob');

    assert.ok(!game.addPlayer(1, 'bob'));
  });

  it('Should return the game state', () => {
    const game = new Game(1, 2, characters, board);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'james');

    const charactersInfo = characters.map(character => character.info);

    const expected = {
      gameId: 1,
      diceValue: [1, 1],
      you: {
        playerId: 1, name: 'bob', character: 'scarlett', position: [1, 1],
        permissions:
          { rollDice: false, passTurn: false, accuse: false, suspect: false },
        cards: []
      },
      maxPlayers: 2,
      currentPlayer: {
        name: 'bob',
        character: 'scarlett',
        position: [1, 1]
      },
      characters: charactersInfo,
      players: [
        { name: 'bob', character: 'scarlett', position: [1, 1] },
        { name: 'james', character: 'mustard', position: [2, 2] }
      ],
      accusation: null,
      possibleMoves: []
    };

    assert.deepStrictEqual(game.getState(1), expected);
  });

  it('Should return true if game is ready', () => {
    const game = new Game(1, 1, characters, board);
    game.addPlayer(1, 'bob');

    assert.ok(game.isReady());
  });

  it('Should return false if game is not ready', () => {
    const game = new Game(1, 1, characters, board);

    assert.ok(!game.isReady());
  });

  it('Should return true if envelope is added', () => {
    const game = new Game(1, 1, characters, board);
    game.addEnvelope([1, 2, 3]);

    assert.ok(!game.isEnvelopeEmpty());
  });

  it('Should return false if envelope is not added', () => {
    const game = new Game(1, 1, characters, board);

    assert.ok(game.isEnvelopeEmpty());
  });

  it('Should add envelope in game', () => {
    const game = new Game(1, 1, characters, board);
    game.addEnvelope(['a', 'b']);

    assert.ok(!game.isEnvelopeEmpty());
  });

  it('should roll the dice', () => {
    const game = new Game(1, 1, characters, board);
    assert.ok(game.addPlayer(1, 'bob'));
    game.rollDice(() => 2);

    const actual = game.getState(1).diceValue;
    assert.deepStrictEqual(actual, [2, 2]);
  });

  it('should pass the turn', () => {
    const game = new Game(1, 2, characters, board);

    assert.ok(game.addPlayer(1, 'bob'));
    assert.ok(game.addPlayer(2, 'bobby'));
    game.passTurn();

    const actual = game.getState(2).currentPlayer;
    assert.deepStrictEqual(actual,
      { name: 'bobby', character: 'mustard', position: [2, 2] });
  });

  it('should pass the turn to first player after a round', () => {
    const game = new Game(1, 2, characters, board);

    assert.ok(game.addPlayer(1, 'bob'));
    assert.ok(game.addPlayer(2, 'bobby'));
    game.passTurn();
    game.passTurn();

    const actual = game.getState(2).currentPlayer;
    assert.deepStrictEqual(actual,
      { name: 'bob', character: 'scarlett', position: [1, 1] });
  });

  it('Should start the game and give permissions to the current player', () => {
    const game = new Game(1, 1, characters, board);
    assert.ok(game.addPlayer(1, 'bob'));
    game.start();

    const { permissions } = game.currentPlayer.info;
    assert.ok(permissions.rollDice);
    assert.ok(game.isStarted);
  });

  it('Should disable dice permission to the current player', () => {
    const game = new Game(1, 1, characters, board);
    assert.ok(game.addPlayer(1, 'bob'));
    game.disableDice();

    const { permissions } = game.currentPlayer.info;
    assert.ok(!permissions.rollDice);
  });

  it('Should disable pass turn permission to the current player', () => {
    const game = new Game(1, 1, characters, board);
    assert.ok(game.addPlayer(1, 'bob'));
    game.disablePass();

    const { permissions } = game.currentPlayer.info;
    assert.ok(!permissions.rollDice);
  });

  it('Should move the current player\'s token', () => {
    const game = new Game(1, 2, characters, board);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    game.move([7, 16]);
    const currentPlayer = game.currentPlayer.info;
    assert.deepStrictEqual(currentPlayer.position, [7, 16]);
  });

  it('Should allow the current player to accuse', () => {
    const game = new Game(1, 2, characters, board);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    assert.ok(game.accuse(1, {
      character: 'green', weapon: 'rope', room: 'hall'
    }));
  });

  it('Should not allow other players to accuse', () => {
    const game = new Game(1, 2, characters, board);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    assert.ok(!game.accuse(2, {
      character: 'green', weapon: 'rope', room: 'hall'
    }));
  });

  it('Should provide accusation info, if current player accuses', () => {
    const game = new Game(1, 2, characters, board);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    game.accuse(1, { character: 'green', weapon: 'rope', room: 'hall' });

    const { accusation } = game.getState(2);
    const { result, ...actual } = accusation;

    const expected = {
      accuser: { name: 'bob', character: 'scarlett', position: [1, 1] },
      accusedCards: { character: 'green', weapon: 'rope', room: 'hall' },
    };

    assert.deepStrictEqual(actual, expected);
  });

  it('Should inject the possible moves into game', () => {
    const game = new Game(1, 2, characters, board);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    game.injectPossibleMoves([[1, 2], [2, 2]]);

    const actual = game.getState(1).possibleMoves;
    const expected = [[1, 2], [2, 2]];

    assert.deepStrictEqual(actual, expected);
  });

  it('Should return false if current player is not allowed to suspect', () => {
    const players = ['bob', 'raj', 'rahul'];
    const game = createGame(players, characters, board);
    game.start();
    const cards = { character: 'plum', weapon: 'rope' };

    assert.ok(!game.suspect(1, cards));
  });

  it('Should return true if current player is allowed to suspect', () => {
    const players = ['bob', 'raj', 'rahul'];
    const game = createGame(players, characters, board);
    game.start();

    game.move([4, 6]);
    const cards = { character: 'plum', weapon: 'rope' };

    assert.ok(game.suspect(1, cards));
  });
});
