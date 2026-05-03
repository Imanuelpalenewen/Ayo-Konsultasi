# User Stories — Ayo Konsultasi

> Requirement traceability as per Roger Pressman's Software Engineering principles.
> Each story maps to a feature in `implementation.md`.

---

## Student Stories

| ID | Story | Feature |
|----|-------|---------|
| US-01 | As a student, I want to register an account so I can access the consultation system | FEAT-1 |
| US-02 | As a student, I want to log in securely so my data is protected | FEAT-1 |
| US-03 | As a student, I want to see my dashboard so I can quickly view my consultation status | FEAT-2 |
| US-04 | As a student, I want to describe my consultation need and get AI-recommended lecturers that match my topic and schedule | FEAT-5 |
| US-05 | As a student, I want to book a consultation by picking a date from a calendar and setting my preferred time | FEAT-6 |
| US-06 | As a student, I want to cancel a pending consultation request | FEAT-5 |
| US-07 | As a student, I want to be notified when my consultation request is accepted or rejected | FEAT-6 |
| US-08 | As a student, I want to view my past consultations | FEAT-7 |
| US-09 | As a student, I want to get an AI-generated summary of my consultation notes | FEAT-8 |
| US-10 | As a student, I want to edit my profile information | FEAT-9 |

## Lecturer Stories

| ID | Story | Feature |
|----|-------|---------|
| US-11 | As a lecturer, I want to register, set my role as lecturer, and configure my expertise tags and weekly availability | FEAT-1, FEAT-4 |
| US-12 | As a lecturer, I want to see my dashboard with incoming consultation requests | FEAT-3 |
| US-13 | As a lecturer, I want to accept or reject consultation requests | FEAT-5 |
| US-14 | As a lecturer, I want to be notified when a student books a consultation with me | FEAT-6 |
| US-15 | As a lecturer, I want to view my consultation history | FEAT-7 |
| US-16 | As a lecturer, I want to edit my profile and expertise information | FEAT-9 |

---

## Non-Functional Requirements

| ID | Requirement | Pressman Quality Attribute |
|----|-------------|---------------------------|
| NFR-01 | All pages must have loading states for async operations | Reliability |
| NFR-02 | All forms must have validation feedback | Usability |
| NFR-03 | Gemini API key must never be exposed to the browser | Security |
| NFR-04 | Real-time notification updates without page refresh | Performance |
| NFR-05 | TypeScript strict mode throughout | Maintainability |
| NFR-06 | All pages fully responsive across mobile, tablet, desktop | Usability |
| NFR-07 | Auth pages visible in full with zero scrolling at 375×667px viewport | Usability |
| NFR-08 | Passwords hashed by Convex Auth — never stored or logged as plain text | Security |
| NFR-09 | Seed accounts use default passwords (hashed): lecturer=dosen123, student=student67 | Security |
