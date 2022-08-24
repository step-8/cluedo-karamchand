const chai = require('chai');
const { assert } = chai;
const { Player } = require('../src/model/player.js');

describe('Player', () => {
  it('Should equate the player', () => {
    const player1 = new Player(1, 'a', 'abc', [1, 1]);
    const player2 = new Player(1, 'a', 'abc', [1, 1]);
    const player3 = new Player(2, 'e', 'efg', [1, 1]);

    assert.ok(player1.equals(player2));
    assert.notOk(player1.equals(player3));
  });

  it('Should return player info', () => {
    const player = new Player(1, 'bob', 'ironman', [1, 1]);
    const expected = {
      playerId: 1,
      name: 'bob',
      character: 'ironman',
      position: [1, 1],
      cards: [],
      permissions: []
    };

    assert.deepStrictEqual(player.info, expected);
  });

  it('should add cards', () => {
    const player = new Player(1, 'bob', 'ironman', [1, 1]);
    player.addCards(['hall']);
    const expected = {
      playerId: 1,
      name: 'bob',
      character: 'ironman',
      position: [1, 1],
      cards: ['hall'],
      permissions: []
    };

    assert.deepStrictEqual(player.info, expected);
  });

  it('Should return true if player has any of given cards.', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.addCards(['white', 'plum', 'rope']);
    const cards = ['rope', 'scarlett'];

    assert.ok(player.hasAnyOf(cards));
  });

  it('Should return false if player do not have any of given cards.',
    () => {
      const player = new Player(1, 'ram', 'scarlett', [1, 1]);
      player.addCards(['white', 'plum', 'rope']);
      const cards = ['hall', 'scarlett'];

      assert.notOk(player.hasAnyOf(cards));
    });

  it('Should only give pass turn permission after accusation',
    () => {
      const player = new Player(1, 'ram', 'scarlett', [1, 1]);
      player.enable('accuse');

      const expected = ['pass-turn'];

      player.accused();
      assert.deepStrictEqual(player.info.permissions, expected);
    });

  it('should add given permission to player', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.enable('accuse');

    const info = player.info;
    assert.include(info.permissions, 'accuse');
  });

  it('should return true if player has given permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.enable('accuse');

    assert.ok(player.isAllowed('accuse'));
  });

  it('should return false if player do not have given permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);

    assert.notOk(player.isAllowed('accuse'));
  });

  it('should disable given permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.enable('accuse');
    let info = player.info;
    assert.include(info.permissions, 'accuse');

    player.disable('accuse');
    info = player.info;
    assert.notInclude(info.permissions, 'accuse');
  });

  it('should return true when player has suspect permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);

    assert.ok(player.canSuspectHere('kitchen'));
  });

  it('should return false when player does not have suspect permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.blockRoom = 'kitchen';

    assert.notOk(player.canSuspectHere('kitchen'));
  });

  it('should unblock the room', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.blockRoom = 'kitchen';
    player.unblock();

    assert.ok(player.canSuspectHere('kitchen'));
  });

});
