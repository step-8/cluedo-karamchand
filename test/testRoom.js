const { assert } = require('chai');
const { Room } = require('../src/model/room');

describe('Room', () => {
  it('Should return info of room', () => {
    const room = new Room('hall', [1, 1], [2, 1], [10, 10]);

    const expected = {
      name: 'hall',
      position: [1, 1],
      entryPoint: [2, 1],
      secretPassage: [10, 10]
    };

    assert.deepStrictEqual(room.info, expected);
  });

  it('should return true if tile is inside room', () => {
    const room = new Room('hall', [1, 1], [2, 1], [10, 10]);

    assert.ok(room.isInside([1, 1]));
  });

  it('should return false if tile is not inside room', () => {
    const room = new Room('hall', [1, 1], [2, 1], [10, 10]);

    assert.notOk(room.isInside([3, 2]));
  });
});
