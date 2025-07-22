document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cards-container');
    const addCardForm = document.getElementById('add-card-form');

    const fetchCards = async () => {
        const response = await fetch('/api/cards');
        const result = await response.json();
        if (result.message === 'success') {
            renderCards(result.data);
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
            `;
            cardsContainer.appendChild(cardElement);
        });
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
}); 