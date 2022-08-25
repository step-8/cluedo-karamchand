const { assert } = require('chai');
const {
  CurrentPlayerVisitor,
  GeneralPlayerVisitor
} = require('../src/model/visitors.js');

const mockGame = (gameId, players, characters, envelope, board) => {
  const mockedGame = {
    gameId,
    diceValue: [4, 5],
    accusation: { character: 'Scarlett', weapon: 'Rope', room: 'Hall' },
    possibleMoves: [1, 2]
  };

  return mockedGame;
};

const mockCharacter = (name, position) => {
  return { name, position };
};

const mockPlayer = (id, name, characterName, cards) => {
  return {
    name,
    character: characterName,
    cards,
    permissions: [],
    enable: function (action) {
      this.permissions.push(action);
    }
  };
};

const mockSuspicion = (suspectedBy, suspectedElements, suspicionBreaker) => {
  return {
    suspectedBy,
    suspectedElements,
    suspicionBreaker,
    ruledOutWith: null,
    ruledOut: false,
    isRuledOut: function () {
      return this.ruledOut;
    },
    ruleOut: function (ruledOutBy, evidence) {
      this.ruledOutWith = evidence;
    }
  };
};

describe('CurrentPlayerVisitor', () => {
  it('should give game state', () => {
    const expected = {
      gameId: 1,
      diceValue: [4, 5],
      accusation: { character: 'Scarlett', weapon: 'Rope', room: 'Hall' },
      possibleMoves: [1, 2],
      players: [],
      characters: []
    };

    const players = [];
    const characters = [];
    const envelope = {};

    const mockedGame = mockGame(1, players, characters, envelope);
    const visitor = new CurrentPlayerVisitor();
    visitor.visitGame(mockedGame);

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });

  it('should give JSON data of characters', () => {
    const mockedCharacter1 = mockCharacter('Scarlett', [1, 5]);
    const mockedCharacter2 = mockCharacter('Mustard', [3, 9]);

    const visitor = new CurrentPlayerVisitor();
    visitor.visitCharacter(mockedCharacter1);
    visitor.visitCharacter(mockedCharacter2);

    const expected = {
      players: [],
      characters: [
        { name: 'Scarlett', position: [1, 5] },
        { name: 'Mustard', position: [3, 9] }
      ]
    };

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });

  it('should give JSON data of players', () => {
    const cards = [];
    const mockedPlayer1 = mockPlayer(1, 'James', 'Scarlett', cards);
    const mockedPlayer2 = mockPlayer(2, 'John', 'Mustard', cards);

    const visitor = new CurrentPlayerVisitor();
    visitor.visitPlayer(mockedPlayer1);
    visitor.visitPlayer(mockedPlayer2);

    const expected = {
      characters: [],
      players: [
        { name: 'James', character: 'Scarlett' },
        { name: 'John', character: 'Mustard' }
      ]
    };

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });

  it('should give data of currentPlayer', () => {
    const cards = ['Hall'];

    const currentPlayer = mockPlayer(1, 'James', 'Scarlett', cards);
    currentPlayer.enable('roll-dice');

    const visitor = new CurrentPlayerVisitor();
    visitor.visitCurrentPlayer(currentPlayer);

    const expected = {
      characters: [],
      players: [],
      currentPlayer: {
        name: 'James',
        character: 'Scarlett',
      }
    };

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });

  it('should give JSON data of suspicion', () => {
    const suspectedElements = {
      character: 'Mustard',
      weapon: 'Rope',
      room: 'Hall'
    };

    const suspcion = mockSuspicion('Scarlett', suspectedElements, 'White');
    suspcion.ruleOut('White', 'Rope');

    const visitor = new CurrentPlayerVisitor();
    visitor.visitSuspicion(suspcion);

    const expected = {
      characters: [],
      players: [],
      suspicion: {
        suspectedBy: 'Scarlett',
        suspectedElements,
        suspicionBreaker: 'White',
        ruledOutWith: 'Rope',
        ruledOut: false
      }
    };

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });

  it('should give JSON data of requester', () => {
    const cards = ['Rope'];
    const player = mockPlayer(1, 'James', 'Scarlett', cards);
    player.enable('accuse');

    const visitor = new CurrentPlayerVisitor();
    visitor.visitYou(player, null);

    const expected = {
      players: [],
      characters: [],
      you: {
        name: 'James',
        character: 'Scarlett',
        cards: ['Rope'],
        permissions: ['accuse'],
        room: null
      }
    };

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });
});

describe('GeneralPlayerVisitor', () => {
  it('should give game state for other players ', () => {
    const expected = {
      gameId: 1,
      diceValue: [4, 5],
      accusation: { character: 'Scarlett', weapon: 'Rope', room: 'Hall' },
      players: [],
      characters: []
    };
    const players = [];
    const characters = [];
    const envelope = {};

    const mockedGame = mockGame(1, players, characters, envelope);
    const visitor = new GeneralPlayerVisitor();
    visitor.visitGame(mockedGame);

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });

  it('should give JSON data of suspicion for other players', () => {
    const suspectedElements = {
      character: 'Mustard',
      weapon: 'Rope',
      room: 'Hall'
    };

    const suspcion = mockSuspicion('Scarlett', suspectedElements, 'White');
    suspcion.ruleOut('White', 'Rope');
    const visitor = new GeneralPlayerVisitor();

    visitor.visitSuspicion(suspcion);

    const expected = {
      characters: [],
      players: [],
      suspicion: {
        suspectedBy: 'Scarlett',
        suspectedElements,
        suspicionBreaker: 'White',
        ruledOut: false
      }
    };

    assert.deepStrictEqual(visitor.getJSON(), expected);
  });

});
