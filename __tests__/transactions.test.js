const request = require('supertest');
const server = require('../server/server');

describe('Transaction API', () => {
    it('should fetch all transactions', async () => {
        const res = await request(server).get('/api/transactions');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('success');
    });

    it('should create a new transaction', async () => {
        const res = await request(server)
            .post('/api/transactions')
            .send({
                card_id: 1,
                description: 'Test Transaction',
                amount: 100,
                category: 'Testing',
                date: '2024-12-31'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.data.description).toBe('Test Transaction');
    });
}); 