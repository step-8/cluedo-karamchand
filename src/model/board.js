const isEqual = (array1, array2) =>
  array1.every((element, index) => element === array2[index]);

class Board {
  #tiles;
  #rooms;

  constructor(tiles, rooms) {
    this.#tiles = tiles;
    this.#rooms = rooms;
  }

  isInsideRoom(tile) {
    return this.#rooms.some(({ position }) =>
      isEqual(position, tile));
  }
}

module.exports = { Board };