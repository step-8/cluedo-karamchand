const request = require('supertest');
const { createApp } = require('../src/app.js');
const { loginAllAsJoinees, loginAsHost } = require('./testFixture.js');

describe('GET /', () => {
  it('Should serve home page for valid user', (done) => {
    request(createApp())
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(createApp())
          .get('/')
          .set('Cookie', res.headers['set-cookie'])
          .expect(/Home/)
          .expect(200, done);
      });
  });

  it('Should redirect to login page for invalid user', (done) => {
    request(createApp())
      .get('/')
      .expect(/login/)
      .expect(302, done);
  });

  let roomId;
  let cookie;
  const app = createApp();

  beforeEach((done) => {
    loginAsHost(app, 'bob')
      .then((headers) => {
        roomId = headers.roomId;
        cookie = headers.hostCookie;
        done();
      });
  });

  it('Should redirect to game if game is already started', (done) => {
    loginAllAsJoinees(app, ['ram', 'shyam'], roomId)
      .then(() => {
        request(app)
          .get('/game') // To create the game
          .set('Cookie', cookie)
          .end((err, res) => {
            request(app)
              .get('/')
              .set('Cookie', cookie)
              .expect('location', '/game')
              .expect(302, done);
          });
      });
  });

  it('Should redirect to lobby if user is already in the lobby',
    (done) => {
      loginAsHost(app, 'bob')
        .then(({ hostCookie }) => {
          request(app)
            .get('/')
            .set('Cookie', hostCookie)
            .expect('location', /\/lobby/, done);
        });

    });
});