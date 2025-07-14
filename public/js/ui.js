// All UI-related functions will go here
export const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
};

export const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
};

export const renderCards = (cards) => {
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = '';

    if (cards.length === 0) {
        cardsContainer.innerHTML =
            '<p>No cards found. Add one to get started!</p>';
        return;
    }

    cards.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.innerHTML = `
            <h3>${card.card_name}</h3>
            <p>${card.bank_name}</p>
            <p>**** **** **** ${card.last4}</p>
            <p>Limit: $${card.credit_limit}</p>
            <p>Balance: $${card.current_balance}</p>
        `;
        cardsContainer.appendChild(cardElement);
    });
};
