const request = require('supertest');
const server = require('../server/server');

afterAll((done) => server.close(done));

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(server).get('/nope/not-found');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Can't find/);
  });
}); 