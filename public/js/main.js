import { fetchCards, addCard } from './api.js';
import { renderCards, showModal, closeModal } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('BankMe App Loaded');
    
    const cards = await fetchCards();
    renderCards(cards);

    const addCardBtn = document.getElementById('add-card-btn');
    addCardBtn.addEventListener('click', () => showModal('add-card-modal'));

    const addCardForm = document.getElementById('add-card-form');
    addCardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addCardForm);
        const cardData = Object.fromEntries(formData.entries());
        
        const newCard = await addCard(cardData);
        
        if (newCard) {
            const cards = await fetchCards();
            renderCards(cards);
            closeModal('add-card-modal');
        }
    });
}); 