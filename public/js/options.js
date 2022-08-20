const highlightOption = (optionElement) => {
  optionElement.classList.add('highlight');
};

class Options {
  #options;

  constructor() {
    this.#options = [];
  }

  add(btnId, isAllowed, callBack) {
    this.#options.push(new Option(btnId, isAllowed, callBack));
  }

  enable() {
    this.#options.forEach(option => option.enable());
  }
}

class Option {
  #btnId;
  #isAllowed;
  #callBack;

  constructor(btnId, isAllowed, callBack) {
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
