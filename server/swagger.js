const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BankMe API',
            version: '1.0.0',
            description: 'API documentation for the BankMe application.',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: ['./server/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}; 