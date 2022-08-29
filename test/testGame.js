const { assert } = require('chai');
const { Game } = require('../src/model/game.js');
const { Player } = require('../src/model/player.js');
const { Character } = require('../src/model/character.js');
const { Board } = require('../src/model/board.js');
const { Room } = require('../src/model/room.js');
const { GeneralPlayerVisitor } = require('../src/model/visitors.js');

const createRooms = (roomsDetails) => {
  return roomsDetails.map(({ name, position, entryPoint, secretPassage }) =>
    new Room(name, position, entryPoint, secretPassage));
};

describe('Game', () => {
  let players;
  let characters;
  let envelope;
  let board;

  beforeEach(() => {
    players = [
      new Player(1, 'bob', 'scarlett', ['green']),
      new Player(2, 'buddy', 'mustard', ['white', 'rope'])
    ];

    characters = [
      new Character('scarlett', [1, 1]),
      new Character('mustard', [4, 6]),
      new Character('green', [4, 6]),
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

    const cellPositions = [
      [0, 7], [2, 1], [1, 2], [1, 3], [2, 2], [4, 7]];

    envelope = { character: 'white', room: 'hall', weapon: 'pipe' };
    const rooms = createRooms(roomDetails);
    board = new Board(cellPositions, rooms);
  });

  it('Should equate two instances of game', () => {
    const game1 = new Game(1, players, characters, envelope, board);
    const game2 = new Game(1, players, characters, envelope, board);

    assert.ok(game1.equals(game2));
  });

  it('Should accept a visitor', () => {
    const visitor = new GeneralPlayerVisitor();
    const game = new Game(1, players, characters, envelope, board);

    game.start();
    game.accept(visitor, 1);

    const charactersInfo = characters.map(character => character.info);
    const playersInfo = players.map(player => player.profile);

    const expected = {
      gameId: 1,
      diceValue: [1, 1],
      you: {
        name: 'bob', character: 'scarlett',
        permissions: ['roll-dice', 'accuse', 'pass-turn'],
        cards: ['green'],
        room: null
      },
      currentPlayer: {
        name: 'bob',
        character: 'scarlett'
      },
      logs: [],
      characters: charactersInfo,
      players: playersInfo,
      accusation: null,
      isRunning: true
    };

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });

  it('Should roll the dice', () => {
    const game = new Game(1, players, characters, envelope, board);
    const actual = game.rollDice(() => 2);

    assert.deepStrictEqual(actual, [2, 2]);
  });

  it('Should pass the turn', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.passTurn();

    const actual = game.getState(2).currentPlayer;
    const expected = { name: 'buddy', character: 'mustard' };
    assert.deepStrictEqual(actual, expected);
  });

  it('Should pass the turn to first player after a round', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.passTurn();
    game.passTurn();

    const actual = game.getState(2).currentPlayer;
    const expected = { name: 'bob', character: 'scarlett' };
    assert.deepStrictEqual(actual, expected);
  });

  it('Should start the game and give permissions to the current player',
    () => {
      const game = new Game(1, players, characters, envelope, board);
      game.start();

      const { permissions } = players[0].info;
      assert.ok(permissions.includes('roll-dice'));
      assert.ok(game.isStarted);
    });

  it('Should move the current player\'s token', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    game.rollDice(() => 1);

    assert.ok(game.move([2, 2]));
  });

  it('Should not move the current player\'s token if move is invalid', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    game.rollDice(() => 1);

    assert.notOk(game.move([4, 0]));
  });

  it('Should return true if current player accusation permission', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();

    assert.ok(game.isAllowed(1, 'accuse'));
  });


  it('Should return true if accusation is correct', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    const actual = game.accuse(
      { character: 'white', weapon: 'pipe', room: 'hall' });

    assert.isOk(actual);
  });

  it('Should return false if accusation is incorrect', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    const actual = game.accuse(
      { character: 'white', weapon: 'rope', room: 'hall' });

    assert.notOk(actual);
  });

  it('Should return true if accusation acknowledgement is allowed', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    game.accuse({ character: 'white', weapon: 'pipe', room: 'hall' });

    assert.isOk(game.acknowledgeAccusation(1));
  });

  it('Should return false if accusation acknowledgement is not allowed', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();

    assert.notOk(game.acknowledgeAccusation(1));
  });

  it('Should provide suspicion info, if current player suspects', () => {
    characters[0].position = [4, 7];
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    game.rollDice(() => 1);
    game.move([4, 6]);
    game.suspect({ character: 'green', weapon: 'rope', room: 'kitchen' });

    const { suspicion } = game.getState(1);
    const expected = {
      suspectedBy: 'scarlett',
      suspectedElements: {
        character: 'green', weapon: 'rope', room: 'kitchen'
      },
      suspicionBreaker: 'mustard',
      ruledOut: false,
      ruledOutWith: null
    };

    assert.deepStrictEqual(suspicion, expected);
  });

  it('Should not provide suspicion info if the suspcion round is over', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.move([4, 6]);
    game.suspect({ character: 'green', weapon: 'rope', room: 'kitchen' });
    game.acknowledgeSuspicion(1);
    game.acknowledgeSuspicion(2);

    const { suspicion } = game.getState(1);
    assert.deepStrictEqual(suspicion, null);
  });

  it('should return true if given id is belongs to current player', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();

    assert.ok(game.isCurrentPlayer(1));
  });

  it('Should return false if given id does not belong to current player', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();

    assert.notOk(game.isCurrentPlayer(2));
  });

  it('Should return true if current player has given permission', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();

    assert.ok(game.isAllowed(1, 'pass-turn'));
  });

  it('Should return false if current player does not have given permission',
    () => {
      const game = new Game(1, players, characters, envelope, board);
      game.start();

      assert.notOk(game.isAllowed(1, 'suspect'));
    });
});
