const assert = require('assert');
const { Game } = require('../src/model/game.js');

const startingPositions = {
  'scarlett': { position: [1, 1] },
  'mustard': { position: [2, 2] },
  'green': { position: [3, 3] }
};

describe('Game', () => {
  it('Should equate game', () => {
    const game1 = new Game(1, 2, {});
    const game2 = new Game(1, 2, {});

    assert.ok(game1.equals(game2));
  });

  it('should add player to game', () => {
    const game1 = new Game(1, 2, { 'scarlett': { position: [1, 1] } });
    const game2 = new Game(1, 2, { 'scarlett': { position: [1, 1] } });

    assert.ok(game1.addPlayer(1, 'bob'));
    assert.ok(game2.addPlayer(1, 'bob'));
    assert.ok(game1.equals(game2));
  });

  it('Should not add player to game if max players reached', () => {
    const game = new Game(1, 1, startingPositions);
    game.addPlayer(1, 'bob');

    assert.ok(!game.addPlayer(1, 'bob'));
  });

  it('Should return the game state', () => {
    const game = new Game(1, 2, startingPositions);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'james');

    const expected = {
      gameId: 1,
      diceValue: [1, 1],
      possibleMoves: [[7, 16]],
      you: {
        playerId: 1, name: 'bob', character: 'scarlett', position: [1, 1],
        permissions:
          { rollDice: false, passTurn: false, accuse: false }, cards: []
      },
      maxPlayers: 2,
      currentPlayer: {
        name: 'bob',
        character: 'scarlett'
      },
      characters: ['scarlett', 'mustard', 'white', 'green', 'peacock', 'plum'],
      players: [
        { name: 'bob', character: 'scarlett' },
        { name: 'james', character: 'mustard' }
      ],
      accusation: null,
      possibleMoves: []
    };

    assert.deepStrictEqual(game.getState(1), expected);
  });

  it('Should return true if game is ready', () => {
    const game = new Game(1, 1, startingPositions);
    game.addPlayer(1, 'bob');

    assert.ok(game.isReady());
  });

  it('Should return false if game is not ready', () => {
    const game = new Game(1, 1, startingPositions);

    assert.ok(!game.isReady());
  });

  it('Should return true if envelope is added', () => {
    const game = new Game(1, 1, startingPositions);
    game.addEnvelope([1, 2, 3]);

    assert.ok(!game.isEnvelopeEmpty());
  });

  it('Should return false if envelope is not added', () => {
    const game = new Game(1, 1, startingPositions);

    assert.ok(game.isEnvelopeEmpty());
  });

  it('Should add envelope in game', () => {
    const game = new Game(1, 1, startingPositions);
    game.addEnvelope(['a', 'b']);

    assert.ok(!game.isEnvelopeEmpty());
  });

  it('should roll the dice', () => {
    const game = new Game(1, 1, startingPositions);
    assert.ok(game.addPlayer(1, 'bob'));
    game.rollDice(() => 2);

    const actual = game.getState(1).diceValue;
    assert.deepStrictEqual(actual, [2, 2]);
  });

  it('should pass the turn', () => {
    const game = new Game(1, 2, startingPositions);

    assert.ok(game.addPlayer(1, 'bob'));
    assert.ok(game.addPlayer(2, 'bobby'));
    game.passTurn();

    const actual = game.getState(2).currentPlayer;
    assert.deepStrictEqual(actual, { name: 'bobby', character: 'mustard' });
  });

  it('should pass the turn to first player after a round', () => {
    const game = new Game(1, 2, startingPositions);

    assert.ok(game.addPlayer(1, 'bob'));
    assert.ok(game.addPlayer(2, 'bobby'));
    game.passTurn();
    game.passTurn();

    const actual = game.getState(2).currentPlayer;
    assert.deepStrictEqual(actual, { name: 'bob', character: 'scarlett' });
  });

  it('Should start the game and give permissions to the current player', () => {
    const game = new Game(1, 1, startingPositions);
    assert.ok(game.addPlayer(1, 'bob'));
    game.start();

    const { permissions } = game.currentPlayer.info;
    assert.ok(permissions.rollDice);
    assert.ok(game.isStarted);
  });

  it('Should disable dice permission to the current player', () => {
    const game = new Game(1, 1, startingPositions);
    assert.ok(game.addPlayer(1, 'bob'));
    game.disableDice();

    const { permissions } = game.currentPlayer.info;
    assert.ok(!permissions.rollDice);
  });

  it('Should disable pass turn permission to the current player', () => {
    const game = new Game(1, 1, startingPositions);
    assert.ok(game.addPlayer(1, 'bob'));
    game.disablePass();

    const { permissions } = game.currentPlayer.info;
    assert.ok(!permissions.rollDice);
  });

  it('Should move the current player\'s token', () => {
    const game = new Game(1, 2, startingPositions);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    game.move([7, 16]);
    const currentPlayer = game.currentPlayer.info;
    assert.deepStrictEqual(currentPlayer.position, [7, 16]);
  });

  it('Should allow the current player to accuse', () => {
    const game = new Game(1, 2, startingPositions);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    assert.ok(game.accuse(1, {
      character: 'green', weapon: 'rope', room: 'hall'
    }));
  });

  it('Should no t allow other players to accuse', () => {
    const game = new Game(1, 2, startingPositions);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    assert.ok(!game.accuse(2, {
      character: 'green', weapon: 'rope', room: 'hall'
    }));
  });

  it('Should provide accusation info, if current player accuses', () => {
    const game = new Game(1, 2, startingPositions);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    game.accuse(1, { character: 'green', weapon: 'rope', room: 'hall' });

    const { accusation } = game.getState(2);
    const { result, ...actual } = accusation;

    const expected = {
      accuser: { name: 'bob', character: 'scarlett' },
      accusedCards: { character: 'green', weapon: 'rope', room: 'hall' },
    };

    assert.deepStrictEqual(actual, expected);
  });

  it('Should inject the possible moves into game', () => {
    const game = new Game(1, 2, startingPositions);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'raj');
    game.start();
    game.injectPossibleMoves([[1, 2], [2, 2]]);

    const actual = game.getState(1).possibleMoves;
    const expected = [[1, 2], [2, 2]];

    assert.deepStrictEqual(actual, expected);
  });
});
