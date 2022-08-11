const { findPossibleMoves } = require('../src/handlers/rollDiceHandler.js');
const assert = require('assert');
const cellPositions = require('../data/cellPositions.json');

describe('findPossibleMoves', () => {
  it('Should give possible positions for single move', () => {
    const actual = findPossibleMoves(cellPositions, 1, [0, 7]);
    const expected = [[1, 7]];

    assert.deepStrictEqual(actual, expected);
  });

  it('Should give possible positions for more than single move', () => {
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

  it('Should give possible room positions for single move', () => {
    const actual = findPossibleMoves(cellPositions, 1, [4, 7]);
    const expected = [[4, 6], [4, 8], [3, 7], [5, 7]];

    assert.deepStrictEqual(actual, expected);
  });
});
