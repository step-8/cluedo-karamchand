const { assert } = require('chai');
const { Logger } = require('../src/model/logger.js');

describe('Logger', () => {
  it('should log roll dice action', () => {
    const logger = new Logger();
    logger.logRollDice('Scarlett', [4, 5]);

    const expected = [
      { actor: 'Scarlett', action: 'roll-dice', result: [4, 5] }
    ];

    assert.deepStrictEqual(logger.logs, expected);
  });

  it('should log suspect action', () => {
    const logger = new Logger();
    const suspcion = { character: 'Plum', weapon: 'Rope', room: 'Hall' };
    logger.logSuspicion('Scarlett', suspcion);

    const expected = [
      { actor: 'Scarlett', action: 'suspect', actionData: suspcion }
    ];

    assert.deepStrictEqual(logger.logs, expected);
  });

  it('should log accuse action', () => {
    const logger = new Logger();
    const accusation = { character: 'White', weapon: 'Dagger', room: 'Study' };
    const result = true;
    logger.logAccusation('Scarlett', accusation, result);

    const expected = [
      { actor: 'Scarlett', action: 'accuse', actionData: accusation, result }
    ];

    assert.deepStrictEqual(logger.logs, expected);
  });

  it('should log rule out action', () => {
    const logger = new Logger();
    logger.logRuleOut('Green');

    const expected = [
      { actor: 'Green', action: 'rule-out' }
    ];

    assert.deepStrictEqual(logger.logs, expected);
  });

  it('should log secret passage usage action', () => {
    const logger = new Logger();
    logger.logSecretPassage('Peacock');

    const expected = [
      { actor: 'Peacock', action: 'secret-passage' }
    ];

    assert.deepStrictEqual(logger.logs, expected);
  });
});
