const { assert } = require('chai');
const { Board } = require('../src/model/board.js');
const { Room } = require('../src/model/room.js');

const createRooms = (roomsDetails) => {
  return roomsDetails.map(({ name, position, entryPoint, secretPassage }) =>
    new Room(name, position, entryPoint, secretPassage));
};

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

  it('Should give possible positions on the board from given position', () => {
    const cellPositions = [[0, 2], [1, 2], [1, 3], [2, 2]];
    const rooms = createRooms(roomDetails);

    const board = new Board(cellPositions, rooms);

    const expected = [[1, 1], [1, 3], [0, 2], [2, 2]];
    const actual = board.findPossiblePositions([0, 2], 2, []);

    assert.deepStrictEqual(actual, expected);
  });

  it('Should give only unblocked positions', () => {
    const cellPositions = [[0, 2], [1, 2], [0, 3], [0, 1]];
    const rooms = createRooms(roomDetails);
    const blockedTiles = [[1, 2]];

    const board = new Board(cellPositions, rooms);

    const expected = [[0, 1], [0, 3]];
    const actual = board.findPossiblePositions([0, 2], 1, blockedTiles);

    assert.deepStrictEqual(actual, expected);
  });
});
