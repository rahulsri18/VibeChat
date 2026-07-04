# VibeChat 💬

A full-stack real-time messaging platform supporting private and group chats with live presence indicators, secure authentication, and a sleek adaptive UI.

## Features

- **Real-Time Messaging** — Instant private and group chat powered by WebSocket (Socket.io)
- **Live Presence Indicators** — See who's online in real time
- **Message Persistence** — Chat history stored and retrieved via MongoDB
- **Secure Authentication** — JWT-based user login and session management
- **Adaptive UI** — Responsive dark/light theme built with Tailwind CSS

## Tech Stack

**Frontend**
- React
- Tailwind CSS
- Socket.io Client

**Backend**
- Node.js / Express
- Socket.io
- MongoDB (Mongoose)
- JWT (JSON Web Tokens)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/rahulsri18/VibeChat.git
   cd VibeChat
   ```

2. Install dependencies for both client and server
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install
   ```

3. Set up environment variables

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the application
   ```bash
   # Start backend (from /server)
   npm run dev

   # Start frontend (from /client)
   npm start
   ```

5. Open your browser at `http://localhost:3000`

## Project Structure

```
VibeChat/
├── client/          # React frontend
│   ├── src/
│   └── ...
├── server/          # Node.js backend
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── ...
└── README.md
```

## How It Works

- Users register/log in and receive a **JWT token** for authenticated sessions.
- **Socket.io** establishes a persistent WebSocket connection for real-time communication.
- Messages are emitted through sockets and simultaneously **persisted to MongoDB**.
- Online/offline status is tracked and broadcast to connected users as **live presence indicators**.
- The UI dynamically switches between **dark and light modes** using Tailwind's theming utilities.

## Future Improvements

- Typing indicators
- Read receipts
- File/image sharing in chats
- Push notifications
- Message search

## License

This project is licensed under the MIT License.

## Author

**Rahul Srivastava**
- GitHub: [@rahulsri18](https://github.com/rahulsri18)
- LinkedIn: [rahul-srivastava458700314](https://linkedin.com/in/rahul-srivastava458700314)
- Portfolio: [rahulsri18.github.io/portfolio](https://rahulsri18.github.io/portfolio)
