const request = require('supertest');
const { createApp } = require('../src/app.js');

describe('GET /boardApi', () => {
  it('should give the board data', (done) => {
    const app = createApp();

    request(app)
      .get('/boardApi')
      .expect('content-type', /json/)
      .expect(/{"startingPos":\[.*\],"tiles":\[.*\],"rooms":\[.*\]}/)
      .expect(200, done);
  });
});

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

  it('Should show board if user joined/hosted a game', (done) => {
    const app = createApp();

    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .post('/join')
          .send('room-id=123')
          .set('Cookie', res.headers['set-cookie'])
          .end((err, res) => {
            request(app)
              .get('/game')
              .set('Cookie', res.headers['set-cookie'])
              .expect(/html/)
              .expect(200, done);
          });
      });
  });
});
