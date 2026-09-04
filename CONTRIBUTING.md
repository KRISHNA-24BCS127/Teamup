# Contributing to Teamup

First off, thank you for taking the time to contribute! 🎉

**Teamup** is an open-source project made possible by people like you. Whether you are fixing a bug, building a new feature, improving documentation, or polishing the UI — every contribution is valued and appreciated.

Please read the [Code of Conduct](CODE_OF_CONDUCT.md) — by participating you agree to uphold it.

---

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
  - [1. Fork & Clone](#1-fork--clone)
  - [2. Create a Branch](#2-create-a-branch)
  - [3. Make Changes](#3-make-changes)
  - [4. Commit Conventionally](#4-commit-conventionally)
  - [5. Open a Pull Request](#5-open-a-pull-request)
- [Coding Standards](#coding-standards)
- [Reporting Bugs](#reporting-bugs)
- [Security Issues](#security-issues)
- [License](#license)

---

## Ways to Contribute

- 🐛 **Report bugs** using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ **Request features** using the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- 🛠 **Submit code** via pull requests (bug fixes, features, refactors)
- 📖 **Improve documentation** (README, comments, guides)
- 💬 **Help others** in issues and discussions

---

## Getting Started

1. **Install prerequisites**: [Node.js v18+](https://nodejs.org/) and [npm](https://www.npmjs.com/).
2. Clone and install:

   ```bash
   git clone https://github.com/KRISHNA-24BCS127/Teamup.git
   cd Teamup
   npm install
   ```

3. *(Optional)* Configure the environment:

   ```bash
   cp .env.example .env
   ```

   The app runs with zero configuration — if `MONGODB_URI` is not set it automatically uses the in-memory store.

4. Run the server:

   ```bash
   npm start        # production
   npm run dev      # development with auto-reload (nodemon)
   ```

5. Visit `http://localhost:5000`.

---

## Development Workflow

We follow a simple **GitHub Flow**-style workflow.

### 1. Fork & Clone

Fork the repository on GitHub, then clone your fork locally.

```bash
git clone https://github.com/<your-username>/Teamup.git
cd Teamup
git remote add upstream https://github.com/KRISHNA-24BCS127/Teamup.git
```

### 2. Create a Branch

Always create a dedicated branch for your work. Use a short, descriptive name.

```bash
git checkout -b fix/login-validation
```

### 3. Make Changes

Keep changes focused on a single concern. Small, atomic changes are far easier to review and far less likely to introduce regressions. Keep `upstream/main` in sync regularly.

```bash
git fetch upstream
git rebase upstream/main
```

### 4. Commit Conventionally

We use **Conventional Commits**. This keeps history readable and enables automated tooling.

```
<type>(<scope>): <short summary>
```

Common types:

| Type | Description |
| :--- | :--- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | A performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Maintenance / build / tooling |
| `security` | Security-related fix |

Examples:

```bash
git commit -m "feat(auth): add password reset flow"
git commit -m "fix(dashboard): hide resume button when no resume exists"
git commit -m "docs(readme): document the search API"
```

### 5. Open a Pull Request

1. Push your branch to your fork:

   ```bash
   git push origin your-branch-name
   ```

2. Open a pull request against `main`.
3. Fill out the [pull request template](.github/PULL_REQUEST_TEMPLATE.md) completely.
4. Reference any related issue (`Closes #12`).
5. A maintainer will review — expect constructive feedback, that is all part of the process. 🚀

---

## Coding Standards

Before submitting code, please review the [Style Guide](STYLE_GUIDE.md). Key points:

- **JavaScript**: modern ES6+ syntax, `const`/`let`, async/await.
- **Formatting**: 2-space indentation, single quotes, consistent semicolons.
- **Naming**: descriptive camelCase for JS, PascalCase for models/classes.
- **API responses**: consistently use `{ success, message, data }` shape.
- **Security**: never log secrets, never expose password hashes, validate and sanitize all input.
- **Documentation**: update the README and add inline comments for non-obvious logic.

---

## Reporting Bugs

Always use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). A great bug report includes:

- **Steps to reproduce** (clearly and completely)
- **Expected vs. actual behavior**
- **Environment** (Node.js version, OS, browser)
- **Screenshots** or error logs (if any)

---

## Security Issues

**Do not open a public issue for security problems.** Please follow the process in [SECURITY.md](SECURITY.md) and report privately.

---

## License

By contributing to Teamup, you agree that your contributions will be licensed under the **GNU Affero General Public License v3.0**. See [LICENSE](LICENSE) for the full text.

Happy coding! 💻✨