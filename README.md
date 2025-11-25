# PRIMEAPPAREL Backend

A lightweight **Node.js** API server for the PRIMEAPPAREL front‑end. It provides REST endpoints for products, collections, inquiries, and authentication.

## Tech Stack

- **Node.js 20** – runtime.
- **Express** – web framework.
- **MongoDB** (via Mongoose) – data storage.
- **JWT** – authentication.
- **Cors** – cross‑origin support.
- **dotenv** – environment variables.

## Getting Started

```bash
# From the project root
cd server

# Install dependencies
npm install

# Set up environment variables (copy .env.example)
cp .env.example .env
# Edit .env with your DB connection string and JWT secret

# Run in development mode
npm run dev   # (uses nodemon)
```

The API will be available at `http://localhost:5000` (or the port defined in `.env`).

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/:id` | Get product details |
| `POST` | `/api/inquiries` | Submit a new inquiry |
| `POST` | `/api/auth/login` | User login (returns JWT) |
| `POST` | `/api/auth/register` | Register a new user |
| `GET` | `/api/users/me` | Get current user (protected) |

*All routes are defined in `src/routes/` and controllers in `src/controllers/`.*

## Scripts

- `npm run dev` – start server with **nodemon** for hot‑reloading.
- `npm start` – start server in production mode.
- `npm run lint` – run ESLint.

## Deployment

1. Build the Docker image (optional):
   ```bash
   docker build -t primeapparel-backend .
   ```
2. Deploy to any Node‑compatible host (Heroku, Render, Railway, etc.) and set the required environment variables.

---

*Feel free to extend the API with additional resources (orders, inventory, etc.) and integrate with the front‑end.*
