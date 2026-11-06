# Architecture rules
- Deployment, drone-history, and audit records are server-only; validate signed access-code sessions before privileged writes to prevent client impersonation.