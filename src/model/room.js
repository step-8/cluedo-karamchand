const isEqual = (array1, array2) =>
  array1.every((element, index) => element === array2[index]);

class Room {
  #name;
  #position;
  #entryPoint;
  #secretPassage;
  constructor(name, position, entryPoint, secretPassage) {
    this.#name = name;
    this.#position = position;
    this.#entryPoint = entryPoint;
    this.#secretPassage = secretPassage;
  }

  get info() {
    return {
      name: this.#name,
      position: this.#position,
      entryPoint: this.#entryPoint,
      secretPassage: this.#secretPassage
    };
  }

  isInside(tile) {
    return isEqual(this.#position, tile);
  }

}

module.exports = { Room };
