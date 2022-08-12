const request = require('supertest');
const { createApp } = require('../src/app.js');

const login = (app, username) => {
  return request(app)
    .post('/login')
    .send(`username=${username}`);
};

const loginAsHost = (app, username) => {
  return login(app, username)
    .then(res => {
      return request(app)
        .post('/host')
        .send('maxPlayers=3')
        .set('Cookie', res.headers['set-cookie'])
        .then((res) => {
          return {
            hostCookie: res.headers['set-cookie'],
            gameId: res.headers.location.split('/').pop()
          };
        });
    });
};

const joinGame = (app, username, gameId) => {
  return login(app, username)
    .then(res => {
      return request(app)
        .post('/join')
        .set('Cookie', res.headers['set-cookie'])
        .send(`room-id=${gameId}`);
    });
};

const loginAllAsJoinees = (app, players, gameId) => {
  return Promise.all(players.map(player => joinGame(app, player, gameId)));
};
describe('POST /game/accuse', () => {
  const app = createApp();

  it('Should handle accuse', (done) => {
    loginAsHost(app, 'vikram')
      .then(({ hostCookie, gameId }) => {
        return loginAllAsJoinees(app, ['james', 'rathod'], gameId)
          .then(() => hostCookie);
      })
      .then((hostCookie) => {
        request(app)
          .post('/game/accuse')
          .set('Cookie', hostCookie)
          .expect(201, done);
      });
  });
});
