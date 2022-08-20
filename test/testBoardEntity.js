const { assert } = require('chai');
const { Board } = require('../src/model/board.js');
const { createRooms } = require('../src/handlers/hostGameHandler.js');

const cellPositions = [[]];

const roomDetails = [{
  name: 'kitchen',
  position: [1, 1],
  entryPoint: [1, 2],
  secretPassage: [5, 5]
},
{
  name: 'study',
  position: [5, 5],
  entryPoint: [4, 5],
  secretPassage: [1, 1]
}];

const rooms = createRooms(roomDetails);

describe('Board', () => {
  it('Should return true if position belongs to room', () => {
    const board = new Board(cellPositions, rooms);

    assert.ok(board.isInsideRoom([1, 1]));
  });

  it('Should return false if position does not belong to room', () => {
    const board = new Board(cellPositions, rooms);

    assert.notOk(board.isInsideRoom([11, 1]));
  });

  it('Should return room details if tile belongs to room', () => {
    const board = new Board(cellPositions, rooms);

    const expected = {
      name: 'kitchen',
      position: [1, 1],
      entryPoint: [1, 2],
      secretPassage: [5, 5]
    };

    assert.deepStrictEqual(board.getRoom([1, 1]), expected);
    assert.strictEqual(board.getRoom([1, 6]), null);
  });
});
