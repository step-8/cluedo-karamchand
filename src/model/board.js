const isEqual = (array1, array2) =>
  array1.every((element, index) => element === array2[index]);

class Board {
  #tiles;
  #rooms;
  #characters;

  constructor(tiles, rooms, characters) {
    this.#tiles = tiles;
    this.#rooms = rooms;
    this.#characters = characters;
  }

  isCharacterInsideRoom(characterName) {
    const characterPosition = this.#characters[characterName].position;
    return this.#rooms.some(({ position }) =>
      isEqual(position, characterPosition));
  }
}

module.exports = { Board };
