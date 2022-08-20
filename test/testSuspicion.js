const { assert } = require('chai');
const { Suspicion } = require('../src/model/suspicion.js');

describe('suspicion', () => {
  const suspectedElements = {
    character: 'Mustard',
    weapon: 'Rope',
    room: 'Hall'
  };

  it('Should return true if two suspicions are equal', () => {

    const suspicion1 = new Suspicion('Scarlett', suspectedElements, 'Green');
    const suspicion2 = new Suspicion('Scarlett', suspectedElements, 'Green');

    assert.ok(suspicion1.equals(suspicion2));
  });

  it('Should return false if two suspicions are not equal', () => {

    const suspicion1 = new Suspicion('Scarlett', suspectedElements, 'White');
    const suspicion2 = new Suspicion('Mustard', suspectedElements, 'Plum');

    assert.notOk(suspicion1.equals(suspicion2));
  });

  it('Should return true if suspicion is ruled out', () => {
    const suspicion = new Suspicion('Green', suspectedElements, 'Plum');

    assert.ok(suspicion.ruleOut('Plum', 'Rope'));
  });

  it('Should return false if suspicion is not ruled out', () => {
    const suspicion = new Suspicion('White', suspectedElements, 'Plum');

    assert.notOk(suspicion.ruleOut('Plum', 'Revolver'));
  });

  it('Should give the suspcion before ruling out', () => {
    const suspicion = new Suspicion('Plum', suspectedElements, 'White');
    const actual = suspicion.getSuspicion('Plum');
    const expected = {
      suspectedBy: 'Plum',
      suspectedElements,
      suspicionBreaker: 'White',
      ruledOut: false,
      ruledOutWith: null
    };

    assert.deepStrictEqual(actual, expected);
  });

  it('Should give the suspcion after ruling out', () => {
    const suspicion = new Suspicion('Plum', suspectedElements, 'White');
    suspicion.ruleOut('White', 'Rope');

    const actual = suspicion.getSuspicion('Plum');
    const expected = {
      suspectedBy: 'Plum',
      suspectedElements,
      suspicionBreaker: 'White',
      ruledOut: true,
      ruledOutWith: 'Rope'
    };

    assert.deepStrictEqual(actual, expected);
  });

  it('Should not provide the evidence to others except who suspected ', () => {
    const suspicion = new Suspicion('Plum', suspectedElements, 'White');
    suspicion.ruleOut('White', 'Rope');

    const actual = suspicion.getSuspicion('Green');
    const expected = {
      suspectedBy: 'Plum',
      suspectedElements,
      suspicionBreaker: 'White',
      ruledOut: true,
    };

    assert.deepStrictEqual(actual, expected);
  });
});
