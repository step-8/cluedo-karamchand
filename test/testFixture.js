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
            roomId: res.headers.location.split('/').pop()
          };
        });
    });
};

const joinGame = (app, username, roomId) => {
  return login(app, username)
    .then(res => {
      return request(app)
        .post('/join')
        .set('Cookie', res.headers['set-cookie'])
        .send(`room-id=${roomId}`);
    });
};

const loginAllAsJoinees = (app, players, roomId) => {
  return Promise.all(players.map(player => joinGame(app, player, roomId)));
};

module.exports = { loginAllAsJoinees, loginAsHost };
