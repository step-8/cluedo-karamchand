const { findPossibleMoves } = require('../utils/findPossibleMoves.js');
const { isEqual } = require('../utils/isEqual.js');

const isCellPresent = (cells, expectedCell) => {
  return cells.some(cell => isEqual(cell, expectedCell));
};

class Board {
  #tiles;
  #rooms;

  constructor(tiles, rooms) {
    this.#tiles = tiles;
    this.#rooms = rooms;
  }

  isInsideRoom(tile) {
    return this.#rooms.some(room => {
      return room.isInside(tile);
    });
  }

  #getAvailableTiles(blockedTiles) {
    return this.#tiles.filter(tile => !isCellPresent(blockedTiles, tile));
  }

  #isStuckInRoom(tile, blockedTiles) {
    if (!this.isInsideRoom(tile)) {
      return false;
    }
    const room = this.getRoom(tile);
    return isCellPresent(blockedTiles, room.entryPoint);
  }

  findPossiblePositions(from, steps, blockedTiles) {
    if (this.#isStuckInRoom(from, blockedTiles)) {
      return [];
    }
    const roomDetails = this.#rooms.map(room => room.info);
    const cellPositions = this.#getAvailableTiles(blockedTiles);
    return findPossibleMoves({ cellPositions, roomDetails }, steps, from);
  }

  getRoom(tile) {
    const room = this.#rooms.find(room => room.isInside(tile));
    return room ? room.info : null;
  }
}

module.exports = { Board };
