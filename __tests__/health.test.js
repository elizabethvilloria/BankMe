const request = require('supertest');
const server = require('../server/server');

afterAll((done) => {
  server.close(done);
});

describe('Health endpoint', () => {
  it('should return status ok and uptime', async () => {
    const res = await request(server).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
  });
}); 