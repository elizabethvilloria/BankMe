document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cards-container');
    const addCardForm = document.getElementById('add-card-form');
    const transactionsContainer = document.getElementById('transactions-container');
    const paymentsContainer = document.getElementById('payments-container');

    const fetchCards = async () => {
        const response = await fetch('/api/cards');
        const result = await response.json();
        if (result.message === 'success') {
            renderCards(result.data);
        }
    };

    const fetchTransactions = async () => {
        const response = await fetch('/api/transactions');
        const result = await response.json();
        if (result.message === 'success') {
            renderTransactions(result.data);
        }
    };

    const fetchPayments = async () => {
        const response = await fetch('/api/payments');
        const result = await response.json();
        if (result.message === 'success') {
            renderPayments(result.data);
        }
    };

    const renderCards = (cards) => {
        cardsContainer.innerHTML = '';
        if (cards.length === 0) {
            cardsContainer.innerHTML = '<p>No cards added yet. Add one using the form!</p>';
            return;
        }
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.innerHTML = `
                <h3>${card.name}</h3>
                <p><strong>Bank:</strong> ${card.bank}</p>
                <p><strong>Limit:</strong> $${card.card_limit}</p>
                <p><strong>Balance:</strong> $${card.balance}</p>
                <p><strong>Due Date:</strong> ${new Date(card.due_date).toLocaleDateString()}</p>
                <p><strong>Interest Rate:</strong> ${card.interest_rate}%</p>
                <button onclick="deleteCard(${card.id})">Delete</button>
            `;
            cardsContainer.appendChild(cardElement);
        });
    };

    window.deleteCard = async (id) => {
        if (confirm('Are you sure you want to delete this card?')) {
            const response = await fetch(`/api/cards/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchCards();
            } else {
                alert('Failed to delete card.');
            }
        }
    };

    const renderTransactions = (transactions) => {
        transactionsContainer.innerHTML = '';
        if (transactions.length === 0) {
            transactionsContainer.innerHTML = '<p>No transactions yet.</p>';
            return;
        }
        const list = document.createElement('ul');
        transactions.forEach(tx => {
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
        payments.forEach(payment => {
            const item = document.createElement('li');
            item.innerHTML = `
                <span>${new Date(payment.date).toLocaleDateString()}: Payment of $${payment.amount}</span>
            `;
            list.appendChild(item);
        });
        paymentsContainer.appendChild(list);
    };

    addCardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addCardForm);
        const cardData = Object.fromEntries(formData.entries());
        
        cardData.card_limit = parseFloat(cardData.card_limit);
        cardData.balance = parseFloat(cardData.balance);
        cardData.interest_rate = parseFloat(cardData.interest_rate);

        const response = await fetch('/api/cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cardData)
        });

        if (response.ok) {
            addCardForm.reset();
            fetchCards();
        } else {
            alert('Failed to add card.');
        }
    });

    fetchCards();
    fetchTransactions();
    fetchPayments();
}); 