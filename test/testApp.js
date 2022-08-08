const request = require('supertest');
const { createApp } = require('../src/app.js');
require('dotenv').config();

describe('Sample test', () => {
  it('Testing server', (done) => {
    const app = createApp();

    request(app)
      .get('/')
      .expect(404, done);
  });
});

describe('GET /login', () => {
  it('Should serve the login page', (done) => {
    const app = createApp();

    request(app)
      .get('/login')
      .expect('content-type', /html/)
      .expect(/login/)
      .expect(200, done);
  });
});

describe('POST /login', () => {
  it('Should redirect to home on successfull login', (done) => {
    const app = createApp();

    request(app)
      .post('/login')
      .send('username=bob')
      .expect('set-cookie', /test_session=.*/)
      .expect('location', '/')
      .expect(302, done);
  });
});
