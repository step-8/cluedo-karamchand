const request = require('supertest');

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

module.exports = { loginAllAsJoinees, loginAsHost };
