const request = require('supertest');
const { createApp } = require('../src/app');
const assert = require('assert');

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

  it('should redirect to lobby for valid user', (done) => {
    request(app)
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(app)
          .post('/join')
          .send(`room-id=${gameId}`)
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', `/lobby/${gameId}`)
          .expect(302, done);
      });
  });

  it('should send error for invalid room-id on same page', (done) => {
    request(app)
      .post('/login')
      .send('username=ab')
      .end((err, res) => {
        request(app)
          .post('/join')
          .send('room-id=12345')
          .set('Cookie', res.headers['set-cookie'])
          .expect('location', '/')
          .expect(302)
          .end((err, res) => {
            const cookie = res.headers['set-cookie'][0].split(';')[0];
            assert.strictEqual(cookie, 'error=40');
            done();
          });
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
          .expect('location', /\/lobby\/...../)
          .expect(302, done);
      });
  });

  it('Should host the game with 3 players if maxPlayers not provided',
    (done) => {
      const app = createApp();

      request(app)
        .post('/login')
        .send('username=bob')
        .end((err, res) => {
          request(app)
            .post('/host')
            .set('Cookie', res.headers['set-cookie'])
            .send('maxPlayers=')
            .expect('location', /\/lobby\/...../)
            .expect(302)
            .end((err, res) => {
              request(app)
                .get('/api/game')
                .set('Cookie', res.headers['set-cookie'])
                .expect(/"maxPlayers":3/, done);
            });
        });
    });

});
