class Suspicion {
  #suspectedBy;
  #suspectedElements;
  #suspicionBreaker;
  #ruledOutWith;
  #ruledOut;

  constructor(suspectedBy, suspectedElements, suspicionBreaker) {
    this.#suspectedBy = suspectedBy;
    this.#suspectedElements = suspectedElements;
    this.#suspicionBreaker = suspicionBreaker;
    this.#ruledOutWith = null;
    this.#ruledOut = false;
  }

  equals(otherSuspicion) {
    return otherSuspicion instanceof Suspicion &&
      this.#suspectedBy === otherSuspicion.#suspectedBy &&
      this.#suspicionBreaker === otherSuspicion.#suspicionBreaker &&
      Object.keys(this.#suspectedElements).every(element =>
        this.#suspectedElements[element] === otherSuspicion.#suspectedElements[element]);
  }

  #isAllowedToRuleOut(ruledOutBy, evidence) {
    return ruledOutBy === this.#suspicionBreaker &&
      Object.values(this.#suspectedElements).includes(evidence);
  }

  ruleOut(ruledOutBy, evidence) {
    if (this.#isAllowedToRuleOut(ruledOutBy, evidence)) {
      this.#ruledOutWith = evidence;
      this.#ruledOut = true;
    }

    return this.#ruledOut;
  }

  getSuspicion(requester) {
    const suspicion = {
      suspectedBy: this.#suspectedBy,
      suspectedElements: this.#suspectedElements,
      suspicionBreaker: this.#suspicionBreaker,
      ruledOut: this.#ruledOut
    };

    if (requester === this.#suspectedBy) {
      suspicion.ruledOutWith = this.#ruledOutWith;
    }

    return suspicion;
  }
}

module.exports = { Suspicion };
