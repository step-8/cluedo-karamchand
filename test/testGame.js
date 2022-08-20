const { assert } = require('chai');
const { createRooms } = require('../src/handlers/hostGameHandler.js');
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
      new Character('green', [3, 3]),
      new Character('plum', [3, 3])
    ];
    const roomDetails = [{
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

    const rooms = createRooms(roomDetails);

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

    assert.notOk(game.addPlayer(1, 'bob'));
  });

  it('Should return the game state', () => {
    const game = createGame(['bob', 'raj'], characters, board);

    const charactersInfo = characters.map(character => character.info);

    const expected = {
      gameId: 1,
      diceValue: [1, 1],
      you: {
        playerId: 1, name: 'bob', character: 'scarlett', position: [1, 1],
        permissions: [],
        cards: [],
        room: null
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
        { name: 'raj', character: 'mustard', position: [2, 2] }
      ],
      accusation: null,
      suspicion: null,
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

    assert.notOk(game.isReady());
  });

  it('should roll the dice', () => {
    const game = new Game(1, 1, characters, board);
    assert.ok(game.addPlayer(1, 'bob'));
    game.start();
    game.rollDice(() => 2);

    const actual = game.getState(1).diceValue;
    assert.deepStrictEqual(actual, [2, 2]);
  });

  it('should pass the turn', () => {
    const game = createGame(['bob', 'raj'], characters, board);

    game.passTurn();

    const actual = game.getState(2).currentPlayer;
    assert.deepStrictEqual(actual,
      { name: 'raj', character: 'mustard', position: [2, 2] });
  });

  it('should pass the turn to first player after a round', () => {
    const game = createGame(['bob', 'raj'], characters, board);
    game.passTurn();
    game.passTurn();

    const actual = game.getState(2).currentPlayer;
    assert.deepStrictEqual(actual,
      { name: 'bob', character: 'scarlett', position: [1, 1] });
  });

  it('Should start the game and give permissions to the current player',
    () => {
      const game = new Game(1, 1, characters, board);
      assert.ok(game.addPlayer(1, 'bob'));
      game.start();

      const { permissions } = game.currentPlayer.info;
      assert.ok(permissions.includes('roll-dice'));
      assert.ok(game.isStarted);
    });

  it('Should move the current player\'s token', () => {
    const game = createGame(['bob', 'raj'], characters, board);
    game.start();
    game.move([7, 16]);
    const currentPlayer = game.currentPlayer.info;
    assert.deepStrictEqual(currentPlayer.position, [7, 16]);
  });

  it('Should allow the current player to accuse', () => {
    const game = createGame(['bob', 'raj'], characters, board);
    game.start();
    assert.ok(game.accuse({
      character: 'green', weapon: 'rope', room: 'hall'
    }));
  });

  it('Should provide accusation info, if current player accuses', () => {
    const game = createGame(['bob', 'raj'], characters, board);
    game.start();
    game.accuse({ character: 'green', weapon: 'rope', room: 'hall' });

    const { accusation } = game.getState(2);
    const { result, ...actual } = accusation;

    const expected = {
      accuser: { name: 'bob', character: 'scarlett', position: [1, 1] },
      accusedCards: { character: 'green', weapon: 'rope', room: 'hall' },
    };

    assert.deepStrictEqual(actual, expected);
  });

  it('Should inject the possible moves into game', () => {
    const game = createGame(['bob', 'raj'], characters, board);
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
    const cards = { character: 'plum', weapon: 'rope', room: 'kitchen' };

    assert.ok(game.suspect(1, cards));
  });

  it('Should provide suspicion info, if current player suspects', () => {
    const game = new Game(1, 2, characters, board);

    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    game.move([4, 6]);
    game.suspect(1, { character: 'green', weapon: 'rope', room: 'kitchen' });

    const { suspicion } = game.getState(1);
    const { suspicionBreaker } = suspicion;

    const expected = {
      suspectedBy: 'scarlett',
      suspectedElements: {
        character: 'green', weapon: 'rope', room: 'kitchen'
      },
      suspicionBreaker,
      ruledOut: false,
      ruledOutWith: null
    };

    assert.deepStrictEqual(suspicion, expected);
  });

  it('should return true if given id is belongs to current player', () => {
    const game = createGame(['bob', 'raj'], characters, board);
    game.start();

    assert.ok(game.isCurrentPlayer(1));
  });

  it('should return false if given id does not belong to current player',
    () => {
      const game = createGame(['bob', 'raj'], characters, board);
      game.start();

      assert.notOk(game.isCurrentPlayer(2));
    });

  it('should return true if current player has given permission', () => {
    const game = createGame(['bob', 'raj'], characters, board);
    game.start();

    assert.ok(game.isAllowed(1, 'accuse'));
  });

  it('should return false if current player does not have given permission',
    () => {
      const game = createGame(['bob', 'raj'], characters, board);
      game.start();

      assert.notOk(game.isAllowed(1, 'suspect'));
    });
});
