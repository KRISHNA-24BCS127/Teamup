# Security Policy

Thank you for helping keep **Teamup** and its users safe. We take security
vulnerabilities seriously.

## Supported Versions

We currently provide security updates for the latest release on the `main`
branch. End-of-life branches are not patched.

| Version | Supported |
| :--- | :--- |
| `main` (latest) | ✅ Yes |
| Older releases | ❌ No |

## Reporting a Vulnerability

**Please do NOT open a public issue for security vulnerabilities.** Disclosure
of a vulnerability before it is fixed can put users at risk.

Instead, report privately by emailing the project maintainers at the address
listed in the project's repository description, or by opening a **private**
vulnerability report through GitHub's `Security` → `Report a vulnerability`
interface on the repository.

Please include:

- A **description** of the vulnerability and its impact.
- **Steps to reproduce** (or a proof of concept).
- Affected **versions**.
- Any suggested **mitigation** or fix.

### What happens next

1. The maintainers will acknowledge your report within **3 business days**.
2. We will investigate, reproduce, and confirm the issue.
3. We will prepare a fix and release it, then credit you (if you wish) in a
   security advisory.

---

## Security Best Practices (for contributors)

This project follows the guidance in [STYLE_GUIDE.md](STYLE_GUIDE.md#security-rules).
In short:

- No secrets, `.env`, or log files are ever committed.
- Password hashes and tokens are never exposed via the API.
- All user input is escaped and sanitized.
- Dependencies are audited with `npm audit` before release.