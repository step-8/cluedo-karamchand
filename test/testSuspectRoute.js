const request = require('supertest');
const { createApp } = require('../src/app.js');
const { loginAsHost, loginAllAsJoinees } = require('./testFixture.js');

describe('POST /game/suspect/make', () => {
  it('should forbid suspicion action if player does not have suspect permission.', (done) => {

    const app = createApp();

    loginAsHost(app, 'vicky')
      .then(({ roomId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], roomId);
      })
      .then((res) =>
        request(app)
          .get('/game/suspect/make')
          .set('Cookie', res[1].headers['set-cookie'])
          .expect(403)
          .then(() => done())
      );
  });
});

describe('POST /game/suspect/rule-out', () => {
  it('should forbid ruling out suspicion if player does not have rule out permission.', (done) => {

    const app = createApp();

    loginAsHost(app, 'vicky')
      .then(({ roomId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], roomId);
      })
      .then((res) =>
        request(app)
          .get('/game/suspect/rule-out')
          .set('Cookie', res[1].headers['set-cookie'])
          .expect(403)
          .then(() => done())
      );
  });
});

describe('POST /game/suspect/acknowledge', () => {
  it('should forbid acknowledgement if player does not have acknowledge permission.', (done) => {

    const app = createApp();

    loginAsHost(app, 'vicky')
      .then(({ roomId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], roomId);
      })
      .then((res) =>
        request(app)
          .get('/game/suspect/acknowledge')
          .set('Cookie', res[1].headers['set-cookie'])
          .expect(403)
          .then(() => done())
      );
  });
});
