# AI Chatbot Project

This project is organized into two main parts:

- **`frontend/`**: The React + Vite application for the user interface.
- **`backend/`**: The FastAPI application handling AI logic, database, and scraping.

## 🚀 Getting Started

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend/app
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend runs on `http://localhost:8000`.

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

## 📁 Structure

- `backend/app/`: Contains all Python source code (`main.py`, `ai.py`, etc.) and data files (`faq.csv`, `orders.db`).
- `frontend/`: Contains the React application.
- `legacy_widget/`: The old HTML/CSS widget (deprecated).
