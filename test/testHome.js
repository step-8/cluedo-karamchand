const request = require('supertest');
const { createApp } = require('../src/app');

describe('homepage', () => {
  it('Should show home page for GET /', (done) => {
    request(createApp())
      .get('/')
      .expect(200, done);
  });

  it('should serve lobby for POST /join', (done) => {
    request(createApp())
      .post('/join')
      .send('roomId=123')
      .expect(200, done);
  });
});

