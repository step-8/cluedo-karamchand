const request = require('supertest');
const { createApp } = require('../src/app');

describe('homepage', () => {
  it('Should show home page for GET /', (done) => {
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

  it('should serve lobby for POST /join', (done) => {
    request(createApp())
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(createApp())
          .post('/join')
          .send('room-id=123')
          .set('Cookie', res.headers['set-cookie'])
          .expect(/lobby/)
          .expect(200, done);
      });
  });
});

