const request = require('supertest');
const { createApp } = require('../src/app.js');
const { loginAsHost } = require('./testFixture.js');

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
      .then(({ gameId, hostCookie }) => {
        cookie = hostCookie;
        roomId = gameId;
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
            .post('/host')
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
});
