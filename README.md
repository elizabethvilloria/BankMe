# BankMe 💳

A simple web app to help you keep track of your credit cards and get your finances in order. No more forgetting due dates or wondering where your money went!

![Screenshot](docs/screenshot.png)

## What's This About?

I was tired of:

-   Forgetting when my credit card payments were due
-   Not knowing how much I was spending on what
-   Having no clue about my overall financial health

So I built this to solve those problems! It's basically a personal finance dashboard that keeps everything organized.

## Features

-   **Credit Card Management**: Add all your credit cards in one place, track balances, limits, and due dates.
-   **Spending Tracking**: Log your expenses and categorize them to see where your money is actually going.
-   **Financial Health**: Visual charts showing your progress, including credit utilization and spending by category.
-   **API Documentation**: Interactive API documentation powered by Swagger.

## Tech Stack

-   **Frontend**: HTML, CSS (Tailwind CSS), JavaScript (with Chart.js)
-   **Backend**: Node.js with Express
-   **Database**: SQLite
-   **Testing**: Jest & Supertest
-   **Linting**: ESLint & Prettier

## Getting Started

### Prerequisites

-   Node.js (version 18.12.0 - use `nvm use` to switch)
-   Git

### Setup

1.  Clone this repo:
    ```bash
    git clone <your-repo-url>
    cd BankMe
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Set up the database:
    ```bash
    npm run init-db
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
5.  Open your browser and go to `http://localhost:3000`

## Available Scripts

-   `npm start`: Start the production server.
-   `npm run dev`: Start the development server with nodemon.
-   `npm run init-db`: Initialize the database.
-   `npm test`: Run the API tests.
-   `npm run lint`: Lint the codebase.
-   `npm run format`: Format the codebase with Prettier.
-   `npm run-script build`: Build the project for production.

## API Documentation

To view the API documentation, start the server and go to `http://localhost:3000/api-docs`.

## Environment

Create a `.env` file (see `.env.example`) with:

- `PORT` - server port (default 3000)
- `DB_PATH` - path to sqlite db (default ./database/bank.db)

## Health Check

The server exposes `GET /health` returning:

```json
{ "status": "ok", "uptime": 12.34 }
```

## License

MIT License - do whatever you want with it!

---

**Built with ❤️ and lots of coffee ☕**
