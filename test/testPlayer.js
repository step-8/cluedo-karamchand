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
      permissions:
      {
        rollDice: false, passTurn: false, accuse: false, suspect: false,
        move: false
      },
      cards: []
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
      permissions:
      {
        rollDice: false, passTurn: false, accuse: false, suspect: false,
        move: false
      },
      cards: ['hall']
    };

    assert.deepStrictEqual(player.info, expected);
  });

  it('should enable roll dice permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);

    player.enableDice();
    const { permissions } = player.info;
    assert.ok(permissions.rollDice);
  });

  it('should enable pass permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);

    player.enablePassTurn();
    const { permissions } = player.info;
    assert.ok(permissions.passTurn);
  });

  it('should disable roll dice permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);

    player.enableDice();
    let { permissions } = player.info;
    assert.ok(permissions.rollDice);

    player.disableDice();
    permissions = player.info.permissions;
    assert.notOk(permissions.rollDice);
  });

  it('should disable pass turn permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);

    player.enablePassTurn();
    let { permissions } = player.info;
    assert.ok(permissions.passTurn);

    player.disablePassTurn();
    permissions = player.info.permissions;
    assert.notOk(permissions.passTurn);
  });

  it('Should enable suspect permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.enableSuspect();

    const { permissions } = player.info;
    assert.ok(permissions.suspect);
  });

  it('Should disable suspect permission', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.disableSuspect();

    const { permissions } = player.info;
    assert.notOk(permissions.suspect);
  });

  it('Should return true if player is allowed to suspect', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);
    player.enableSuspect();

    assert.ok(player.isAllowedToSuspect());
  });

  it('Should return false if player is not allowed to suspect', () => {
    const player = new Player(1, 'ram', 'scarlett', [1, 1]);

    assert.notOk(player.isAllowedToSuspect());
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

  it('Should disable all the permissions of the player after accusation',
    () => {
      const player = new Player(1, 'ram', 'scarlett', [1, 1]);
      player.enableDice();
      player.allowToAccuse();

      const expected = {
        rollDice: false, passTurn: false, accuse: false, suspect: false,
        move: false
      };

      player.accused();
      assert.deepStrictEqual(player.info.permissions, expected);
    });
});
