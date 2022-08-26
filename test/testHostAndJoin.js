const request = require('supertest');
const { assert } = require('chai');
const { createApp } = require('../src/app.js');
const { loginAllAsJoinees, loginAsHost, joinGame } = require('./testFixture.js');

const startGame = (app, cookie) => {
  return request(app)
    .get('/game')
    .set('Cookie', cookie)
    .then(() => cookie);
};

describe('POST /lobby/join', () => {
  let roomId, cookie;
  const app = createApp();

  beforeEach((done) => {
    loginAsHost(app, 'bob')
      .then((headers) => {
        roomId = headers.roomId;
        cookie = headers.hostCookie;
        done();
      });
  });

  it('Should join the player to the lobby', (done) => {
    request(app)
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(app)
          .post('/lobby/join')
          .send(`room-id=${roomId}`)
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', `/lobby/${roomId}`)
          .expect(302, done);
      });
  });

  it('Should send error for invalid room-id', (done) => {
    request(app)
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(app)
          .post('/lobby/join')
          .send('room-id=12345')
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', '/')
          .expect(302)
          .end((err, res) => {
            const cookie = res.headers['set-cookie'][0].split(';')[0];
            assert.strictEqual(cookie, 'error=40');
            done();
          });
      });
  });

  it('Should send error if lobby is full', (done) => {
    loginAllAsJoinees(app, ['bob', 'buddy'], roomId)
      .then(() => {
        request(app)
          .post('/login')
          .send('username=ab')
          .end((err, res) => {
            request(app)
              .post('/lobby/join')
              .send(`room-id=${roomId}`)
              .set('Cookie', res.headers['set-cookie'])
              .expect('location', '/')
              .expect(302)
              .end((err, res) => {
                const cookie = res.headers['set-cookie'][0].split(';')[0];
                assert.strictEqual(cookie, 'error=50');
                done();
              });
          });
      });
  });

  it('Should send error if game has already started', (done) => {
    loginAllAsJoinees(app, ['bob', 'buddy'], roomId)
      .then(() => {
        startGame(app, cookie)
          .then((cookie) => {
            request(app)
              .post('/login')
              .send('username=ab')
              .end((err, res) => {
                request(app)
                  .post('/lobby/join')
                  .send(`room-id=${roomId}`)
                  .set('Cookie', res.headers['set-cookie'])
                  .expect('location', '/')
                  .expect(302)
                  .end((err, res) => {
                    const cookie = res.headers['set-cookie'][0].split(';')[0];
                    assert.strictEqual(cookie, 'error=50');
                    done();
                  });
              });
          });
      });
  });

  it('Should redirect to login page for invalid user', (done) => {
    request(createApp())
      .post('/lobby/join')
      .expect(/login/)
      .expect(302, done);
  });

  it('Should not allow to join same game if joinee is part of that game',
    (done) => {
      const app = createApp();
      loginAsHost(app, 'bob')
        .then(({ roomId }) => {
          joinGame(app, 'ram', roomId)
            .then(({ headers }) => {
              request(app)
                .post('/lobby/join')
                .send(`room-id=${roomId}`)
                .set('Cookie', headers['set-cookie'])
                .expect('location', `/lobby/${roomId}`)
                .expect(302)
                .end(() => {
                  request(app)
                    .get('/api/lobby')
                    .set('Cookie', headers['set-cookie'])
                    .end((err, res) => {
                      const players = JSON.parse(res.text).players;
                      assert.strictEqual(players.length, 2);
                      done();
                    });
                });
            });
        });
    });

  it('Should not allow to join a game if joinee is already part of a game',
    (done) => {
      const app = createApp();
      loginAsHost(app, 'bob')
        .then(({ roomId: myRoomId }) => {
          joinGame(app, 'ram', myRoomId)
            .then(({ headers }) => {
              request(app)
                .post('/lobby/join')
                .send(`room-id=${roomId}`) //another room id
                .set('Cookie', headers['set-cookie'])
                .expect('location', `/lobby/${myRoomId}`)
                .expect(302, done);
            });
        });
    });
});

describe('POST /lobby/host', () => {
  it('Should host the game with number of players', (done) => {
    const app = createApp();
    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .post('/lobby/host')
          .set('Cookie', res.headers['set-cookie'])
          .send('maxPlayers=3')
          .expect('location', /\/lobby\/...../)
          .expect(302, done);
      });
  });

  it('Should host the game with 3 players if maxPlayers not provided',
    (done) => {
      const app = createApp();

      request(app)
        .post('/login')
        .send('username=bob')
        .end((err, res) => {
          request(app)
            .post('/lobby/host')
            .set('Cookie', res.headers['set-cookie'])
            .send('maxPlayers=')
            .expect('location', /\/lobby\/...../)
            .expect(302)
            .end((err, res) => {
              request(app)
                .get('/api/lobby')
                .set('Cookie', res.headers['set-cookie'])
                .expect(/"maxPlayers":3/, done);
            });
        });
    });

  it('Should redirect to login page for invalid user', (done) => {
    request(createApp())
      .post('/lobby/host')
      .expect(/login/)
      .expect(302, done);
  });

  it('Should not allow to host multiple games if host is part of a game',
    (done) => {
      const app = createApp();
      loginAsHost(app, 'bob')
        .then(({ hostCookie, roomId }) => {
          request(app)
            .post('/lobby/host')
            .set('Cookie', hostCookie)
            .expect('location', `/lobby/${roomId}`)
            .expect(302, done);
        });
    });

  it('Should not allow to host game if joinee is already part of a game',
    (done) => {
      const app = createApp();
      loginAsHost(app, 'bob')
        .then(({ roomId }) => {
          joinGame(app, 'ram', roomId)
            .then(({ headers }) => {
              request(app)
                .post('/lobby/host')
                .set('Cookie', headers['set-cookie'])
                .expect('location', `/lobby/${roomId}`)
                .expect(302, done);
            });
        });
    });
});
