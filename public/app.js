// BankMe - Personal Finance Manager
// Main JavaScript file

class BankMeApp {
    constructor() {
        this.cards = [];
        this.expenses = [];
        this.currentTab = 'dashboard';
        this.currentSort = 'custom';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.updateDashboard();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Modal handling
        document.getElementById('add-card-btn').addEventListener('click', () => {
            this.showModal('Add New Card');
        });

        document.getElementById('add-payment-btn').addEventListener('click', () => {
            this.showPaymentModal();
        });

        document.getElementById('add-charge-btn').addEventListener('click', () => {
            this.showChargeModal();
        });

        // Close modals
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('close-payment-modal').addEventListener('click', () => {
            this.hidePaymentModal();
        });

        document.getElementById('close-charge-modal').addEventListener('click', () => {
            this.hideChargeModal();
        });

        // Cancel buttons
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancel-payment-btn').addEventListener('click', () => {
            this.hidePaymentModal();
        });

        document.getElementById('cancel-charge-btn').addEventListener('click', () => {
            this.hideChargeModal();
        });

        // Form submissions
        document.getElementById('card-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCard();
        });

        document.getElementById('payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPayment();
        });

        document.getElementById('charge-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCharge();
        });

        // Close modals when clicking overlay
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.hideModal();
            }
        });

        document.getElementById('payment-modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'payment-modal-overlay') {
                this.hidePaymentModal();
            }
        });

        document.getElementById('charge-modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'charge-modal-overlay') {
                this.hideChargeModal();
            }
        });

        // Last 4 digits input validation
        document.getElementById('card-last4').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
        });

        // Sort dropdown
        const sortSelect = document.getElementById('card-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderCards();
            });
        }
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.updateTabContent();
    }

    updateTabContent() {
        switch (this.currentTab) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'cards':
                this.renderCards();
                break;
            case 'expenses':
                this.renderExpenses();
                break;
            case 'budget':
                this.updateBudget();
                break;
        }
    }

    updateDashboard() {
        const totalLimit = this.cards.reduce((sum, card) => sum + parseFloat(card.credit_limit), 0);
        const totalBalance = this.cards.reduce((sum, card) => sum + parseFloat(card.current_balance), 0);
        const utilization = totalLimit > 0 ? ((totalBalance / totalLimit) * 100).toFixed(1) : 0;
        
        // Count upcoming payments (due within 7 days)
        const upcomingPayments = this.cards.filter(card => {
            const dueDate = new Date(card.due_date);
            const today = new Date();
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        }).length;

        document.getElementById('total-limit').textContent = `$${totalLimit.toLocaleString()}`;
        document.getElementById('total-balance').textContent = `$${totalBalance.toLocaleString()}`;
        document.getElementById('utilization').textContent = `${utilization}%`;
        document.getElementById('upcoming-payments').textContent = upcomingPayments;

        // Add utilization status to dashboard
        const utilizationElement = document.getElementById('utilization');
        utilizationElement.className = 'amount';
        if (utilization > 30) {
            utilizationElement.classList.add('high-utilization');
        } else if (utilization > 10) {
            utilizationElement.classList.add('medium-utilization');
        } else {
            utilizationElement.classList.add('low-utilization');
        }

        this.updateCharts();
    }

    updateCharts() {
        // Balance Chart
        const balanceCtx = document.getElementById('balance-chart');
        if (balanceCtx) {
            // Destroy existing chart if it exists
            if (window.balanceChart) {
                window.balanceChart.destroy();
            }
            
            window.balanceChart = new Chart(balanceCtx, {
                type: 'doughnut',
                data: {
                    labels: this.cards.map(card => this.getCardDisplayName(card)),
                    datasets: [{
                        data: this.cards.map(card => parseFloat(card.current_balance)),
                        backgroundColor: [
                            '#FF6B6B',
                            '#4ECDC4',
                            '#45B7D1',
                            '#96CEB4',
                            '#FFEAA7',
                            '#DDA0DD',
                            '#98D8C8'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Spending Chart (placeholder for now)
        const spendingCtx = document.getElementById('spending-chart');
        if (spendingCtx) {
            // Destroy existing chart if it exists
            if (window.spendingChart) {
                window.spendingChart.destroy();
            }
            
            window.spendingChart = new Chart(spendingCtx, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Monthly Spending',
                        data: [1200, 1900, 1500, 2100, 1800, 1600],
                        backgroundColor: '#667eea'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    getCardDisplayName(card) {
        if (card.last4) {
            return `${card.card_name} (****${card.last4})`;
        }
        return card.card_name;
    }

    renderCards() {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';

        if (this.cards.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; grid-column: 1 / -1;">
                    <h3>No Credit Cards Added</h3>
                    <p>Add your first credit card to get started!</p>
                    <button class="btn btn-primary" onclick="app.showModal('Add New Card')">Add Card</button>
                </div>
            `;
            return;
        }

        // Sort cards based on currentSort
        let sortedCards = [...this.cards];
        switch (this.currentSort) {
            case 'az':
                sortedCards.sort((a, b) => a.card_name.localeCompare(b.card_name));
                break;
            case 'za':
                sortedCards.sort((a, b) => b.card_name.localeCompare(a.card_name));
                break;
            case 'debt-desc':
                sortedCards.sort((a, b) => parseFloat(b.current_balance) - parseFloat(a.current_balance));
                break;
            case 'debt-asc':
                sortedCards.sort((a, b) => parseFloat(a.current_balance) - parseFloat(b.current_balance));
                break;
            case 'limit-desc':
                sortedCards.sort((a, b) => parseFloat(b.credit_limit) - parseFloat(a.credit_limit));
                break;
            case 'limit-asc':
                sortedCards.sort((a, b) => parseFloat(a.credit_limit) - parseFloat(b.credit_limit));
                break;
            case 'due-soon':
                sortedCards.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
                break;
            case 'due-late':
                sortedCards.sort((a, b) => new Date(b.due_date) - new Date(a.due_date));
                break;
            case 'custom':
            default:
                sortedCards.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                break;
        }

        // Drag-and-drop support only for custom sort
        if (this.currentSort === 'custom') {
            container.ondragover = (e) => { e.preventDefault(); };
            container.ondrop = (e) => { e.preventDefault(); };
        } else {
            container.ondragover = null;
            container.ondrop = null;
        }

        sortedCards.forEach((card, idx) => {
            const cardElement = this.createCardElement(card);
            if (this.currentSort === 'custom') {
                cardElement.setAttribute('draggable', 'true');
                cardElement.dataset.cardId = card.id;
                cardElement.dataset.index = idx;

                cardElement.ondragstart = (e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', idx);
                    cardElement.classList.add('dragging');
                };
                cardElement.ondragend = (e) => {
                    cardElement.classList.remove('dragging');
                };
                cardElement.ondragover = (e) => {
                    e.preventDefault();
                    cardElement.classList.add('drag-over');
                };
                cardElement.ondragleave = (e) => {
                    cardElement.classList.remove('drag-over');
                };
                cardElement.ondrop = (e) => {
                    e.preventDefault();
                    cardElement.classList.remove('drag-over');
                    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                    const toIdx = idx;
                    if (fromIdx !== toIdx) {
                        this.moveCard(fromIdx, toIdx);
                    }
                };
            } else {
                cardElement.removeAttribute('draggable');
                cardElement.ondragstart = null;
                cardElement.ondragend = null;
                cardElement.ondragover = null;
                cardElement.ondragleave = null;
                cardElement.ondrop = null;
            }
            container.appendChild(cardElement);
        });
    }

    moveCard(fromIdx, toIdx) {
        const moved = this.cards.splice(fromIdx, 1)[0];
        this.cards.splice(toIdx, 0, moved);
        this.renderCards();
        this.saveCardOrder();
    }

    async saveCardOrder() {
        // Save the new order to the backend
        const order = this.cards.map((card, idx) => ({ id: card.id, position: idx }));
        try {
            await fetch('/api/cards/order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order })
            });
        } catch (err) {
            this.showNotification('Failed to save card order', 'error');
        }
    }

    createCardElement(card) {
        const div = document.createElement('div');
        div.className = 'credit-card';
        
        const utilization = ((parseFloat(card.current_balance) / parseFloat(card.credit_limit)) * 100).toFixed(1);
        const dueDate = new Date(card.due_date).toLocaleDateString();
        const isOverLimit = parseFloat(card.current_balance) > parseFloat(card.credit_limit);
        const utilizationClass = this.getUtilizationClass(utilization);
        const cardDisplayName = this.getCardDisplayName(card);
        
        div.innerHTML = `
            <div class="card-header">
                <h3>${cardDisplayName}</h3>
                <button class="delete-btn" onclick="app.deleteCard(${card.id})" title="Delete card">×</button>
            </div>
            <div class="bank">${card.bank_name}</div>
            <div class="utilization-status ${utilizationClass}">
                ${isOverLimit ? '⚠️ OVER LIMIT' : `${utilization}% Used`}
            </div>
            <div class="details">
                <div class="detail">
                    <div class="detail-label">Balance</div>
                    <div class="detail-value ${isOverLimit ? 'over-limit' : ''}">$${parseFloat(card.current_balance).toLocaleString()}</div>
                </div>
                <div class="detail">
                    <div class="detail-label">Limit</div>
                    <div class="detail-value">$${parseFloat(card.credit_limit).toLocaleString()}</div>
                </div>
                <div class="detail">
                    <div class="detail-label">Available</div>
                    <div class="detail-value ${isOverLimit ? 'over-limit' : ''}">$${Math.max(0, parseFloat(card.credit_limit) - parseFloat(card.current_balance)).toLocaleString()}</div>
                </div>
                <div class="detail">
                    <div class="detail-label">Due Date</div>
                    <div class="detail-value">${dueDate}</div>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-sm btn-secondary" onclick="app.showPaymentModal(${card.id})">Pay</button>
                <button class="btn btn-sm btn-secondary" onclick="app.showChargeModal(${card.id})">Charge</button>
            </div>
        `;
        
        return div;
    }

    getUtilizationClass(utilization) {
        const util = parseFloat(utilization);
        if (util > 90) return 'critical';
        if (util > 70) return 'high';
        if (util > 30) return 'medium';
        return 'low';
    }

    async deleteCard(cardId) {
        if (confirm('Are you sure you want to delete this credit card? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/cards/${cardId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Remove card from local array
                    this.cards = this.cards.filter(card => card.id !== cardId);
                    this.updateTabContent();
                    this.showNotification('Credit card deleted successfully!', 'success');
                } else {
                    throw new Error('Failed to delete card');
                }
            } catch (error) {
                console.error('Error deleting card:', error);
                this.showNotification('Failed to delete card. Please try again.', 'error');
            }
        }
    }

    showPaymentModal(cardId = null) {
        const modal = document.getElementById('payment-modal-overlay');
        const select = document.getElementById('payment-card-select');
        
        // Populate card select
        select.innerHTML = '<option value="">Choose a credit card...</option>';
        this.cards.forEach(card => {
            const option = document.createElement('option');
            option.value = card.id;
            option.textContent = `${this.getCardDisplayName(card)} ($${parseFloat(card.current_balance).toLocaleString()})`;
            if (cardId && card.id === cardId) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // Set default date to today
        document.getElementById('payment-date').value = new Date().toISOString().split('T')[0];
        
        modal.classList.remove('hidden');
    }

    hidePaymentModal() {
        document.getElementById('payment-modal-overlay').classList.add('hidden');
        document.getElementById('payment-form').reset();
    }

    showChargeModal(cardId = null) {
        const modal = document.getElementById('charge-modal-overlay');
        const select = document.getElementById('charge-card-select');
        
        // Populate card select
        select.innerHTML = '<option value="">Choose a credit card...</option>';
        this.cards.forEach(card => {
            const option = document.createElement('option');
            option.value = card.id;
            option.textContent = `${this.getCardDisplayName(card)} ($${parseFloat(card.current_balance).toLocaleString()})`;
            if (cardId && card.id === cardId) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // Set default date to today
        document.getElementById('charge-date').value = new Date().toISOString().split('T')[0];
        
        modal.classList.remove('hidden');
    }

    hideChargeModal() {
        document.getElementById('charge-modal-overlay').classList.add('hidden');
        document.getElementById('charge-form').reset();
    }

    async addPayment() {
        const cardId = parseInt(document.getElementById('payment-card-select').value);
        const amount = parseFloat(document.getElementById('payment-amount').value);
        const date = document.getElementById('payment-date').value;
        const notes = document.getElementById('payment-notes').value;

        if (!cardId) {
            this.showNotification('Please select a credit card', 'error');
            return;
        }

        try {
            // Find the card and update its balance
            const cardIndex = this.cards.findIndex(card => card.id === cardId);
            if (cardIndex === -1) {
                throw new Error('Card not found');
            }

            const card = this.cards[cardIndex];
            const newBalance = Math.max(0, parseFloat(card.current_balance) - amount);
            
            // Update the card balance
            const updatedCard = { ...card, current_balance: newBalance };
            
            const response = await fetch(`/api/cards/${cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedCard)
            });

            if (response.ok) {
                // Update local card data
                this.cards[cardIndex] = updatedCard;
                this.hidePaymentModal();
                this.updateTabContent();
                this.showNotification(`Payment of $${amount.toLocaleString()} applied successfully!`, 'success');
            } else {
                throw new Error('Failed to update card');
            }
        } catch (error) {
            console.error('Error adding payment:', error);
            this.showNotification('Failed to add payment. Please try again.', 'error');
        }
    }

    async addCharge() {
        const cardId = parseInt(document.getElementById('charge-card-select').value);
        const amount = parseFloat(document.getElementById('charge-amount').value);
        const description = document.getElementById('charge-description').value;
        const category = document.getElementById('charge-category').value;
        const date = document.getElementById('charge-date').value;

        if (!cardId) {
            this.showNotification('Please select a credit card', 'error');
            return;
        }

        try {
            // Find the card and update its balance
            const cardIndex = this.cards.findIndex(card => card.id === cardId);
            if (cardIndex === -1) {
                throw new Error('Card not found');
            }

            const card = this.cards[cardIndex];
            const newBalance = parseFloat(card.current_balance) + amount;
            
            // Update the card balance
            const updatedCard = { ...card, current_balance: newBalance };
            
            const response = await fetch(`/api/cards/${cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedCard)
            });

            if (response.ok) {
                // Update local card data
                this.cards[cardIndex] = updatedCard;
                this.hideChargeModal();
                this.updateTabContent();
                this.showNotification(`Charge of $${amount.toLocaleString()} added successfully!`, 'success');
            } else {
                throw new Error('Failed to update card');
            }
        } catch (error) {
            console.error('Error adding charge:', error);
            this.showNotification('Failed to add charge. Please try again.', 'error');
        }
    }

    renderExpenses() {
        const container = document.getElementById('expenses-container');
        container.innerHTML = '<p>Expense tracking coming soon!</p>';
    }

    updateBudget() {
        const container = document.querySelector('.budget-overview');
        if (container) {
            container.innerHTML = '<p>Budget planning coming soon!</p>';
        }
    }

    showModal(title) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        document.getElementById('card-form').reset();
    }

    async addCard() {
        const cardData = {
            card_name: document.getElementById('card-name').value,
            bank_name: document.getElementById('bank-name').value,
            last4: document.getElementById('card-last4').value || null,
            credit_limit: parseFloat(document.getElementById('credit-limit').value),
            current_balance: parseFloat(document.getElementById('current-balance').value),
            due_date: document.getElementById('due-date').value,
            interest_rate: parseFloat(document.getElementById('interest-rate').value)
        };

        try {
            const response = await fetch('/api/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cardData)
            });

            if (response.ok) {
                const newCard = await response.json();
                this.cards.push(newCard);
                this.hideModal();
                this.updateTabContent();
                this.showNotification('Credit card added successfully!', 'success');
            } else {
                throw new Error('Failed to add card');
            }
        } catch (error) {
            console.error('Error adding card:', error);
            this.showNotification('Failed to add card. Please try again.', 'error');
        }
    }

    async loadData() {
        try {
            const response = await fetch('/api/cards');
            if (response.ok) {
                this.cards = await response.json();
            } else {
                console.error('Failed to load cards from API, using localStorage as fallback');
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Error loading data from API:', error);
            this.loadFromLocalStorage();
        }
    }

    loadFromLocalStorage() {
        const savedCards = localStorage.getItem('bankme_cards');
        if (savedCards) {
            this.cards = JSON.parse(savedCards);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('bankme_cards', JSON.stringify(this.cards));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.background = '#28a745';
        } else if (type === 'error') {
            notification.style.background = '#dc3545';
        } else {
            notification.style.background = '#007bff';
        }

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BankMeApp();
});