const { findPossibleMoves } = require('../src/handlers/rollDiceHandler.js');
const assert = require('assert');
const cellPositions = require('../data/gameDetails.json');

describe('findPossibleMoves', () => {
  it('Should give possible positions for single move', () => {
    const actual = findPossibleMoves(cellPositions, 1, [0, 7]);
    const expected = [[1, 7]];

    assert.deepStrictEqual(actual, expected);
  });

  it('Should give possible positions for more than 1 move', () => {
    const acutal1 = findPossibleMoves(cellPositions, 2, [0, 7]);
    const actual2 = findPossibleMoves(cellPositions, 3, [0, 7]);
    const actual3 = findPossibleMoves(cellPositions, 2, [6, 8]);

    const expected1 = [[1, 8], [0, 7], [2, 7]];
    const expected2 = [[1, 7], [2, 8], [3, 7]];
    const expected3 = [
      [6, 6], [6, 8],
      [5, 7], [7, 7],
      [5, 9], [7, 9],
      [4, 8], [8, 8]
    ];

    assert.deepStrictEqual(acutal1, expected1);
    assert.deepStrictEqual(actual2, expected2);
    assert.deepStrictEqual(actual3, expected3);
  });

  it('Should give possible room positions for given moves', () => {
    const actual1 = findPossibleMoves(cellPositions, 1, [4, 7]);
    const actual2 = findPossibleMoves(cellPositions, 2, [4, 7]);
    const expected1 = [[4, 6], [4, 8], [3, 7], [5, 7]];
    const expected2 = [[4, 7], [4, 6], [3, 8], [5, 8], [2, 7], [6, 7]];

    assert.deepStrictEqual(actual1, expected1);
    assert.deepStrictEqual(actual2, expected2);
  });

  it('Should not give room if entry point is invalid', () => {
    const actual = findPossibleMoves(cellPositions, 1, [7, 19]);
    const expected = [[7, 18], [7, 20], [8, 19]];

    assert.deepStrictEqual(actual, expected);
  });

  it('Should give possible moves from inside room', () => {
    const actual1 = findPossibleMoves(cellPositions, 1, [6, 19]);
    const actual2 = findPossibleMoves(cellPositions, 2, [6, 19]);
    const expected1 = [[6, 18], [6, 19]];
    const expected2 = [[6, 17], [6, 19], [5, 18], [7, 18]];

    assert.deepStrictEqual(actual1, expected1);
    assert.deepStrictEqual(actual2, expected2);
  });
});
