const assert = require('assert');
const { Character } = require('../src/model/character.js');

describe('Character', () => {
  it('Should compare another instance of character', () => {
    const character1 = new Character('bob', [1, 1]);
    const character2 = new Character('bob', [1, 1]);
    const character3 = new Character('boddy', [1, 1]);

    assert.ok(character1.equals(character2));
    assert.ok(!character1.equals(character3));
  });

  it('Should give the character info', () => {
    const character = new Character('bob', [1, 1]);
    const expected = { name: 'bob', position: [1, 1] };

    assert.deepStrictEqual(character.info, expected);
  });
});
