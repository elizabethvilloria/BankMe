const db = require('../../database/config');

const getDashboardSummary = (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_cards,
            SUM(credit_limit) as total_limit,
            SUM(current_balance) as total_balance,
            AVG(current_balance * 100.0 / credit_limit) as avg_utilization
        FROM credit_cards
    `;

    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const summary = {
            total_cards: row.total_cards || 0,
            total_limit: row.total_limit || 0,
            total_balance: row.total_balance || 0,
            avg_utilization: row.avg_utilization || 0,
        };

        res.json(summary);
    });
};

const getUpcomingPayments = (req, res) => {
    const sql = `SELECT * FROM credit_cards ORDER BY due_day ASC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const today = new Date();
        const upcomingCards = rows.filter((card) => {
            const nextDueDate = getNextDueDate(card.due_day);
            const diffTime = nextDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        });

        res.json(upcomingCards);
    });
};

function getNextDueDate(dueDay) {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let nextDue = new Date(year, month, dueDay);
    if (nextDue < today) {
        month += 1;
        if (month > 11) {
            month = 0;
            year += 1;
        }
        nextDue = new Date(year, month, dueDay);
    }
    return nextDue;
}

module.exports = {
    getDashboardSummary,
    getUpcomingPayments,
};
