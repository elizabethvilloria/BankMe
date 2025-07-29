const request = require('supertest');
const server = require('../server/server'); // Use the exported server

// Setup Express app
const app = express();
app.use(express.json());

// Import routes
const cardRoutes = require('../server/routes/cardRoutes');
app.use('/api/cards', cardRoutes);

// Setup test database
beforeAll(() => {
    execSync('npm run init-db');
});

afterAll((done) => {
    server.close(done); // Close the server after all tests
});

describe('Credit Card API', () => {
    it('should fetch all credit cards', async () => {
        const res = await request(app).get('/api/cards');
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('success');
    });

    it('should create a new credit card', async () => {
        const res = await request(server)
            .post('/api/cards')
            .send({
                name: 'Test Card',
                bank: 'Test Bank',
                card_limit: 1000,
                balance: 0,
                due_date: '2024-12-31',
                interest_rate: 19.99
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.data.name).toBe('Test Card');
    });
}); 