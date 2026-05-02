# AIT Practice Platform

> A browser-based exam simulator that prepares university students for real coding interviews and competitive selection rounds — no environment setup required.

---

## The Problem

Many university students face a wall of anxiety when entering competitive selection rounds (like AIT Solution): they're asked to write architectural code — Models, Controllers, business logic — by hand, on paper. No IDE, no autocomplete, no second chances.

AIT Practice Platform was built to fix that. It breaks down real-world systems (e.g. *Airline Booking System*, *Banking System*) into small, focused coding tasks that students can practice step-by-step, directly in the browser, with instant feedback.

---

## What It Does

- **Step-by-step projects** — A full system is broken into bite-sized tasks: *"Write the User model"*, *"Implement the fund transfer method"*, and so on.
- **Browser IDE** — A fully-featured in-browser code editor with syntax highlighting, powered by Monaco Editor (the same engine behind VS Code).
- **Auto-grader** — Hit *Run* and your code is executed in an isolated server environment, tested automatically, and graded as **Passed** or **Failed** within seconds.
- **Exam Mode** — A countdown timer kicks in to simulate real selection pressure.
- **Progress Tracking** — Visual progress bars per project (e.g. *Airline System — 35% completed*), with task statuses: ✅ Done / 🔴 Failed / ⏳ In Progress.
- **AI Assistant** — A smart *"Why did it fail?"* feature that analyzes your error and gives a helpful nudge — without spoiling the answer.

---

## Who It's For

Students (especially in early years) who want to:

- Sharpen their understanding of application layers (MVC, business logic, data models)
- Practice writing logic under time pressure
- Get instant, meaningful feedback without setting up a local dev environment

---

## Tech Stack

### Backend
| Technology | Role |
|---|---|
| **Python + FastAPI** | Async REST API, auto-generated Swagger docs |
| **PostgreSQL** | Relational data storage (Projects → Tasks → Users) |
| **SQLAlchemy** | ORM for models, migrations, and queries |
| **Python `exec()`** | MVP code execution engine for running student submissions |

### Frontend
| Technology | Role |
|---|---|
| **React + TypeScript** | Dynamic UI with type safety |
| **Bootstrap** | Responsive layout and pre-built UI components |
| **Monaco Editor** | VS Code-grade in-browser code editor |

---
