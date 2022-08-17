const isEqual = (array1, array2) =>
  array1.every((element, index) => element === array2[index]);

class Character {
  #name;
  #position;

  constructor(name, position) {
    this.#name = name;
    this.#position = position;
  }

  get info() {
    return {
      name: this.#name,
      position: this.#position
    };
  }

  equals(anotherCharacter) {
    return anotherCharacter instanceof Character &&
      anotherCharacter.#name === this.#name &&
      isEqual(anotherCharacter.#position, this.#position);
  }
}

module.exports = { Character };
