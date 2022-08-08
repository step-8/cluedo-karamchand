const request = require('supertest');
const { createApp } = require('../src/app.js');
require('dotenv').config();

describe('GET /bad-request', () => {
  it('should serve 404 on bad request', (done) => {
    const app = createApp();

    request(app)
      .get('/badUrl')
      .expect(404, done);
  });
});
