const assert = require('assert');
const { Player } = require('../src/model/player.js');

describe('Player', () => {
  it('Should equate the player', () => {
    const player1 = new Player(1, 'a', 'abc');
    const player2 = new Player(1, 'a', 'abc');
    const player3 = new Player(2, 'e', 'efg');

    assert.ok(player1.equals(player2));
    assert.ok(!player1.equals(player3));
  });

  it('Should return player info', () => {
    const player = new Player(1, 'bob', 'ironman');
    const expected = {
      playerId: 1,
      name: 'bob',
      character: 'ironman',
      permissions: { rollDice: false },
      cards: []
    };

    assert.deepStrictEqual(player.info, expected);
  });

  it('should add card', () => {
    const player = new Player(1, 'bob', 'ironman');
    player.addCard('hall');
    const expected = {
      playerId: 1,
      name: 'bob',
      character: 'ironman',
      permissions: { rollDice: false },
      cards: ['hall']
    };
    assert.deepStrictEqual(player.info, expected);
  });
});
