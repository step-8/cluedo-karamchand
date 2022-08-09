const assert = require('assert');
const { Game } = require('../src/model/game.js');

describe('Game', () => {
  it('Should equate game', () => {
    const game1 = new Game(1, 2);
    const game2 = new Game(1, 2);

    assert.ok(game1.equals(game2));
  });

  it('should add player to game', () => {
    const game1 = new Game(1, 2);
    const game2 = new Game(1, 2);

    assert.ok(game1.addPlayer(1, 'bob'));
    assert.ok(game2.addPlayer(1, 'bob'));
    assert.ok(game1.equals(game2));
  });

  it('Should not add player to game if max players reached', () => {
    const game = new Game(1, 1);
    game.addPlayer(1, 'bob');

    assert.ok(!game.addPlayer(1, 'bob'));
  });

  it('Should return the game state', () => {
    const game = new Game(1, 2);
    game.addPlayer(1, 'bob');
    game.addPlayer(2, 'james');

    const expected = {
      gameId: 1,
      maxPlayers: 2,
      characters: [
        'scarlett',
        'mustard',
        'green',
        'white',
        'peacock',
        'plum'
      ],
      players: [
        { playerId: 1, name: 'bob', character: 'scarlett', cards: [] },
        { playerId: 2, name: 'james', character: 'mustard', cards: [] }
      ]
    };

    assert.deepStrictEqual(game.state, expected);
  });

  it('Should return true if game is ready', () => {
    const game = new Game(1, 1);
    game.addPlayer(1, 'bob');

    assert.ok(game.isReady());
  });

  it('Should return false if game is not ready', () => {
    const game = new Game(1, 1);

    assert.ok(!game.isReady());
  });
});
