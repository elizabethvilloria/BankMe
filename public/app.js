// BankMe - Personal Finance Manager
// Main JavaScript file

class BankMeApp {
    constructor() {
        this.cards = [];
        this.bills = [];
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

        // Bill modal handling
        document.getElementById('add-bill-btn').addEventListener('click', () => {
            this.showBillModal();
        });

        document.getElementById('close-bill-modal').addEventListener('click', () => {
            this.hideBillModal();
        });

        document.getElementById('cancel-bill-btn').addEventListener('click', () => {
            this.hideBillModal();
        });

        document.getElementById('bill-modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'bill-modal-overlay') {
                this.hideBillModal();
            }
        });

        document.getElementById('bill-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBill();
        });
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
            case 'bills':
                this.renderBills();
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
            const nextDueDate = this.getNextDueDate(card.due_day);
            const today = new Date();
            const diffTime = nextDueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        }).length;

        // Update bills summary
        const totalDue = this.bills.filter(bill => !bill.is_paid).reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const upcomingBills = this.bills.filter(bill => {
            if (bill.is_paid) return false;
            const dueDate = new Date(bill.due_date);
            const today = new Date();
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 30;
        }).length;
        
        const overdueBills = this.bills.filter(bill => {
            if (bill.is_paid) return false;
            const dueDate = new Date(bill.due_date);
            const today = new Date();
            return dueDate < today;
        }).length;

        document.getElementById('total-limit').textContent = `$${totalLimit.toLocaleString()}`;
        document.getElementById('total-balance').textContent = `$${totalBalance.toLocaleString()}`;
        document.getElementById('utilization').textContent = `${utilization}%`;
        document.getElementById('upcoming-payments').textContent = upcomingPayments;
        document.getElementById('total-due').textContent = `$${totalDue.toLocaleString()}`;
        document.getElementById('upcoming-bills').textContent = upcomingBills;
        document.getElementById('overdue-bills').textContent = overdueBills;

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
                sortedCards.sort((a, b) => {
                    const aNextDue = this.getNextDueDate(a.due_day);
                    const bNextDue = this.getNextDueDate(b.due_day);
                    return aNextDue - bNextDue;
                });
                break;
            case 'due-late':
                sortedCards.sort((a, b) => {
                    const aNextDue = this.getNextDueDate(a.due_day);
                    const bNextDue = this.getNextDueDate(b.due_day);
                    return bNextDue - aNextDue;
                });
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
        const dueDate = this.getNextDueDate(card.due_day);
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
                    <div class="detail-value ${this.getDueDateText(card.due_day).class}">${this.getDueDateText(card.due_day).text}</div>
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

    getNextDueDate(dueDay) {
        const today = new Date();
        let year = today.getFullYear();
        let month = today.getMonth();
        let nextDue = new Date(year, month, dueDay);
        if (nextDue < today) {
            // If this month's due date has passed, go to next month
            month += 1;
            if (month > 11) {
                month = 0;
                year += 1;
            }
            nextDue = new Date(year, month, dueDay);
        }
        return nextDue;
    }

    getDueDateText(dueDay) {
        const nextDue = this.getNextDueDate(dueDay);
        const today = new Date();
        const diffTime = nextDue - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return { text: 'Due Today', class: 'due-today' };
        } else if (diffDays === 1) {
            return { text: 'Due Tomorrow', class: 'due-tomorrow' };
        } else if (diffDays < 0) {
            return { text: `${Math.abs(diffDays)} Day${Math.abs(diffDays) === 1 ? '' : 's'} Overdue`, class: 'overdue' };
        } else if (diffDays <= 3) {
            return { text: `Due in ${diffDays} Day${diffDays === 1 ? '' : 's'}`, class: 'due-soon' };
        } else {
            return { text: `Due in ${diffDays} Day${diffDays === 1 ? '' : 's'}`, class: '' };
        }
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
            due_day: parseInt(document.getElementById('due-day').value),
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
            // Load cards
            const cardsResponse = await fetch('/api/cards');
            if (cardsResponse.ok) {
                this.cards = await cardsResponse.json();
            } else {
                console.error('Failed to load cards from API, using localStorage as fallback');
                this.loadFromLocalStorage();
            }

            // Load bills
            const billsResponse = await fetch('/api/bills');
            if (billsResponse.ok) {
                this.bills = await billsResponse.json();
            } else {
                console.error('Failed to load bills from API');
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

    renderBills() {
        const container = document.getElementById('bills-container');
        container.innerHTML = '';

        if (this.bills.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align: center; padding: 40px;">
                    <h3>No Bills Added</h3>
                    <p>Add your first bill to get started!</p>
                    <button class="btn btn-primary" onclick="app.showBillModal()">Add Bill</button>
                </div>
            `;
            return;
        }

        this.bills.forEach(bill => {
            const billElement = this.createBillElement(bill);
            container.appendChild(billElement);
        });
    }

    createBillElement(bill) {
        const div = document.createElement('div');
        div.className = 'bill-item';
        
        const dueDate = new Date(bill.due_date);
        const today = new Date();
        const isOverdue = dueDate < today && !bill.is_paid;
        const isPaid = bill.is_paid;
        
        if (isOverdue) div.classList.add('overdue');
        if (isPaid) div.classList.add('paid');
        
        const statusClass = isPaid ? 'paid' : (isOverdue ? 'overdue' : 'unpaid');
        const statusText = isPaid ? 'PAID' : (isOverdue ? 'OVERDUE' : 'UNPAID');
        
        div.innerHTML = `
            <div class="bill-info">
                <div class="bill-name">${bill.name}</div>
                <div class="bill-details">
                    <span>Due: ${dueDate.toLocaleDateString()}</span>
                    <span class="bill-category">${bill.category}</span>
                    ${bill.notes ? `<span>${bill.notes}</span>` : ''}
                </div>
            </div>
            <div class="bill-amount">$${parseFloat(bill.amount).toLocaleString()}</div>
            <div class="bill-actions">
                <button class="bill-status ${statusClass}" onclick="app.toggleBillStatus(${bill.id})">
                    ${statusText}
                </button>
                <button class="delete-bill-btn" onclick="app.deleteBill(${bill.id})" title="Delete bill">×</button>
            </div>
        `;
        
        return div;
    }

    showBillModal() {
        const modal = document.getElementById('bill-modal-overlay');
        document.getElementById('bill-modal-title').textContent = 'Add Bill';
        document.getElementById('bill-form').reset();
        
        // Set default date to today
        document.getElementById('bill-due-date').value = new Date().toISOString().split('T')[0];
        
        modal.classList.remove('hidden');
    }

    hideBillModal() {
        document.getElementById('bill-modal-overlay').classList.add('hidden');
        document.getElementById('bill-form').reset();
    }

    async addBill() {
        const billData = {
            name: document.getElementById('bill-name').value,
            amount: parseFloat(document.getElementById('bill-amount').value),
            due_date: document.getElementById('bill-due-date').value,
            category: document.getElementById('bill-category').value,
            notes: document.getElementById('bill-notes').value || null
        };

        try {
            const response = await fetch('/api/bills', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(billData)
            });

            if (response.ok) {
                const newBill = await response.json();
                this.bills.push(newBill);
                this.hideBillModal();
                this.updateTabContent();
                this.showNotification('Bill added successfully!', 'success');
            } else {
                throw new Error('Failed to add bill');
            }
        } catch (error) {
            console.error('Error adding bill:', error);
            this.showNotification('Failed to add bill. Please try again.', 'error');
        }
    }

    async toggleBillStatus(billId) {
        try {
            const response = await fetch(`/api/bills/${billId}/toggle`, {
                method: 'PATCH'
            });

            if (response.ok) {
                const updatedBill = await response.json();
                const billIndex = this.bills.findIndex(bill => bill.id === billId);
                if (billIndex !== -1) {
                    this.bills[billIndex] = updatedBill;
                    this.updateTabContent();
                    this.showNotification(`Bill marked as ${updatedBill.is_paid ? 'paid' : 'unpaid'}!`, 'success');
                }
            } else {
                throw new Error('Failed to update bill status');
            }
        } catch (error) {
            console.error('Error toggling bill status:', error);
            this.showNotification('Failed to update bill status. Please try again.', 'error');
        }
    }

    async deleteBill(billId) {
        if (confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/bills/${billId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    this.bills = this.bills.filter(bill => bill.id !== billId);
                    this.updateTabContent();
                    this.showNotification('Bill deleted successfully!', 'success');
                } else {
                    throw new Error('Failed to delete bill');
                }
            } catch (error) {
                console.error('Error deleting bill:', error);
                this.showNotification('Failed to delete bill. Please try again.', 'error');
            }
        }
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