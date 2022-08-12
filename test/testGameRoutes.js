const request = require('supertest');
const { createApp } = require('../src/app.js');

const hostLogin = (app, username, gameId) => {
  return request(app)
    .post('/login')
    .send(`username=${username}`)
    .then(res => {
      return request(app)
        .post('/host')
        .send('maxPlayers=3')
        .set('Cookie', res.headers['set-cookie'])
        .then((res) => {
          gameId.push(res.headers.location.split('/').pop());
        });
    });
};

const login = (app, username, gameId) => {
  return request(app)
    .post('/login')
    .send(`username=${username}`)
    .then(res => {
      return request(app)
        .post('/join')
        .set('Cookie', res.headers['set-cookie'])
        .send(`room-id=${gameId}`);
    });
};

const aRunningGameWith = (app, players, gameId) => {
  return Promise.all(players.map(player => login(app, player, gameId)));
};
describe('POST /game/accuse', () => {
  const app = createApp();
  const gameId = [];

  it('Should handle accuse', (done) => {
    request(app)
      .post('/login')
      .send('username=vikram')
      .end((err, res) => {
        request(app)
          .post('/host')
          .send('maxPlayers=3')
          .set('Cookie', res.headers['set-cookie'])
          .end((err, res) => {
            gameId.push(res.headers.location.split('/').pop());
            aRunningGameWith(app, ['james', 'rathod'], gameId[0])
              .then((res) => {
                request(app)
                  .post('/game/accuse')
                  .set('Cookie', res[0].headers['set-cookie'])
                  .expect(201, done);
              });
          });
      });
  });
});
