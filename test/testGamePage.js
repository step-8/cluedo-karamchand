const request = require('supertest');
const { createApp } = require('../src/app.js');
const { loginAsHost, loginAllAsJoinees } = require('./testFixture.js');

describe('GET /game', () => {
  it('Should redirect to login page if user is not logged in', (done) => {
    const app = createApp();

    request(app)
      .get('/game')
      .expect('location', '/login')
      .expect(302, done);
  });

  it('Should redirect to homepage if not joined/hosted a game', (done) => {
    const app = createApp();
    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .get('/game')
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', '/')
          .expect(302, done);
      });
  });

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

  it('Should not serve game page if game is not ready', (done) => {
    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .post('/host')
          .set('Cookie', res.headers['set-cookie'])
          .end((err, res) => {
            const id = res.headers.location.split('/').pop();
            request(app)
              .get('/game')
              .set('Cookie', res.headers['set-cookie'])
              .expect('location', `/lobby/${id}`)
              .expect(302, done);
          });
      });
  });

  it('Should serve game page if all players joined', (done) => {
    loginAllAsJoinees(app, ['ram', 'shyam'], roomId)
      .then(() => {
        request(app)
          .get('/game')
          .set('Cookie', cookie)
          .expect('content-type', /html/)
          .expect(/<title>CLUEDO<\/title>/)
          .expect(200, done);
      });
  });
});
