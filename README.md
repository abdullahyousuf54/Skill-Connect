# SkillConnect

Private SIH 2026 hackathon prototype based on the supplied Academia–Industry Collaboration problem statement and Skill Connect presentation.

## Run

Use Node 22.13+ and npm. On Windows use `npm.cmd install`, `npm.cmd run dev`, and `npm.cmd run build`. Run `npx.cmd tsc --noEmit` for type checks and `node tests/smoke.mjs` while the development server is running for API integration checks. Test data is isolated under a unique test identity.

## Demo walkthrough

1. Student: edit the sample profile, complete the 12-question assessment, browse matched opportunities, apply, and add a portfolio project or upload a resume.
2. Industry: review that application, shortlist the candidate, add mentor feedback, post a new opportunity, or publish a training program.
3. Institution: approve the new opportunity, verify evidence, and inspect live application totals and skill-demand counts.
4. Faculty: find FDPs, internships, research and consultancy opportunities, apply, and verify student achievements.
5. Student: see the updated application status and verified evidence. Print the portfolio using the browser's Save as PDF option.

## Implemented architecture

React/Vinext frontend and server API, Cloudflare D1 (SQLite) persistent structured records, R2 document storage. Prepared SQL statements and per-viewer ownership checks isolate records. `/api/portal` reads state and handles validated workflow actions; `/api/files` uploads and authorizes downloads. `db/schema.ts` and `drizzle/` describe the database. Sites manages the deployed database and bucket.

Matching is deterministic: unique matched required skills divided by unique required skills. Assessment answers are scored on the server. Scores represent compatibility or a short diagnostic, not verified proficiency or a hiring prediction.

## Honest prototype boundaries

The deployed site is private and authenticated by Sites. The portal selector demonstrates roles within each viewer's isolated sandbox. It is not production role assignment, independent student/company registration, or a shared multi-organization recruitment system. All actions remain scoped to that authenticated viewer, with additional role-action checks for the selected demo workflow.

Sample names, companies, listings and compensation are fictional. Academic institutions are profile fields rather than managed organization records. Portfolio verification demonstrates manual approval inside the demo; it is not independent credential verification. Learning completion is self-reported. PDF export uses browser printing. The 12-item diagnostic is not a validated aptitude instrument.

Not implemented: public account registration, production organizational RBAC and recruitment tenancy, external ERP/LMS or certification integrations, ML/NLP resume parsing, blockchain credentials, email/chat notifications, independent company onboarding, eligibility rules beyond portal audience/deadline, real-time multi-user collaboration, policy-level reporting, or production operational hardening. No claim of GDPR compliance or end-to-end encryption is made.

For a public pilot, replace demo role switching with verified organization membership, enforce company/institution ownership for shared records, add audit events, rate limits, file signature/malware checks, retention policies and monitoring, and review dependency security findings. MongoDB would require a compatible Node backend or HTTP database bridge; this Sites runtime uses its built-in D1 database to avoid external database setup.
