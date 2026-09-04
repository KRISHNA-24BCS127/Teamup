<div align="center">

# 🤝 Teamup

**Discover the perfect project teammate, powered by automated resume parsing and smart skill matching.**

[![AGPL-3.0 License](https://img.shields.io/badge/license-AGPL--3.0-blue?logo=gnu)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20In--Memory-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A full-stack collaboration platform that pairs hackathon builders and project creators based on
automated **resume parsing**, **GitHub repository analysis**, and **skill-compatibility matching**.

</div>

---

## ✨ Features

- 📄 **Automated Resume Parsing** — extracts skills, projects, and achievements from **PDF** & **DOCX** using `pdf-parse` and `mammoth` with regex tokenization.
- 🐙 **GitHub Profile Detection** — associates repositories and detects project technologies from candidate text.
- 🧠 **Smart Teammate Matching** — affinity scores based on overlapping tech stacks, project history, and availability.
- 🔌 **Hybrid Zero-Downtime Persistence** — connects to **MongoDB Atlas**, and automatically falls back to a high-speed **in-memory store** if the database is unavailable — 100% demo-ready, zero crashes.
- 🔐 **Secure by Default** — SHA-256 password hashing, token-based sessions, and sanitized API responses.
- 🌐 **Modern, Responsive UI** — vanilla HTML5/CSS3 with glassmorphism, animations, and async `fetch`.

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vanilla HTML5, CSS3 (Glassmorphism), JavaScript (Fetch API + DOM events) |
| **Backend** | Node.js, Express.js (v5.x) |
| **Data** | Mongoose ODM, MongoDB Atlas (with in-memory fallback) |
| **Parsing** | `multer`, `pdf-parse`, `mammoth` |
| **Security** | Crypto (SHA-256), CORS, Dotenv |

## 🧩 Architecture

```
Client (HTML/JS)  ──HTTP──▶  Express API (server.js)
                                 │
                                 ├──▶ MongoDB (Atlas)
                                 └──▶ In-Memory Store (fallback)
```

---

## 🚀 Quickstart

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or later**
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### 1. Clone

```bash
git clone https://github.com/KRISHNA-24BCS127/Teamup.git
cd Teamup
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment *(optional)*

```bash
cp .env.example .env
```

> If `MONGODB_URI` is omitted, the app automatically boots in **zero-config in-memory mode**.

### 4. Run

```bash
npm start        # production
npm run dev      # development with auto-reload (nodemon)
```

### 5. Use it

Open **http://localhost:5000** in your browser.

**Demo login:**
- Email: `test@example.com`
- Password: `password123`

### Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Run the server in production mode |
| `npm run dev` | Run with `nodemon` auto-reload |
---

## 📡 API Reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/db-status` | Database connectivity & stats | ✅ |
| `POST` | `/api/signup` | Register an account | — |
| `POST` | `/api/login` | Log in & receive a session token | — |
| `POST` | `/api/logout` | Invalidate the session | ✅ |
| `GET` | `/api/profile` | Fetch the current user's profile | ✅ |
| `PUT` | `/api/profile` | Update the current user's profile | ✅ |
| `GET` | `/api/search/teammates` | Search teammates by skill & availability | ✅ |
| `GET` | `/api/teammates` | Paginated teammate list | ✅ |

**Example — search for ML developers:**

```bash
curl "http://localhost:5000/api/search/teammates?skills=Machine%20Learning"
```

```json
{ "success": true, "teammates": [ { "name": "Krishna Rai", "skills": ["Python", "Machine Learning"] } ] }
```

---

## 📁 Project Structure

```
Teamup/
├── models/                  # Mongoose schemas & data models
│   ├── User.js
│   ├── Teammate.js
│   └── Session.js
├── routes/                  # Route modules
│   └── resume.js
├── scripts/                 # Utilities & seeders
│   ├── seedData.js
│   └── seed.js
├── utils/                   # Shared helpers
│   └── parser.js
├── uploads/                 # Temporary upload storage (.gitkeep only)
├── server.js                # Application server & API controller
├── *.html                   # Landing, login, signup, dashboard pages
└── *.js                     # Client-side logic
```

---

## 🤝 Contributing

We warmly welcome contributions! Please read our **[Contributing Guide](CONTRIBUTING.md)**
and the **[Style Guide](STYLE_GUIDE.md)** before getting started.

- 🐛 Found a bug? Open an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).
- ✨ Have an idea? Start a discussion or submit a [feature request](.github/ISSUE_TEMPLATE/feature_request.md).
- 🔒 Security issue? Follow [SECURITY.md](SECURITY.md) — **do not** open a public issue.

Be respectful — see our **[Code of Conduct](CODE_OF_CONDUCT.md)**.

---

## 👥 Authors

Teamup was built collaboratively by a 3-member team. See **[AUTHORS.md](AUTHORS.md)** for full credits:

- **Basant Gautam** — Full-Stack & API Architecture · [@basant-gautam](https://github.com/basant-gautam)
- **Krishna Rai** — ML & Resume Intelligence Engine · [@KRISHNA-24BCS127](https://github.com/KRISHNA-24BCS127)
- **Kushagra Gupta** — Algorithm Design & Systems · [@Kushagra-Gupta](https://github.com/Kushagra-Gupta)

---

## ⚖️ License

**Teamup** is free and open-source software distributed under the
**[GNU Affero General Public License v3.0](LICENSE)** (AGPL-3.0).

This is a **strong copyleft** license: you are free to use, study, share, and modify the software,
but any derivative works — including applications made available **over a network** — must also be
released under the AGPL, with the full corresponding source code made available to users.

For the complete terms, see the [LICENSE](LICENSE) file.

---

<div align="center">

Built with 💜 by the **Teamformers** for hackathon builders everywhere.

⭐ Star this repo · 🍴 Fork it · 🚀 Contribute

</div>