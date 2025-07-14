const API_BASE_URL = '/api';

export const fetchCards = async () => {
    const response = await fetch(`${API_BASE_URL}/cards`);
    return response.json();
};

export const addCard = async (cardData) => {
    const response = await fetch(`${API_BASE_URL}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardData),
    });
    return response.json();
};

// ... and so on for all other API calls 