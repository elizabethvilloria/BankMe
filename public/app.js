/* eslint-disable no-alert, no-undef */

document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cards-container');
    const addCardForm = document.getElementById('add-card-form');
    const transactionsContainer = document.getElementById('transactions-container');
    const paymentsContainer = document.getElementById('payments-container');
    const billsContainer = document.getElementById('bills-container');

    const renderCards = (cards) => {
        cardsContainer.innerHTML = '';
        if (cards.length === 0) {
            cardsContainer.innerHTML = '<p>No cards yet.</p>';
            return;
        }
        cards.forEach((card) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `
                <h3>${card.name}</h3>
                <p><strong>Bank:</strong> ${card.bank}</p>
                <p><strong>Limit:</strong> $${card.card_limit}</p>
                <p><strong>Balance:</strong> $${card.balance}</p>
                <p><strong>Utilization:</strong> ${((card.balance / card.card_limit) * 100).toFixed(2)}%</p>
                <p><strong>Due Date:</strong> ${new Date(card.due_date).toLocaleDateString()}</p>
                <p><strong>Interest Rate:</strong> ${card.interest_rate}%</p>
                <button onclick="deleteCard(${card.id})">Delete</button>
            `;
            cardsContainer.appendChild(cardElement);
        });
    };

    const renderTransactions = (transactions) => {
        transactionsContainer.innerHTML = '';
        if (transactions.length === 0) {
            transactionsContainer.innerHTML = '<p>No transactions yet.</p>';
            return;
        }
        const list = document.createElement('ul');
        transactions.forEach((tx) => {
            const item = document.createElement('li');
            item.innerHTML = `
                <span>${new Date(tx.date).toLocaleDateString()}: ${tx.description} - $${tx.amount} (${tx.category})</span>
            `;
            list.appendChild(item);
        });
        transactionsContainer.appendChild(list);
    };

    const renderPayments = (payments) => {
        paymentsContainer.innerHTML = '';
        if (payments.length === 0) {
            paymentsContainer.innerHTML = '<p>No payments yet.</p>';
            return;
        }
        const list = document.createElement('ul');
        payments.forEach((payment) => {
            const item = document.createElement('li');
            item.innerHTML = `
                <span>${new Date(payment.date).toLocaleDateString()}: Payment of $${payment.amount}</span>
            `;
            list.appendChild(item);
        });
        paymentsContainer.appendChild(list);
    };

    const renderBills = (bills) => {
        billsContainer.innerHTML = '';
        if (bills.length === 0) {
            billsContainer.innerHTML = '<p>No upcoming bills.</p>';
            return;
        }
        const list = document.createElement('ul');
        bills.forEach((bill) => {
            const item = document.createElement('li');
            item.innerHTML = `
                <span>${bill.name} - $${bill.amount} (Due: ${new Date(bill.due_date).toLocaleDateString()})</span>
                <button class="ml-4 p-2 rounded ${bill.is_paid ? 'bg-gray-400' : 'bg-green-500 text-white'}" onclick="toggleBillStatus(${bill.id}, ${bill.is_paid})">${bill.is_paid ? 'Paid' : 'Mark as Paid'}</button>
            `;
            list.appendChild(item);
        });
        billsContainer.appendChild(list);
    };

    const renderSpendingChart = (transactions) => {
        const ctx = document.getElementById('spending-chart').getContext('2d');
        const spendingByCategory = transactions.reduce((acc, tx) => {
            const newAcc = { ...acc };
            newAcc[tx.category] = (newAcc[tx.category] || 0) + tx.amount;
            return newAcc;
        }, {});

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(spendingByCategory),
                datasets: [{
                    label: 'Spending by Category',
                    data: Object.values(spendingByCategory),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
                    ],
                }],
            },
        });
    };

    const fetchCards = async () => {
        const response = await fetch('/api/cards');
        const result = await response.json();
        if (result.message === 'success') {
            renderCards(result.data);
        }
    };

    const fetchBills = async () => {
        const response = await fetch('/api/bills');
        const result = await response.json();
        if (result.message === 'success') {
            renderBills(result.data);
        }
    };

    const fetchPayments = async () => {
        const response = await fetch('/api/payments');
        const result = await response.json();
        if (result.message === 'success') {
            renderPayments(result.data);
        }
    };

    addCardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        const response = await fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (response.ok) {
            addCardForm.reset();
            fetchCards();
        } else {
            alert('Failed to add card.');
        }
    });

    window.deleteCard = async (id) => {
        // No confirmation for quicker deletion!
        const response = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
        if (response.ok) {
            fetchCards();
        } else {
            alert('Failed to delete card.');
        }
    };

    window.toggleBillStatus = async (id, isPaid) => {
        const response = await fetch(`/api/bills/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_paid: !isPaid }),
        });
        if (response.ok) {
            fetchBills();
        } else {
            alert('Failed to update bill status.');
        }
    };

    const init = async () => {
        await fetchCards();
        const txResponse = await fetch('/api/transactions');
        const txResult = await txResponse.json();
        if (txResult.message === 'success') {
            renderTransactions(txResult.data);
            renderSpendingChart(txResult.data);
        }
        await fetchPayments();
        await fetchBills();
    };

    init();
});
