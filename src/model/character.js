const { isEqual } = require('../utils/isEqual.js');

class Character {
  #name;
  #position;

  constructor(name, position) {
    this.#name = name;
    this.#position = position;
  }

  set position(newPosition) {
    this.#position = newPosition;
  }

  get position() {
    return this.#position;
  }

  get name() {
    return this.#name;
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
