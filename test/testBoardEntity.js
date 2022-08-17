const assert = require('assert');
const { Board } = require('../src/model/board.js');

const { cellPositions, roomPositions }
  = require('../data/cellPositions.json');

const characterPositions = {
  'scarlett': {
    'position': [
      7,
      24
    ]
  },
  'mustard': {
    'position': [
      0,
      17
    ]
  },
  'green': {
    'position': [
      14,
      0
    ]
  },
  'white': {
    'position': [
      9,
      0
    ]
  },
  'peacock': {
    'position': [
      23,
      6
    ]
  },
  'plum': {
    'position': [
      4,
      6
    ]
  }
};

describe('Board', () => {
  it('Should return true if character is inside the room', () => {
    const board = new Board(cellPositions, roomPositions, characterPositions);

    assert.ok(board.isCharacterInsideRoom('plum'));
  });

  it('Should return false if character is not inside the room', () => {
    const board = new Board(cellPositions, roomPositions, characterPositions);

    assert.ok(!board.isCharacterInsideRoom('white'));
  });
});
