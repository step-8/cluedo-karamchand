const request = require('supertest');
const { createApp } = require('../src/app.js');

describe('GET /boardApi', () => {
  it('should give the board data', (done) => {
    const app = createApp();

    request(app)
      .get('/boardApi')
      .expect('content-type', /json/)
      .expect(/{"startingPos":\[.*\],"tiles":\[.*\],"rooms":\[.*\]}/)
      .expect(200, done);
  });
});

describe('GET /game', () => {
  it('Should redirect to login page if user is not logged in', (done) => {
    const app = createApp();

    request(app)
      .get('/game')
      .expect('location', '/login')
      .expect(302, done);
  });

});
