# Teamup 🤝

**Teamup** (Quick Teams) — a platform that helps users find the right teammates for their projects, built as a hackathon project by a 3-member team.

## 👥 Team / Authors

| Name | GitHub |
|------|--------|
| Basant Gautam | [@basant-gautam](https://github.com/basant-gautam) |
| Krishna Rai | [@KRISHNA-24BCS127](https://github.com/KRISHNA-24BCS127) |
| Kushagra | [@kushagra](https://github.com/) |

## Features

- User authentication (signup, login, logout)
- Profile management
- Team member discovery and filtering
- Responsive design with dark theme

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: In-memory (for demo purposes)

## API Endpoints

### Authentication
- `POST /api/signup` - Register a new user
- `POST /api/login` - Authenticate user and get token
- `POST /api/logout` - Logout and invalidate token

### User
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile

### Teammates
- `GET /api/teammates` - Get list of potential teammates with filtering options

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/KRISHNA-24BCS127/Teamup.git
cd Teamup
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the root directory and add:
```
PORT=5000
NODE_ENV=development
```

4. Start the server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

5. Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
quick-teams-frontend/
│
├── public/           # Static files
├── .env              # Environment variables
├── server.js         # Express server and API
├── index.html        # Main landing page
├── login.html        # Login page
├── signup.html       # Signup page
├── dashboard.html    # User dashboard
├── style.css         # Styles
└── script.js         # Frontend JavaScript
```
