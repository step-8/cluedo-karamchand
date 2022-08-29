const { findPossibleMoves } = require('../utils/findPossibleMoves.js');

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

  findPossiblePositions(from, steps) {
    const roomDetails = this.#rooms.map(room => room.info);
    const cellPositions = [...this.#tiles];
    return findPossibleMoves({ cellPositions, roomDetails }, steps, from);
  }

  getRoom(tile) {
    const room = this.#rooms.find(room => room.isInside(tile));
    return room ? room.info : null;
  }
}

module.exports = { Board };
