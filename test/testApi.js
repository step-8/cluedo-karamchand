const request = require('supertest');
const { createApp } = require('../src/app');

describe('GET /api/game', () => {
  it('Should serve home page for valid user', (done) => {
    request(createApp())
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(createApp())
          .post('/join')
          .send('room-id=123')
          .set('Cookie', res.headers['set-cookie'])
          .end((err, res) => {
            request(createApp())
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
