from contextlib import asynccontextmanager
import io
import csv
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models, schemas, crud
from seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed database if empty
    db = next(get_db())
    form_count = db.query(models.Form).count()
    if form_count == 0:
        seed_database()
    yield

app = FastAPI(
    title="Typeform 3D Clone API",
    description="Backend API for 3D Modern Typeform Builder and Respondent Flow",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Typeform 3D Clone Backend"}

# --- Form CRUD ---

@app.get("/api/forms", response_model=List[schemas.FormOut])
def list_forms(db: Session = Depends(get_db)):
    return crud.get_forms(db)

@app.post("/api/forms", response_model=schemas.FormOut)
def create_form(form_in: schemas.FormCreate, db: Session = Depends(get_db)):
    return crud.create_form(db, form_in)

@app.get("/api/forms/{form_id}", response_model=schemas.FormOut)
def get_form(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form

@app.put("/api/forms/{form_id}", response_model=schemas.FormOut)
def update_form(form_id: str, form_in: schemas.FormUpdate, db: Session = Depends(get_db)):
    form = crud.update_form(db, form_id, form_in)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form

@app.delete("/api/forms/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db)):
    success = crud.delete_form(db, form_id)
    if not success:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Form deleted successfully"}

@app.post("/api/forms/{form_id}/duplicate", response_model=schemas.FormOut)
def duplicate_form(form_id: str, db: Session = Depends(get_db)):
    new_form = crud.duplicate_form(db, form_id)
    if not new_form:
        raise HTTPException(status_code=404, detail="Form not found")
    return new_form

@app.patch("/api/forms/{form_id}/publish", response_model=schemas.FormOut)
def toggle_publish(form_id: str, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    new_status = "published" if form.status == "draft" else "draft"
    return crud.update_form(db, form_id, schemas.FormUpdate(status=new_status))

# --- Questions ---

@app.post("/api/forms/{form_id}/questions", response_model=schemas.QuestionOut)
def add_question(form_id: str, q_in: schemas.QuestionCreate, db: Session = Depends(get_db)):
    form = crud.get_form(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return crud.add_question(db, form_id, q_in)

@app.put("/api/questions/{question_id}", response_model=schemas.QuestionOut)
def update_question(question_id: str, q_in: schemas.QuestionCreate, db: Session = Depends(get_db)):
    q = crud.update_question(db, question_id, q_in)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return q

@app.delete("/api/questions/{question_id}")
def delete_question(question_id: str, db: Session = Depends(get_db)):
    success = crud.delete_question(db, question_id)
    if not success:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}

@app.post("/api/forms/{form_id}/reorder-questions")
def reorder_questions(form_id: str, items: List[schemas.QuestionReorderItem], db: Session = Depends(get_db)):
    crud.reorder_questions(db, form_id, items)
    return {"message": "Questions reordered"}

# --- Public Respondent API ---

@app.get("/api/public/forms/{share_id}", response_model=schemas.FormOut)
def get_public_form(share_id: str, db: Session = Depends(get_db)):
    form = crud.get_form_by_share_id(db, share_id)
    if not form or form.status != "published":
        raise HTTPException(status_code=404, detail="Form is not published or does not exist")
    return form

@app.post("/api/public/forms/{share_id}/submit")
def submit_public_response(share_id: str, resp_in: schemas.ResponseSubmit, user_agent: Optional[str] = Header(None), db: Session = Depends(get_db)):
    resp = crud.submit_response(db, share_id, resp_in, user_agent=user_agent)
    if not resp:
        raise HTTPException(status_code=404, detail="Form not found")
    return {"message": "Response recorded successfully", "response_id": resp.id}

# --- Analytics & Export ---

@app.get("/api/forms/{form_id}/responses", response_model=List[schemas.ResponseOut])
def get_form_responses(form_id: str, db: Session = Depends(get_db)):
    return crud.get_responses_for_form(db, form_id)

@app.get("/api/forms/{form_id}/analytics")
def get_form_analytics(form_id: str, db: Session = Depends(get_db)):
    analytics = crud.get_analytics_for_form(db, form_id)
    if not analytics:
        raise HTTPException(status_code=404, detail="Form not found")
    return analytics

@app.get("/api/forms/{form_id}/export/csv")
def export_responses_csv(form_id: str, db: Session = Depends(get_db)):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    responses = crud.get_responses_for_form(db, form_id)
    
    output = io.StringIO()
    writer = csv.writer(output)

    # Header: Submission ID, Submitted At, Time (s), Q1, Q2, ...
    headers = ["Submission ID", "Submitted At", "Time (seconds)"] + [q.title for q in form.questions]
    writer.writerow(headers)

    for r in responses:
        ans_map = {a.question_id: a.answer_value for a in r.answers}
        row = [r.id, r.submitted_at.isoformat(), r.completion_time_seconds]
        for q in form.questions:
            row.append(ans_map.get(q.id, ""))
        writer.writerow(row)

    output.seek(0)
    filename = f"{form.title.replace(' ', '_')}_responses.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
