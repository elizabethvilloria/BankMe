// BankMe - Personal Finance Manager
// Main JavaScript file

class BankMeApp {
    constructor() {
        this.cards = [];
        this.expenses = [];
        this.currentTab = 'dashboard';
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

        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideModal();
        });

        // Form submission
        document.getElementById('card-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCard();
        });

        // Close modal when clicking overlay
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.hideModal();
            }
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

        this.updateCharts();
    }

    updateCharts() {
        // Balance Chart
        const balanceCtx = document.getElementById('balance-chart');
        if (balanceCtx) {
            new Chart(balanceCtx, {
                type: 'doughnut',
                data: {
                    labels: this.cards.map(card => card.card_name),
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
            new Chart(spendingCtx, {
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

        this.cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            container.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const div = document.createElement('div');
        div.className = 'credit-card';
        
        const utilization = ((parseFloat(card.current_balance) / parseFloat(card.credit_limit)) * 100).toFixed(1);
        const dueDate = new Date(card.due_date).toLocaleDateString();
        
        div.innerHTML = `
            <h3>${card.card_name}</h3>
            <div class="bank">${card.bank_name}</div>
            <div class="details">
                <div class="detail">
                    <div class="detail-label">Balance</div>
                    <div class="detail-value">$${parseFloat(card.current_balance).toLocaleString()}</div>
                </div>
                <div class="detail">
                    <div class="detail-label">Limit</div>
                    <div class="detail-value">$${parseFloat(card.credit_limit).toLocaleString()}</div>
                </div>
                <div class="detail">
                    <div class="detail-label">Utilization</div>
                    <div class="detail-value">${utilization}%</div>
                </div>
                <div class="detail">
                    <div class="detail-label">Due Date</div>
                    <div class="detail-value">${dueDate}</div>
                </div>
            </div>
        `;
        
        return div;
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

    addCard() {
        const formData = new FormData(document.getElementById('card-form'));
        const card = {
            id: Date.now(),
            card_name: document.getElementById('card-name').value,
            bank_name: document.getElementById('bank-name').value,
            credit_limit: document.getElementById('credit-limit').value,
            current_balance: document.getElementById('current-balance').value,
            due_date: document.getElementById('due-date').value,
            interest_rate: document.getElementById('interest-rate').value,
            created_at: new Date().toISOString()
        };

        this.cards.push(card);
        this.saveData();
        this.hideModal();
        this.updateTabContent();
        
        // Show success message
        this.showNotification('Credit card added successfully!', 'success');
    }

    loadData() {
        const savedCards = localStorage.getItem('bankme_cards');
        if (savedCards) {
            this.cards = JSON.parse(savedCards);
        }
    }

    saveData() {
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
        } else {
            notification.style.background = '#007bff';
        }

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
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