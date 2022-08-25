const { assert } = require('chai');
const { CurrentPlayerVisitor } = require('../src/model/visitors.js');

const mockedGame = {
  gameId: 1,
  maxPlayers: 2,
  diceValue: [4, 5],
  accusation: { character: 'Scarlett', weapon: 'Rope', room: 'Hall' },
  possibleMoves: [1, 2]
};

const mockCharacter = (name, position) => {
  return { name, position };
};

const mockPlayer = (id, name, characterName) => {
  return {
    name,
    character: characterName,
    cards: [],
    addCard: function (card) {
      this.cards.push(card);
    },
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
  it('should equate currentPlayerVisitor', () => {
    const visitor1 = new CurrentPlayerVisitor(1);
    const visitor2 = new CurrentPlayerVisitor(1);

    assert.ok(visitor1.equals(visitor2));

    const visitor3 = new CurrentPlayerVisitor(3);

    assert.notOk(visitor1.equals(visitor3));
  });

  it('should give game state', () => {
    const expected = {
      gameId: 1,
      maxPlayers: 2,
      diceValue: [4, 5],
      accusation: { character: 'Scarlett', weapon: 'Rope', room: 'Hall' },
      possibleMoves: [1, 2],
      players: [],
      characters: []
    };

    const visitor = new CurrentPlayerVisitor(1);
    visitor.visitGame(mockedGame);

    assert.deepStrictEqual(expected, visitor.getJSON());
  });

  it('should give JSON data of characters', () => {
    const mockedCharacter1 = mockCharacter('Scarlett', [1, 5]);
    const mockedCharacter2 = mockCharacter('Mustard', [3, 9]);

    const visitor = new CurrentPlayerVisitor(1);
    visitor.visitCharacter(mockedCharacter1);
    visitor.visitCharacter(mockedCharacter2);

    const expected = {
      players: [],
      characters: [
        { name: 'Scarlett', position: [1, 5] },
        { name: 'Mustard', position: [3, 9] }
      ]
    };

    assert.deepStrictEqual(expected, visitor.getJSON());
  });

  it('should give JSON data of players', () => {
    const mockedPlayer1 = mockPlayer(1, 'James', 'Scarlett');
    const mockedPlayer2 = mockPlayer(2, 'John', 'Mustard');

    const visitor = new CurrentPlayerVisitor(1);
    visitor.visitPlayer(mockedPlayer1);
    visitor.visitPlayer(mockedPlayer2);

    const expected = {
      characters: [],
      players: [
        { name: 'James', character: 'Scarlett' },
        { name: 'John', character: 'Mustard' }
      ]
    };

    assert.deepStrictEqual(expected, visitor.getJSON());
  });

  it('should give data of currentPlayer', () => {
    const currentPlayer = mockPlayer(1, 'James', 'Scarlett');
    currentPlayer.addCard('hall');
    currentPlayer.enable('roll-dice');

    const visitor = new CurrentPlayerVisitor(1);
    visitor.visitCurrentPlayer(currentPlayer);

    const expected = {
      characters: [],
      players: [],
      currentPlayer: {
        name: 'James',
        character: 'Scarlett',
        cards: ['hall'],
        permissions: ['roll-dice']
      }
    };

    assert.deepStrictEqual(expected, visitor.getJSON());
  });

  it('should give JSON data of suspicion', () => {
    const suspectedElements = {
      character: 'Mustard',
      weapon: 'Rope',
      room: 'Hall'
    };

    const suspcion = mockSuspicion('Scarlett', suspectedElements, 'White');
    suspcion.ruleOut('White', 'Rope');

    const visitor = new CurrentPlayerVisitor(1);
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

    assert.deepStrictEqual(expected, visitor.getJSON());
  });

  it('should give JSON data of requester', () => {
    const player = mockPlayer(1, 'James', 'Scarlett');
    player.addCard('Rope');
    player.enable('accuse');

    const visitor = new CurrentPlayerVisitor(1);
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

    assert.deepStrictEqual(expected, visitor.getJSON());
  });
});
