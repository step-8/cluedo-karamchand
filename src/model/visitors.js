class CurrentPlayerVisitor {
  data;
  #characters;
  #players;

  constructor() {
    this.data = {};
    this.#characters = [];
    this.#players = [];
  }

  visitGame(game) {
    this.data.gameId = game.gameId;
    this.data.diceValue = game.diceValue;
    this.data.accusation = game.accusation;
    this.data.possibleMoves = game.possibleMoves;
  }

  visitCharacter(character) {
    const characterInfo = {
      name: character.name, position: character.position
    };

    this.#characters.push(characterInfo);
  }

  visitPlayer(player) {
    const playerInfo = {
      name: player.name, character: player.character
    };

    this.#players.push(playerInfo);
  }

  visitCurrentPlayer(currentPlayer) {
    const currentPlayerInfo = {
      name: currentPlayer.name,
      character: currentPlayer.character,
    };

    this.data.currentPlayer = currentPlayerInfo;
  }

  visitSuspicion(suspicion) {
    const suspicionInfo = {
      suspectedBy: suspicion.suspectedBy,
      suspectedElements: suspicion.suspectedElements,
      suspicionBreaker: suspicion.suspicionBreaker,
      ruledOutWith: suspicion.ruledOutWith,
      ruledOut: suspicion.isRuledOut()
    };

    this.data.suspicion = suspicionInfo;
  }

  visitYou(you, roomInfo) {
    const yourInfo = {
      name: you.name,
      cards: you.cards,
      character: you.character,
      permissions: you.permissions,
      room: roomInfo
    };

    this.data.you = yourInfo;
  }

  visitLogger(logger) {
    this.data.logs = logger.logs;
  }

  getJSON() {
    this.data.characters = this.#characters;
    this.data.players = this.#players;

    return this.data;
  }
}

class GeneralPlayerVisitor extends CurrentPlayerVisitor {
  constructor() {
    super();
  }

  visitGame(game) {
    this.data.gameId = game.gameId;
    this.data.diceValue = game.diceValue;
    this.data.accusation = game.accusation;
  }

  visitSuspicion(suspicion) {
    const suspicionInfo = {
      suspectedBy: suspicion.suspectedBy,
      suspectedElements: suspicion.suspectedElements,
      suspicionBreaker: suspicion.suspicionBreaker,
      ruledOut: suspicion.isRuledOut()
    };

    this.data.suspicion = suspicionInfo;
  }

}

module.exports = { CurrentPlayerVisitor, GeneralPlayerVisitor };