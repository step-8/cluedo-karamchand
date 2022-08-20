const request = require('supertest');
const { createApp } = require('../src/app');

describe('GET /api/game', () => {
  let gameId;
  const app = createApp();

  beforeEach((done) => {

    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .post('/host')
          .send('maxPlayers=3')
          .set('Cookie', res.headers['set-cookie'])
          .end((err, res) => {
            gameId = res.headers.location.split('/').pop();
            done();
          });
      });
  });

  it('Should serve home page for valid user', (done) => {
    request(app)
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(app)
          .post('/join')
          .send(`room-id=${gameId}`)
          .set('Cookie', res.headers['set-cookie'])
          .end((err, res) => {
            request(app)
              .get('/api/game')
              .set('Cookie', res.headers['set-cookie'])
              .expect(/players/)
              .expect(200, done);
          });
      });
  });

  it('Should redirect to login page for invalid user', (done) => {
    request(createApp())
      .get('/api/game')
      .expect('location', '/login')
      .expect(302, done);
  });
});
