const request = require('supertest');
const { createApp } = require('../src/app.js');

describe('GET /lobby/:gameId', () => {
  it('Should redirect to login if not logged in', (done) => {
    const app = createApp();

    request(app)
      .get('/lobby/ABCED')
      .expect('location', '/login')
      .expect(302, done);
  });

  let gameId;
  const app = createApp();

  before((done) => {
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

  it('Should redirect to home if not hosted/joined the game', (done) => {
    request(app)
      .post('/login')
      .send('username=james')
      .end((err, res) => {
        request(app)
          .get(`/lobby/${gameId}`)
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', '/')
          .expect(302, done);
      });
  });

  it('Should redirect to respective lobby if requested with different id',
    (done) => {
      let myGameId;

      request(app)
        .post('/login')
        .send('username=james')
        .end((err, res) => {
          request(app)
            .post('/host')
            .send('maxPlayers=3')
            .set('Cookie', res.headers['set-cookie'])
            .end((err, res) => {
              myGameId = res.headers.location.split('/').pop();
              request(app)
                .get(`/lobby/${gameId}`)
                .set('Cookie', res.headers['set-cookie'])
                .expect('location', `/lobby/${myGameId}`)
                .expect(302, done);
            });
        });
    });
});
