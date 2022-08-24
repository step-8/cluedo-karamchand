const request = require('supertest');
const { createApp } = require('../src/app.js');

describe('GET /login', () => {
  it('should serve the login page', (done) => {
    const app = createApp();

    request(app)
      .get('/login')
      .expect('content-type', /html/)
      .expect(/login/)
      .expect(200, done);
  });

  it('should redirect to home page if already logged in', (done) => {
    const app = createApp();

    request(app)
      .post('/login')
      .send('username=bob')
      .expect('location', '/')
      .expect(302)
      .end((err, res) => {
        request(app)
          .get('/login')
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', '/')
          .expect(302, done);
      });
  });
});

describe('POST /login', () => {
  it('Should redirect to home on successful login', (done) => {
    const app = createApp();

    request(app)
      .post('/login')
      .send('username=bob')
      .expect('set-cookie', /test_session=.*/)
      .expect('location', '/')
      .expect(302, done);
  });

  it('should redirect to /login when no username provided', (done) => {
    const app = createApp();

    request(app)
      .post('/login')
      .send('username=')
      .expect('set-cookie', /error=30/)
      .expect('location', '/login')
      .expect(302, done);
  });
});

describe('GET /logout', () => {
  it('Should redirect to login page when not logged in but trying to logout', (done) => {
    const app = createApp();

    request(app)
      .get('/logout')
      .expect('location', '/login')
      .expect(302, done);
  });

  it('should redirect to /login after logout', (done) => {
    const app = createApp();

    request(app)
      .post('/login')
      .send('username=sam')
      .end((err, res) => {
        request(app)
          .get('/logout')
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', /login/)
          .expect(302, done);
      });
  });
});
