const request = require('supertest');
const { createApp } = require('../src/app');
const { loginAsHost, loginAllAsJoinees } = require('./testFixture.js');

describe('GET /api/game', () => {
  let roomId;
  let cookie;
  const app = createApp();

  beforeEach((done) => {
    loginAsHost(app, 'bob')
      .then(({ gameId, hostCookie }) => {
        roomId = gameId;
        cookie = hostCookie;
        done();
      });
  });

  it('Should serve game stats for valid user', (done) => {
    const expectedJSON = new RegExp(`"gameId":"${roomId}"`, 'g');

    loginAllAsJoinees(app, ['ram', 'shyam'], roomId)
      .then(() => {
        request(app)
          .get('/game') // To create the game
          .set('Cookie', cookie)
          .end((err, res) => {
            request(app)
              .get('/api/game')
              .set('Cookie', cookie)
              .expect('content-type', /json/)
              .expect(expectedJSON, done);
          });
      });
  });

  it('Should redirect to login page for invalid user', (done) => {
    request(createApp())
      .get('/api/game')
      .expect('location', '/login')
      .expect(302, done);
  });

  it('Should not serve game stats if not hosted/joined', (done) => {
    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .get('/api/game')
          .set('Cookie', res.headers['set-cookie'])
          .expect('set-cookie', /error=40/)
          .expect('location', '/')
          .expect(302, done);
      });
  });
});

describe('GET /api/lobby', () => {
  const app = createApp();

  it('Should serve the lobby stats', (done) => {
    loginAsHost(app, 'bob')
      .then(({ hostCookie, gameId }) => {
        const expectedRoomId = new RegExp(`${gameId}`, 'g');

        request(app)
          .get('/api/lobby')
          .set('Cookie', hostCookie)
          .expect('content-type', /json/)
          .expect(expectedRoomId)
          .expect(200, done)
      });
  });

  it('Should redirect to login if user is not logged in', (done) => {
    request(app)
      .get('/api/lobby')
      .expect('location', '/login')
      .expect(302, done)
  });

  it('Should serve 403 if not hosted/joined', (done) => {
    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .get('/api/lobby')
          .set('Cookie', res.headers['set-cookie'])
          .expect('content-type', /json/)
          .expect('{"error":"Action forbidden"}')
          .expect(403, done);
      });
  });
});
