const request = require('supertest');
const server = require('../server/server');

describe('Bills API', () => {
    it('should fetch all bills', async () => {
        const res = await request(server).get('/api/bills');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('success');
    });

    it('should create a new bill', async () => {
        const res = await request(server)
            .post('/api/bills')
            .send({
                name: 'Test Bill',
                amount: 100,
                due_date: '2024-12-31'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.data.name).toBe('Test Bill');
    });

    it('should update a bill', async () => {
        const res = await request(server)
            .patch('/api/bills/1')
            .send({
                is_paid: true
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body.data.is_paid).toBe(true);
    });

    it('should delete a bill', async () => {
        const created = await request(server)
            .post('/api/bills')
            .send({ name: 'Tmp Bill', amount: 10, due_date: '2024-12-31' });
        const id = created.body.data.id;
        const res = await request(server).delete(`/api/bills/${id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('deleted');
    });
}); 