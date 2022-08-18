const { assert } = require('chai');
const { Board } = require('../src/model/board.js');

const { cellPositions, roomPositions }
  = require('../data/gameDetails.json');

describe('Board', () => {
  it('Should return true if position belongs to room', () => {
    const board = new Board(cellPositions, roomPositions);

    assert.ok(board.isInsideRoom([9, 7]));
  });

  it('Should return false if position does not belong to room', () => {
    const board = new Board(cellPositions, roomPositions);

    assert.notOk(board.isInsideRoom([1, 1]));
  });

  it('Should return room name if tile belongs to room', () => {
    const board = new Board(cellPositions, roomPositions);

    assert.strictEqual(board.getRoom([4, 6]), 'kitchen');
    assert.strictEqual(board.getRoom([1, 6]), null);
  });
});
