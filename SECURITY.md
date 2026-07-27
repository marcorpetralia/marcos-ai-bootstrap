# Security Policy

## What this tool does

`marcos-ai-bootstrap` runs **entirely locally** on your machine. It:

- Reads source templates from the npm package and the filesystem
- Writes agent/skill files and rule documents to a target repository
- **Does not make network calls**, does not phone home, does not collect telemetry or credentials

Verification: the runtime (`src/lib/materialize.js` and `src/bin/ai-bootstrap.js`) uses only Node.js built-in modules (`fs`, `path`, `os`) for file operations. No HTTP/HTTPS, no credential reads, no external calls.

## Supported versions

marcos-ai-bootstrap is **pre-1.0 and evolving**. SemVer stabilizes at `1.0.0`.

**Security fixes are applied only to the latest released version.** If you discover a security issue, update to the latest version and report it through the channels below.

## Reporting a vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **GitHub private security advisory** (preferred)  
   Use [GitHub's private vulnerability reporting](https://github.com/marcorpetralia/marcos-ai-bootstrap/security/advisories) to disclose the issue securely.

2. **Email** (fallback)  
   Email `marcorpetralia@gmail.com` with the subject line `[SECURITY] marcos-ai-bootstrap vulnerability`.

Please allow time for a fix before public disclosure. We will acknowledge receipt within 48 hours and provide a timeline for a patch.

## Scope

- **In scope:** vulnerabilities in the CLI, agent/skill generation, or rule definitions that could affect users or their repositories.
- **Out of scope:** general security advice, feature requests, or issues unrelated to security.
