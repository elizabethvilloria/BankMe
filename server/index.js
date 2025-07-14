const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const initDatabase = require('../database/init');

const cardsRoutes = require('./routes/cards');
const billsRoutes = require('./routes/bills');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database
initDatabase();

// API Routes
app.use('/api/cards', cardsRoutes);
app.use('/api/bills', billsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch-all for frontend routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
