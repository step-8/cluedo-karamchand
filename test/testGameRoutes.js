const request = require('supertest');
const { createApp } = require('../src/app.js');
const { loginAsHost, loginAllAsJoinees } = require('./testFixture.js');

const gameReq = (app, cookie) => {
  return request(app)
    .get('/game')
    .set('Cookie', cookie)
    .then(() => cookie);
};
describe('POST /game/accuse', () => {
  const app = createApp();

  it('Should handle accuse', (done) => {
    loginAsHost(app, 'vikram')
      .then(({ hostCookie, gameId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], gameId)
          .then(() => hostCookie);
      })
      .then(hostCookie => gameReq(app, hostCookie))
      .then((hostCookie) => {
        request(app)
          .post('/game/accuse')
          .set('Cookie', hostCookie)
          .send({ character: 'green', weapon: 'rope', room: 'hall' })
          .expect(201, done);
      });
  });
});

const rollDiceReq = (app, cookie) => {
  return request(app)
    .get('/game/roll-dice')
    .set('Cookie', cookie)
    .then(() => cookie);
};

describe('GET /game/roll-dice', () => {
  const app = createApp();

  it('Should roll dice', (done) => {
    loginAsHost(app, 'vikram')
      .then(({ hostCookie, gameId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], gameId)
          .then(() => hostCookie);
      })
      .then(hostCookie => gameReq(app, hostCookie))
      .then((hostCookie) => {
        request(app)
          .get('/game/roll-dice')
          .set('Cookie', hostCookie)
          .expect(200, done);
      });
  });
});

describe('POST /game/move', () => {
  const app = createApp();

  it('Should move the character', (done) => {
    loginAsHost(app, 'vikram')
      .then(({ hostCookie, gameId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], gameId)
          .then(() => hostCookie);
      })
      .then(hostCookie => gameReq(app, hostCookie))
      .then(hostCookie => rollDiceReq(app, hostCookie))
      .then((hostCookie) => {
        request(app)
          .post('/game/move')
          .set('Cookie', hostCookie)
          .send('position=[7, 24]')
          .expect(201, done);
      });
  });
});

describe('POST /game/accuse', () => {
  const app = createApp();

  it('Should not allow user to accuse if user is not current player',
    (done) => {
      loginAsHost(app, 'vikram')
        .then(({ hostCookie, gameId }) => {
          return loginAllAsJoinees(app, ['james', 'rathod'], gameId);
        })
        .then((res) => {
          request(app)
            .post('/game/accuse')
            .set('Cookie', res[1].headers['set-cookie'])
            .send({ character: 'green', weapon: 'rope', room: 'hall' })
            .expect(403, done);
        });
    });
});

describe('POST /game/leave', () => {
  const app = createApp();

  it('Should leave the game', (done) => {
    loginAsHost(app, 'James')
      .then(({ hostCookie, gameId }) => {
        return loginAllAsJoinees(app, ['John', 'Arthur'], gameId)
          .then(() => hostCookie);
      })
      .then((hostCookie) => {
        request(app)
          .post('/game/leave')
          .set('Cookie', hostCookie)
          .expect('location', '/')
          .expect(302, done);
      });
  });
});
