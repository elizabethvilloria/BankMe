# BankMe 💳

A simple web app to help you keep track of your credit cards and get your finances in order. No more forgetting due dates or wondering where your money went!

## What's This About?

I was tired of:

- Forgetting when my credit card payments were due
- Not knowing how much I was spending on what
- Having no clue about my overall financial health

So I built this to solve those problems! It's basically a personal finance dashboard that keeps everything organized.

## What It Does

### Credit Card Management

- Add all your credit cards in one place
- Track balances, limits, and due dates
- See your credit utilization at a glance
- Never miss a payment again

### Spending Tracking

- Log your expenses and categorize them
- See where your money is actually going
- Set budgets and stick to them
- Get insights into your spending habits

### Financial Health

- Visual charts showing your progress
- Debt payoff strategies
- Monthly spending reports
- Financial goals tracking

## Tech Stuff

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Database**: SQLite (because it's easy and works everywhere)
- **Charts**: Chart.js for pretty graphs

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Git

### Setup

1. Clone this repo:

```bash
git clone <your-repo-url>
cd BankMe
```

2. Install the dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npm run init-db
```

4. Start the server:

```bash
npm run dev
```

5. Open your browser and go to `http://localhost:3000`

That's it! You should see the app running.

## Project Structure

```
BankMe/
├── public/           # Frontend files (HTML, CSS, JS)
├── server/           # Backend code
├── database/         # Database stuff
├── docs/            # Planning and notes
└── README.md        # This file
```

## Database Tables

### Credit Cards

- Basic info: name, bank, limit, balance
- Due dates and interest rates
- Payment history

### Transactions

- What you spent money on
- Categories (food, gas, shopping, etc.)
- When you spent it

### Payments

- Payment amounts and dates
- Status tracking

## Development Plan

### Week 1: Foundation ✅

- [x] Set up project structure
- [x] Basic HTML/CSS layout
- [x] Database design
- [x] Server setup

### Week 2: Core Features

- [ ] Add/edit credit cards
- [ ] Basic dashboard
- [ ] Payment tracking
- [ ] Balance calculations

### Week 3: Cool Features

- [ ] Expense categories
- [ ] Charts and graphs
- [ ] Budget planning
- [ ] Payment reminders

### Week 4: Polish

- [ ] Make it look better
- [ ] Fix bugs
- [ ] Test everything
- [ ] Write documentation

## Why I Built This

This started as a personal project to help me manage my own finances better. I was always forgetting payment due dates and had no idea where my money was going. This app solves those problems and gives me a clear picture of my financial health.

## Future Ideas

- Mobile app version
- Credit score tracking
- Investment portfolio integration
- Bill reminders
- Debt payoff calculators

## Contributing

This is my personal project, but feel free to fork it and make it your own! If you find bugs or have ideas for improvements, let me know.

## License

MIT License - do whatever you want with it!

---

**Built with ❤️ and lots of coffee ☕**
