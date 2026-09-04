# Teamup 🤝

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20In--Memory-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A full-stack collaboration platform that pairs hackathon builders and project creators based on automated resume parsing, GitHub repository analysis, and skill compatibility matching.

---

## 👥 Hackathon Team & Authors

| Contributor | Role | GitHub |
| :--- | :--- | :--- |
| **Basant Gautam** | Full-Stack & API Architecture | [@basant-gautam](https://github.com/basant-gautam) |
| **Krishna Rai** | ML & Resume Intelligence Engine | [@KRISHNA-24BCS127](https://github.com/KRISHNA-24BCS127) |
| **Kushagra Gupta** | Algorithm Design & Systems | [@Kushagra-Gupta](https://github.com/Kushagra-Gupta) |

---

## 🚀 Key Engineering Highlights

- **Automated Resume Parsing (PDF & DOCX)**: Integrated `pdf-parse` and `mammoth` parsing pipelines with regex tokenization to extract technical proficiencies, project experience, and achievements during onboarding.
- **GitHub Profile & Repository Detection**: Analyzes candidate text and resumes to automatically associate repositories, detect project technologies, and link source repositories.
- **Smart Teammate Matching Algorithm**: Computes candidate affinity scores based on overlapping tech stacks, project history, and availability status.
- **Hybrid Zero-Downtime Persistence**:
  - Connects to **MongoDB Atlas** for production document persistence.
  - Automatically falls back to a high-speed **In-Memory Store** with mock candidates if MongoDB is disconnected or unconfigured—guaranteeing 100% demo availability with zero runtime crashes.
- **RESTful API Architecture**: Modular service structure using Express 5, SHA-256 password hashing, token-based session management, and Multer multipart processing.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, Modern CSS3 (Glassmorphism, Flexbox, Animations), Asynchronous JavaScript (Fetch API, DOM Events)
- **Backend**: Node.js, Express.js (v5.x)
- **Data & Models**: Mongoose ODM, MongoDB Atlas (with seamless in-memory fallback)
- **File Parsing**: `multer`, `pdf-parse`, `mammoth`
- **Security & Utilities**: Crypto (SHA-256), CORS, Dotenv

---

## 📁 Repository Structure

```
Teamup/
├── models/                     # Mongoose Schemas & Data Models
│   ├── User.js                 # User profile, skills, projects, achievements
│   ├── Teammate.js             # Teammate showcase schema
│   └── Session.js              # Tokenized user authentication sessions
├── routes/
│   └── resume.js               # Resume parsing & scoring API endpoints
├── scripts/
│   ├── seedData.js             # Initial candidate dataset (including team authors)
│   └── seed.js                 # Standalone database seeder script
├── utils/
│   └── parser.js               # Skill keyword dictionaries & regex extractors
├── uploads/                    # Temp storage for parsed files (.gitkeep only)
├── .env.example                # Sample environment variables
├── .gitignore                  # Git ignore rules (node_modules, logs, uploads)
├── package.json                # Project dependencies and scripts
├── server.js                   # Application server & API controller
├── dashboard.js                # Client logic for teammate discovery & filtering
├── script.js                   # Client logic for signup & login forms
├── index.html                  # Landing page
├── login.html                  # User login interface
├── signup.html                 # Registration & resume upload interface
├── dashboard.html              # Teammate search, filter, and connection interface
├── about.html                  # Project background & contributor bios
└── db-status.html              # Diagnostic database monitoring dashboard
```

---

## ⚡ Quickstart & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/KRISHNA-24BCS127/Teamup.git
cd Teamup
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables (Optional)
```bash
# Copy sample configuration
cp .env.example .env
```
*Note: If `MONGODB_URI` is omitted or unavailable, the application automatically boots into zero-config in-memory mode.*

### 4. Run the Server
```bash
# Production mode
npm start

# Development mode (auto-reload with nodemon)
npm run dev
```

### 5. Access the Platform
Visit `http://localhost:5000` in your browser.
- Default demo credentials:
  - **Email**: `test@example.com`
  - **Password**: `password123`

---

## ☁️ Free Cloud Deployment (Render.com)

1. Fork or push this repository to your GitHub account.
2. Sign up on [Render.com](https://render.com/) (100% free).
3. Click **New +** &rarr; **Web Service**.
4. Connect your `Teamup` repository.
5. Configure the service:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
6. *(Optional)* Add Environment Variable:
   - `MONGODB_URI`: Your MongoDB Atlas connection string. (Even without this, the app runs smoothly with in-memory persistence).
7. Click **Deploy Web Service** & your live link will be live in 2 minutes!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
