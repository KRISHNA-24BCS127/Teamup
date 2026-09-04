# Teamup Style Guide

This guide defines the coding conventions for the **Teamup** codebase. Consistency makes the project easier to read, review, and maintain. Please follow these conventions in all contributions — most are enforced during **code review**.

---

## Table of Contents

- [General Principles](#general-principles)
- [JavaScript Style](#javascript-style)
- [Project Structure](#project-structure)
- [HTML & CSS Style](#html--css-style)
- [API & Backend Conventions](#api--backend-conventions)
- [Error Handling](#error-handling)
- [Security Rules](#security-rules)
- [File & Directory Naming](#file--directory-naming)
- [Code Review Checklist](#code-review-checklist)

---

## General Principles

1. **Clarity over cleverness** — write code a teammate can understand in one read.
2. **Small, focused changes** — one concern per commit and per pull request.
3. **No commented-out dead code** — remove it, don't comment it out.
4. **Prefer the standard library** before adding a dependency.
5. **Comment the *why*, not the *what*** — the code already says what it does.

---

## JavaScript Style

### Naming

- **Variables & functions**: `camelCase` → `getUserProfile()`
- **Classes / models / constructors**: `PascalCase` → `class Teammate`
- **Constants**: `SCREAMING_SNAKE_CASE` → `const MAX_RESULTS = 20`
- **Booleans**: prefix with `is` / `has` / `should` → `isAvailable`

### Syntax

- ES6+ only (`const`, `let`, arrow functions, template literals, destructuring).
- Prefer `const` over `let` — never use `var`.
- 2-space indentation.
- Use **single quotes** for strings.
- Terminate statements with semicolons.
- Use template literals for string interpolation:

  ```js
  // ✅ Good
  const url = `/api/teammates/${id}`;

  // ❌ Avoid
  const url = '/api/teammates/' + id;
  ```

### Async Patterns

- Use `async`/`await` instead of raw promise chains or callbacks where possible.

  ```js
  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to load profile");
      // ...
    } catch (err) {
      console.error("Profile load error:", err);
    }
  }
  ```

### Functions

- Keep functions short (aim **under ~50 lines**) and single-purpose.
- Name functions for what they do (`fetchTeammates`, not `getStuff`).
- Destructure object/array params for clarity.

---

## Project Structure

Keep related code together and follow the existing layout:

```
Teamup/
├── models/          # Mongoose/ODM schemas & data models
├── routes/          # Express route modules
├── scripts/         # Standalone utilities & database seeders
├── utils/           # Shared helpers (parsers, keyword dictionaries)
├── uploads/         # Temporary file storage for uploads (.gitkeep only)
├── server.js        # Application entry point & API controller
├── *.html           # Vanilla-HTML pages (no framework)
└── *.js             # Client-side logic (fetch API + DOM events)
```

- **Place new API endpoints in the appropriate route module**, not inline in `server.js`.
- **Reusable logic** belongs in `utils/`, not duplicated inline.
- **Data definitions** (schemas, seed data) belong in `models/` / `scripts/`.

---

## HTML & CSS Style

- **Semantic HTML5** tags (`header`, `nav`, `main`, `section`, `footer`).
- Consistent naming across classes. Use **kebab-case** for CSS class names (e.g., `.search-container`).
- Keep styling in the existing CSS files; avoid long inline `style` blocks unless dynamically generated.
- All user-rendered text must be **HTML-escaped** to prevent XSS — use the existing `escapeHtml()` helper.

---

## API & Backend Conventions

### Response Shape

All API responses should follow a consistent shape so the frontend can rely on it:

```js
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "message": "Human-readable error" }
```

### HTTP Status Codes

| Code | Meaning |
| :--- | :--- |
| `200` | OK |
| `201` | Created |
| `400` | Bad request (invalid input) |
| `401` | Unauthorized (missing/invalid token) |
| `404` | Not found |
| `500` | Internal server error |

### Routes

- Express 5 route syntax (`app.get("/path", handler)`).
- **Never** expose sensitive fields (passwords, hashes, tokens).
- Return `401` for protected routes via the authentication middleware.

---

## Error Handling

- **Always** try/catch async handlers and return a consistent `500` JSON error — never let an unhandled rejection crash the server.
- Use the **hybrid persistence** pattern already in the codebase: attempt MongoDB, fall back to in-memory on failure.

```js
try {
  // ... attempt MongoDB path
} catch (mongoErr) {
  console.warn("MongoDB error, falling back to memory:", mongoErr.message);
  // ... in-memory fallback
}
```

- Log meaningful errors with `console.warn` / `console.error`, never raw stack dumps to users.

---

## Security Rules

- **No hardcoded secrets** — API keys and connection strings go in `.env` (see `.env.example`).
- **Never log or return password hashes or tokens.**
- **Sanitize user input** — escape regex metacharacters in search, and HTML-escape in the frontend.
- **Use `rel="noopener noreferrer"`** on all `target="_blank"` outbound links.
- Run `npm audit` and address vulnerabilities before shipping.
- Prefer the authentication middleware over ad-hoc token checks.

---

## File & Directory Naming

| Item | Convention | Example |
| :--- | :--- | :--- |
| JS files | `camelCase.js` | `dashboard.js` |
| HTML files | `lowercase.html` | `signup.html` |
| CSS files | `kebab-case.css` | `dashboard-fix.css` |
| Docs | `UPPER_SNAKE.md` | `CONTRIBUTING.md` |
| Utility modules | `camelCase.js` | `parser.js` |

---

## Code Review Checklist

Before opening a pull request, verify:

- [ ] No debugging statements (`console.log`) left in production code.
- [ ] No secrets, `.env`, or log files committed.
- [ ] User input is escaped/sanitized.
- [ ] New API endpoints follow the standard response shape.
- [ ] Changes are focused and the commit message follows Conventional Commits.
- [ ] README / docs updated if behavior changed.
- [ ] `npm install && npm start` runs without errors.

---

*This guide is a living document — suggest improvements via a pull request!*