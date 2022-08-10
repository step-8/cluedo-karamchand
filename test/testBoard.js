const request = require('supertest');
const { createApp } = require('../src/app.js');

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

  it('Should restrict access to game if game is not ready', (done) => {
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

  it('Should show board if all players joined', (done) => {
    request(app)
      .post('/login')
      .send('username=bob')
      .end((err, res) => {
        request(app)
          .post('/join')
          .send(`room-id=${gameId}`)
          .set('Cookie', res.headers['set-cookie'])
          .expect(302)
          .end(() => {
            request(app)
              .post('/login')
              .send('username=abc')
              .end((err, res) => {
                request(app)
                  .post('/join')
                  .send(`room-id=${gameId}`)
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
  });
});
