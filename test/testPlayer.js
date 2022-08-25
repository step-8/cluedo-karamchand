const { assert } = require('chai');
const { Player } = require('../src/model/player.js');

describe('Player', () => {
  it('Should equate the player', () => {
    const player1 = new Player(1, 'a', 'abc', ['scarlett']);
    const player2 = new Player(1, 'a', 'abc', ['scarlett']);
    const player3 = new Player(2, 'e', 'efg', ['scarlett']);

    assert.ok(player1.equals(player2));
    assert.notOk(player1.equals(player3));
  });

  it('Should return player info', () => {
    const player = new Player(1, 'bob', 'ironman', ['scarlett']);
    const expected = {
      playerId: 1,
      name: 'bob',
      character: 'ironman',
      cards: ['scarlett'],
      permissions: []
    };

    assert.deepStrictEqual(player.info, expected);
  });

  it('Should return true if player has any of given cards.', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);
    const cards = ['rope', 'scarlett'];

    assert.ok(player.hasAnyOf(cards));
  });

  it('Should return false if player do not have any of given cards.', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);
    const cards = ['hall', 'white'];

    assert.notOk(player.hasAnyOf(cards));
  });

  it('Should only give pass turn permission after accusation', () => {
    const expected = ['pass-turn'];

    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);
    player.enable('accuse');
    player.accused();

    assert.deepStrictEqual(player.info.permissions, expected);
  });

  it('should add given permission to player', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);
    player.enable('accuse');

    const info = player.info;
    assert.include(info.permissions, 'accuse');
  });

  it('should return true if player has given permission', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);
    player.enable('accuse');

    assert.ok(player.isAllowed('accuse'));
  });

  it('should return false if player do not have given permission', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);

    assert.notOk(player.isAllowed('accuse'));
  });

  it('should disable given permission', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);
    player.enable('accuse');
    let info = player.info;
    assert.include(info.permissions, 'accuse');

    player.disable('accuse');
    info = player.info;
    assert.notInclude(info.permissions, 'accuse');
  });

  it('should return true when player has suspect permission', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);

    assert.ok(player.canSuspectHere('kitchen'));
  });

  it('should return false when player does not have suspect permission', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);
    player.blockRoom = 'kitchen';

    assert.notOk(player.canSuspectHere('kitchen'));
  });

  it('should unblock the room', () => {
    const player = new Player(1, 'ram', 'scarlett', ['scarlett']);
    player.blockRoom = 'kitchen';
    player.unblock();

    assert.ok(player.canSuspectHere('kitchen'));
  });

});
