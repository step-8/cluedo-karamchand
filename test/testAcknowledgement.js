const { assert } = require('chai');
const { AwaitingAcknowledgement } = require('../src/model/acknowledgement.js');

describe('AwaitingAcknowledgement', () => {
  it('Should return false if everyone not acknowledged', () => {
    const players = ['James', 'John'];

    const acknowledgement = new AwaitingAcknowledgement(players);
    acknowledgement.acknowledgeFrom('James');

    assert.notEqual(acknowledgement.hasEveryoneAcknowledged());
  });

  it('Should return true if everyone has acknowledged', () => {
    const players = ['James', 'John'];

    const acknowledgement = new AwaitingAcknowledgement(players);
    acknowledgement.acknowledgeFrom('James');
    acknowledgement.acknowledgeFrom('John');

    assert.ok(acknowledgement.hasEveryoneAcknowledged());
  });
});
