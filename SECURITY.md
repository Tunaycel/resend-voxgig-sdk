# Security

Do not include API keys or account response bodies in issues or commits. Use local environment variables for live testing.

The offline suite passes, and a participant-run, read-only `GET /domains` request was verified against a live account. This limited check does not establish production readiness. The generated client has no runtime npm dependencies; the generator's separate dependency graph has documented moderate advisories. See reports/DX-REPORT.md.
