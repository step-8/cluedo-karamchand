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
    return this.#rooms.some(room => {
      return room.isInside(tile);
    });
  }

  getRoom(tile) {
    const room = this.#rooms.find(room => room.isInside(tile));
    return room ? room.info.name : null;
  }
}

module.exports = { Board };
