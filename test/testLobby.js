const { assert } = require('chai');
const request = require('supertest');
const { createApp } = require('../src/app.js');
const { loginAsHost, loginAllAsJoinees, joinGame } = require('./testFixture.js');

const startGame = (app, cookie) => {
  return request(app)
    .get('/game')
    .set('Cookie', cookie)
    .then(() => cookie);
};

describe('GET /lobby/:roomId', () => {
  it('Should redirect to login if not logged in', (done) => {
    const app = createApp();
    request(app)
      .get('/lobby/ABCED')
      .expect('location', '/login')
      .expect(302, done);
  });

  let roomId;
  let cookie;
  const app = createApp();

  beforeEach((done) => {
    loginAsHost(app, 'bob')
      .then((headers) => {
        cookie = headers.hostCookie;
        roomId = headers.roomId;
        done();
      });
  });

  it('Should serve lobby if room id is valid', (done) => {
    request(app)
      .get(`/lobby/${roomId}`)
      .set('Cookie', cookie)
      .expect('content-type', /html/)
      .expect(/Lobby/, done)
  });

  it('Should redirect to home if not hosted/joined the game', (done) => {
    request(app)
      .post('/login')
      .send('username=james')
      .end((err, res) => {
        request(app)
          .get(`/lobby/${roomId}`)
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', '/')
          .expect(302, done);
      });
  });

  it('Should redirect to respective lobby if requested with different id',
    (done) => {
      let myRoomId;

      request(app)
        .post('/login')
        .send('username=james')
        .end((err, res) => {
          request(app)
            .post('/lobby/host')
            .send('maxPlayers=3')
            .set('Cookie', res.headers['set-cookie'])
            .end((err, res) => {
              myRoomId = res.headers.location.split('/').pop();
              request(app)
                .get(`/lobby/${roomId}`)
                .set('Cookie', res.headers['set-cookie'])
                .expect('location', `/lobby/${myRoomId}`)
                .expect(302, done);
            });
        });
    });

  it('Should redirect to game if user is part of a game', (done) => {
    loginAllAsJoinees(app, ['bob', 'ram'], roomId)
      .then(() => {
        startGame(app, cookie)
          .then(() => {
            request(app)
              .get(`/lobby/${roomId}`)
              .set('Cookie', cookie)
              .expect('location', '/game')
              .expect(302, done);
          });
      });
  });
});

describe('POST /lobby/leave', () => {
  it('Should leave the lobby', (done) => {
    const app = createApp();

    loginAsHost(app, 'ram')
      .then(({ hostCookie }) => {
        request(app)
          .post('/lobby/leave')
          .set('Cookie', hostCookie)
          .expect('location', '/')
          .expect(302, done);
      });
  });

  it('Should redirect to home page if not part of the lobby', (done) => {
    const app = createApp();

    request(app)
      .post('/login')
      .send('username=ram')
      .end((err, res) => {
        request(app)
          .post('/lobby/leave')
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', '/')
          .expect(302, done);
      });
  });

  it('Should redirect to game if user is part of a game', (done) => {
    const app = createApp();

    loginAsHost(app, 'buddy')
      .then(({ roomId, hostCookie }) => {
        loginAllAsJoinees(app, ['bob', 'ram'], roomId)
          .then(() => {
            startGame(app, hostCookie)
              .then(() => {
                request(app)
                  .get(`/lobby/leave`)
                  .set('Cookie', hostCookie)
                  .expect('location', '/game')
                  .expect(302, done);
              });
          });
      })
  });

  it('Should rearrange the players in the lobby if someone leaves the lobby',
    (done) => {
      const app = createApp();

      loginAsHost(app, 'buddy')
        .then(({ hostCookie, roomId }) => {
          joinGame(app, 'ram', roomId)
            .then(({ headers }) => {
              request(app)
                .post('/lobby/leave')
                .set('Cookie', hostCookie)
                .end((err, res) => {
                  request(app)
                    .get('/api/lobby')
                    .set('Cookie', headers['set-cookie'])
                    .end((err, { text }) => {
                      const expected = [{ name: 'ram', character: 'scarlett' }];
                      const actual = JSON.parse(text).players;
                      assert.deepStrictEqual(actual, expected);
                      done();
                    });
                });
            });
        });
    });
});