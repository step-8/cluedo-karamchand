const { assert } = require('chai');
const { Game } = require('../src/model/game.js');
const { Player } = require('../src/model/player.js');
const { Character } = require('../src/model/character.js');
const { Board } = require('../src/model/board.js');
const { Room } = require('../src/model/room.js');

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

    envelope = { character: 'white', room: 'hall', weapon: 'pipe' };
    const rooms = createRooms(roomDetails);
    board = new Board([[0, 7]], rooms);
  });

  it('Should equate two instances of game', () => {
    const game1 = new Game(1, players, characters, envelope, board);
    const game2 = new Game(1, players, characters, envelope, board);

    assert.ok(game1.equals(game2));
  });

  it('Should return the game state', () => {
    const game = new Game(1, players, characters, envelope, board);

    const charactersInfo = characters.map(character => character.info);
    const playersInfo = players.map(player => player.profile);

    const expected = {
      gameId: 1,
      diceValue: [1, 1],
      you: {
        playerId: 1, name: 'bob', character: 'scarlett',
        permissions: [],
        cards: ['green'],
        room: null
      },
      currentPlayer: {
        name: 'bob',
        character: 'scarlett'
      },
      characters: charactersInfo,
      players: playersInfo,
      accusation: null,
      suspicion: null,
      possibleMoves: []
    };

    assert.deepStrictEqual(game.getState(1), expected);
  });

  it('Should roll the dice', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.rollDice(() => 2);

    const actual = game.getState(1).diceValue;
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
    game.move([7, 16]);

    const { position } = game.getState(1).characters[0];
    assert.deepStrictEqual(position, [7, 16]);
  });

  it('Should allow the current player to accuse', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();

    assert.ok(game.accuse({
      character: 'green', weapon: 'rope', room: 'hall'
    }));
  });

  it('Should provide accusation info, if current player accuses', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    game.accuse({ character: 'green', weapon: 'rope', room: 'hall' });

    const { accusation } = game.getState(2);
    const { result, ...actual } = accusation;

    const expected = {
      accuser: { name: 'bob', character: 'scarlett' },
      accusedCards: { character: 'green', weapon: 'rope', room: 'hall' },
    };

    assert.deepStrictEqual(actual, expected);
  });

  it('Should inject the possible moves into game', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    game.injectPossibleMoves([[1, 2], [2, 2]]);

    const actual = game.getState(1).possibleMoves;
    const expected = [[1, 2], [2, 2]];

    assert.deepStrictEqual(actual, expected);
  });

  it('Should return false if current player is not allowed to suspect', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    const cards = { character: 'plum', weapon: 'rope' };

    assert.notOk(game.suspect(1, cards));
  });

  it('Should return true if current player is allowed to suspect', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    game.move([4, 6]);
    const cards = { character: 'plum', weapon: 'rope', room: 'kitchen' };

    assert.ok(game.suspect(1, cards));
  });

  it('Should provide suspicion info, if current player suspects', () => {
    const game = new Game(1, players, characters, envelope, board);
    game.start();
    game.move([4, 6]);
    game.suspect(1, { character: 'green', weapon: 'rope', room: 'kitchen' });

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
    game.suspect(1, { character: 'green', weapon: 'rope', room: 'kitchen' });
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

    assert.ok(game.isAllowed(1, 'accuse'));
  });

  it('Should return false if current player does not have given permission',
    () => {
      const game = new Game(1, players, characters, envelope, board);
      game.start();

      assert.notOk(game.isAllowed(1, 'suspect'));
    });
});
