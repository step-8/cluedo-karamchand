const highlightOption = (optionElement) => {
  optionElement.classList.add('highlight');
};

class Options {
  #options;

  constructor() {
    this.#options = [];
  }

  add(name, btnId, isAllowed, callBack) {
    this.#options.push(new Option(name, btnId, isAllowed, callBack));
  }

  enable() {
    this.#options.forEach(option => option.enable());
  }
}

class Option {
  #name;
  #btnId;
  #isAllowed;
  #callBack;

  constructor(name, btnId, isAllowed, callBack) {
    this.#name = name;
    this.#btnId = btnId;
    this.#isAllowed = isAllowed;
    this.#callBack = callBack;
  }

  enable() {
    if (!this.#isAllowed) {
      return;
    }

    const button = document.querySelector(this.#btnId);
    highlightOption(button);
    button.onclick = this.#callBack;
  }
}
