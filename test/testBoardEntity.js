const { assert } = require('chai');
const { Board } = require('../src/model/board.js');
const { createRooms } = require('../src/handlers/hostGameHandler.js');

const { cellPositions, roomDetails }
  = require('../data/gameDetails.json');

const rooms = createRooms(roomDetails);

describe('Board', () => {
  it('Should return true if position belongs to room', () => {
    const board = new Board(cellPositions, rooms);

    assert.ok(board.isInsideRoom([9, 7]));
  });

  it('Should return false if position does not belong to room', () => {
    const board = new Board(cellPositions, rooms);

    assert.notOk(board.isInsideRoom([1, 1]));
  });

  it('Should return room name if tile belongs to room', () => {
    const board = new Board(cellPositions, rooms);

    assert.strictEqual(board.getRoom([4, 6]), 'kitchen');
    assert.strictEqual(board.getRoom([1, 6]), null);
  });
});
