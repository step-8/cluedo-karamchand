const request = require('supertest');
const { createApp } = require('../src/app');

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
});

describe('POST /join', () => {
  it('should redirect to lobby for valid user', (done) => {
    request(createApp())
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(createApp())
          .post('/join')
          .send('room-id=123')
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', '/lobby')
          .expect(302, done);
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
  it('should host the game with number of players', (done) => {
    const app = createApp();

    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .post('/host')
          .set('Cookie', res.headers['set-cookie'])
          .send('maxPlayers=3')
          .expect('location', '/lobby')
          .expect(302, done);
      });
  });
});
