# Typeform 3D - Conversational Form Builder & Respondent Platform

A fullstack **Typeform Clone** with an immersive 3D ambient WebGL viewport, modern glassmorphic design system, drag-and-drop form builder, logic jump conditional branching, authentic 1-question-at-a-time conversational respondent flow with full keyboard navigation, responses analytics dashboard, Python FastAPI backend, and SQLite database persistence.

---

## 🌟 Key Features & Highlights

- **3D WebGL Ambient Interface (Three.js)**: Interactive 3D floating geometries (torus knots, wireframe polyhedrons, particle starfield) responding to mouse movement parallax and step transitions.
- **4 Custom 3D Themes**: Cyber Neon, Deep Space Glass, Sunset Glass, and Emerald Jade.
- **Form Builder**: Recreate forms with title & ordered questions. Drag-and-drop question reordering powered by `@hello-pangea/dnd`.
- **8 Question Types**: Short Text, Long Text, Multiple Choice, Dropdown, Email, Number, Yes/No, Star Rating.
- **Conditional Logic Jumps**: Configure rules (e.g., *"If Question 1 equals 'Yes', jump to Question 4"*).
- **Split Live Preview**: Real-time live interactive simulator embedded inside the builder workspace.
- **Authentic Respondent Flow**: Public shareable link (`/to/:shareId`), no login required. One question at a time with smooth 3D card perspective transitions and complete keyboard navigation (`Enter`, `Up/Down` arrows, `A-E` hotkeys for choices, `Y/N` for boolean, `1-5` for ratings).
- **Results & Analytics Dashboard**: Total submissions metrics, completion rates, avg time, Recharts visual bar charts, submissions table, and **1-click CSV Export**.
- **Seeded SQLite Database**: Auto-seeds database with 3 complete sample forms and 13+ realistic responses.

---

## 🏗️ Architecture Overview

```
Scaler AI Labs SDE/
├── backend/
│   ├── main.py              # FastAPI application & REST endpoints
│   ├── database.py          # SQLite engine & session setup
│   ├── models.py            # SQLAlchemy models (Form, Question, Option, LogicRule, Response, Answer)
│   ├── schemas.py           # Pydantic validation schemas
│   ├── crud.py              # Database query operations & analytics aggregation
│   ├── seed.py              # Database seeder script with realistic sample forms & responses
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/          # Background3D (Three.js canvas) & Confetti3D
│   │   │   ├── builder/     # FormBuilder, DragDropQuestions, QuestionEditor, LogicJumpEditor, ThemeCustomizer
│   │   │   ├── respondent/  # FormRespondentFlow (1-question-at-a-time UI)
│   │   │   ├── analytics/   # ResponsesDashboard, AnalyticsCharts (Recharts), SubmissionsTable
│   │   │   └── dashboard/   # FormList, FormCard, CreateFormModal, ShareModal
│   │   ├── services/        # Axios API service connecting to FastAPI
│   │   ├── types/           # TypeScript definitions
│   │   └── App.tsx          # Main routing & application state
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

---

## 🗄️ Database Schema (SQLite)

- `forms`: `id`, `title`, `description`, `cover_image`, `status` ('draft'/'published'), `theme`, `share_id`, `thank_you_title`, `thank_you_description`, `created_at`, `updated_at`
- `questions`: `id`, `form_id`, `question_type`, `title`, `description`, `order_index`, `is_required`, `placeholder`, `min_val`, `max_val`
- `question_options`: `id`, `question_id`, `option_label`, `option_value`, `order_index`
- `logic_rules`: `id`, `form_id`, `source_question_id`, `condition_operator`, `condition_value`, `target_question_id`
- `responses`: `id`, `form_id`, `share_id`, `submitted_at`, `completion_time_seconds`, `user_agent`
- `answers`: `id`, `response_id`, `question_id`, `answer_value`

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+

### 1. Start Backend (FastAPI + SQLite)
```bash
cd backend
python -m pip install -r requirements.txt
python seed.py
uvicorn main:app --host 127.0.0.1 --port 8000
```
Backend API will run at `http://127.0.0.1:8000/api`. API Documentation (Swagger) is accessible at `http://127.0.0.1:8000/docs`.

### 2. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend web application will run at `http://127.0.0.1:5173/`.

---

## ⌨️ Keyboard Shortcuts (Respondent Flow)

| Shortcut | Action |
| --- | --- |
| `Enter` | Advance to next question / Submit answer |
| `Up Arrow` / `Down Arrow` | Move between questions |
| `A`, `B`, `C`, `D` | Select choice option |
| `Y` / `N` | Select Yes / No |
| `1` - `5` | Select Star Rating score |
