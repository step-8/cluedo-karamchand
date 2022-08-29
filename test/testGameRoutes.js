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

  it('Should handle accuse', (done) => {
    const app = createApp();

    loginAsHost(app, 'vikram')
      .then(({ hostCookie, roomId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], roomId)
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

  it('Should not allow user to accuse if user is not current player',
    (done) => {
      const app = createApp();

      loginAsHost(app, 'vikram')
        .then(({ roomId }) => {
          return loginAllAsJoinees(app, ['james', 'rathod'], roomId);
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

const rollDiceReq = (app, cookie) => {
  return request(app)
    .get('/game/roll-dice')
    .set('Cookie', cookie)
    .then(() => cookie);
};

describe('GET /game/roll-dice', () => {

  it('Should roll dice', (done) => {
    const app = createApp();

    loginAsHost(app, 'vikram')
      .then(({ hostCookie, roomId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], roomId)
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

  it('Should forbid the request, when user don\'t have permission to roll the dice', (done) => {
    const app = createApp();

    loginAsHost(app, 'vicky')
      .then(({ roomId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], roomId);
      })
      .then((res) =>
        request(app)
          .get('/game/roll-dice')
          .set('Cookie', res[1].headers['set-cookie'])
          .expect(403)
          .then(() => done())
      );
  });
});

describe('POST /game/move', () => {

  it('Should move the character', (done) => {
    const app = createApp();

    loginAsHost(app, 'vikram')
      .then(({ hostCookie, roomId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], roomId)
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

  it('should forbid player from moving when they don\'t have move permission', (done) => {
    const app = createApp();

    loginAsHost(app, 'vicky')
      .then(({ roomId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], roomId);
      })
      .then((res) =>
        request(app)
          .post('/game/move')
          .set('Cookie', res[1].headers['set-cookie'])
          .send('position=[5, 10]')
          .expect(403)
          .then(() => done())
      );
  });
});

describe('POST /game/leave', () => {
  const app = createApp();

  it('Should leave the game', (done) => {
    loginAsHost(app, 'James')
      .then(({ hostCookie, roomId }) => {
        return loginAllAsJoinees(app, ['John', 'Arthur'], roomId)
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

describe('GET /game/pass-turn', () => {
  const app = createApp();

  it('Should pass the turn', (done) => {
    loginAsHost(app, 'James')
      .then(({ hostCookie, roomId }) => {
        return loginAllAsJoinees(app, ['John', 'Arthur'], roomId)
          .then(() => hostCookie);
      })
      .then(hostCookie => gameReq(app, hostCookie))
      .then((hostCookie) => {
        request(app)
          .get('/game/pass-turn')
          .set('Cookie', hostCookie)
          .expect(200, done);
      });
  });
});
