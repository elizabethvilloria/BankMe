const request = require('supertest');
const server = require('../server/server');

describe('Payment API', () => {
    it('should fetch all payments', async () => {
        const res = await request(server).get('/api/payments');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('success');
    });

    it('should create a new payment', async () => {
        const res = await request(server)
            .post('/api/payments')
            .send({
                card_id: 1,
                amount: 50,
                date: '2024-12-31'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.data.amount).toBe(50);
    });
}); 