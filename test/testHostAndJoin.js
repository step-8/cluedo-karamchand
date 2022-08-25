const request = require('supertest');
const { assert } = require('chai');
const { createApp } = require('../src/app.js');
const { loginAllAsJoinees, loginAsHost } = require('./testFixture.js');

describe('POST /join', () => {
  let roomId;
  const app = createApp();

  beforeEach((done) => {
    loginAsHost(app, 'bob')
      .then(({ gameId }) => {
        roomId = gameId;
        done();
      });
  });

  it('Should join the player to the lobby', (done) => {
    request(app)
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(app)
          .post('/join')
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
          .post('/join')
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
    loginAllAsJoinees(app, ['bob', 'buddy'], roomId);

    request(app)
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(app)
          .post('/join')
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

  it('Should redirect to login page for invalid user', (done) => {
    request(createApp())
      .post('/join')
      .expect(/login/)
      .expect(302, done);
  });
});

describe('POST /host', () => {
  it('Should host the game with number of players', (done) => {
    const app = createApp();
    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .post('/host')
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
            .post('/host')
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
      .post('/host')
      .expect(/login/)
      .expect(302, done);
  });
});
