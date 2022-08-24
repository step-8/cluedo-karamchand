const { assert } = require('chai');
const { Lobby } = require('../src/model/lobby.js');

describe('Lobby', () => {
  const characters = ['scarlett', 'mustard'];

  it('Should equate the instances of Lobby', () => {
    const lobby1 = new Lobby(1, 2, characters);
    const lobby2 = new Lobby(1, 2, characters);
    const lobby3 = new Lobby(1, 3, ['Mustard']);

    assert.isOk(lobby1.equals(lobby2));
    assert.notOk(lobby1.equals(lobby3));
  });

  it('Should provide lobby stats', () => {
    const lobby = new Lobby(1, 2, characters);
    const expected = { id: 1, players: [] };

    assert.deepStrictEqual(lobby.getStats(), expected);
  });

  it('Should add player to the lobby', () => {
    const lobby = new Lobby(1, 2, characters);
    const expected = {
      id: 1, players: [{ id: 1, name: 'abc', character: 'scarlett' }]
    };

    assert.isOk(lobby.addPlayer(1, 'abc'));
    assert.deepStrictEqual(lobby.getStats(), expected);
  });

  it('Should not add player to the lobby if lobby is full', () => {
    const lobby = new Lobby(1, 1, characters);
    lobby.addPlayer(1, 'abc');

    assert.notOk(lobby.addPlayer(2, 'xyz'));
  });

  it('Should return true if lobby is full', () => {
    const lobby = new Lobby(1, 1, characters);
    lobby.addPlayer(1, 'abc');

    assert.isOk(lobby.isFull());
  });

  it('Should return false if lobby is not full', () => {
    const lobby = new Lobby(1, 2, characters);
    lobby.addPlayer(1, 'abc');

    assert.notOk(lobby.isFull());
  });
});
