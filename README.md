# TypeRace - Multiplayer Typing Game

A real-time multiplayer typing game built with React, Node.js, and Socket.IO, featuring Firebase authentication and a clean, minimal design.

## 🚀 Features

- **Real-time Multiplayer Racing**: Compete with up to 4 players simultaneously
- **Firebase Authentication**: Secure login with email/password and Google OAuth
- **Practice Mode**: Solo typing practice with WPM and accuracy tracking
- **Live Statistics**: Real-time WPM, accuracy, and progress tracking
- **Minimal Design**: Clean UI with light/dark theme support
- **Responsive**: Works on desktop and mobile devices

## 🛠️ Tech Stack

**Frontend:**

- React 18 + Vite
- Socket.IO Client
- Firebase Auth
- React Router
- CSS Variables (Theme System)

**Backend:**

- Node.js + Express
- Socket.IO Server
- Environment Variables with dotenv

## ⚙️ Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Game Configuration
MAX_PLAYERS_PER_ROOM=4
DEFAULT_WORD_COUNT=50

# Socket.IO Configuration
SOCKET_CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### Frontend Environment Variables

Create a `.env` file in the `client/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001

# Firebase Configuration (Replace with your Firebase project settings)
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:your-app-id-here

# App Configuration
VITE_APP_NAME=TypeRace
VITE_MAX_PLAYERS=4
```

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication and configure providers:
   - Email/Password
   - Google (optional)
4. Copy your Firebase config and update the frontend `.env` file
5. Add your domain to Firebase Authentication settings

## 📦 Installation & Running

### Prerequisites

- Node.js 20.17+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173 (or next available port)
- Backend API: http://localhost:3001

## 🎮 How to Play

### Single Player (Practice Mode)

1. Sign up or log in to your account
2. Click "Practice Mode" on the home page
3. Start typing the displayed text
4. Track your WPM, accuracy, and time
5. Press Tab to restart

### Multiplayer Racing

1. Sign up or log in to your account
2. Create a new room or join an existing room with room ID
3. Wait for other players to join
4. Click "Start Game" when ready
5. Type the same text as other players
6. See live progress and final rankings

## 🎨 Customization

### Theme Colors

Edit CSS variables in `client/src/index.css`:

```css
:root {
  --primary: #3b82f6;
  --accent: #10b981;
  --bg-primary: #ffffff;
  /* ... */
}
```

### Game Configuration

Adjust game settings via environment variables:

- `MAX_PLAYERS_PER_ROOM`: Maximum players per multiplayer room
- `DEFAULT_WORD_COUNT`: Number of words generated for typing tests
- `VITE_MAX_PLAYERS`: Frontend display of max players

### Word Lists

Modify word lists in `client/src/utils/textGenerator.js` and `backend/server.js`

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use `.env.example` files as templates
- Rotate Firebase API keys regularly
- Configure Firebase security rules appropriately
- Use HTTPS in production

## 📁 Project Structure

```
├── backend/
│   ├── .env                 # Environment variables
│   ├── .env.example        # Environment template
│   ├── server.js           # Express + Socket.IO server
│   └── package.json
├── client/
│   ├── .env                # Environment variables
│   ├── .env.example        # Environment template
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── firebase.js     # Firebase configuration
│   └── package.json
```

## 🚀 Deployment

### Backend Deployment (Railway, Heroku, etc.)

1. Set environment variables on your hosting platform
2. Update `SOCKET_CORS_ORIGINS` with your frontend domain
3. Deploy the `backend/` directory

### Frontend Deployment (Vercel, Netlify, etc.)

1. Set environment variables on your hosting platform
2. Update `VITE_API_BASE_URL` and `VITE_SOCKET_URL` with your backend URL
3. Deploy the `client/` directory

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update environment variable documentation if needed
5. Submit a pull request

---

**Happy Typing! 🎯⚡**
