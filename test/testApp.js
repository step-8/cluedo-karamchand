const request = require('supertest');
const { createApp } = require('../src/app.js');
require('dotenv').config();

describe('Sample test', () => {
  it('Testing server', (done) => {
    const app = createApp();

    request(app)
      .get('/')
      .expect(404, done);
  });
});
