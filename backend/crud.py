from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas

def get_forms(db: Session):
    forms = db.query(models.Form).order_by(models.Form.created_at.desc()).all()
    result = []
    for form in forms:
        resp_count = db.query(func.count(models.Response.id)).filter(models.Response.form_id == form.id).scalar()
        form_dict = schemas.FormOut.model_validate(form)
        form_dict.response_count = resp_count
        result.append(form_dict)
    return result

def get_form(db: Session, form_id: str):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        return None
    resp_count = db.query(func.count(models.Response.id)).filter(models.Response.form_id == form.id).scalar()
    form_dict = schemas.FormOut.model_validate(form)
    form_dict.response_count = resp_count
    return form_dict

def get_form_by_share_id(db: Session, share_id: str):
    form = db.query(models.Form).filter(models.Form.share_id == share_id).first()
    if not form:
        return None
    resp_count = db.query(func.count(models.Response.id)).filter(models.Response.form_id == form.id).scalar()
    form_dict = schemas.FormOut.model_validate(form)
    form_dict.response_count = resp_count
    return form_dict

def create_form(db: Session, form_in: schemas.FormCreate):
    db_form = models.Form(
        title=form_in.title,
        description=form_in.description,
        cover_image=form_in.cover_image,
        status=form_in.status,
        theme=form_in.theme,
        thank_you_title=form_in.thank_you_title,
        thank_you_description=form_in.thank_you_description
    )
    db.add(db_form)
    db.flush()

    # Add questions if provided
    for q_idx, q_data in enumerate(form_in.questions):
        db_q = models.Question(
            form_id=db_form.id,
            question_type=q_data.question_type,
            title=q_data.title,
            description=q_data.description,
            order_index=q_idx,
            is_required=q_data.is_required,
            placeholder=q_data.placeholder,
            min_val=q_data.min_val,
            max_val=q_data.max_val
        )
        db.add(db_q)
        db.flush()

        for opt_idx, opt_data in enumerate(q_data.options):
            db_opt = models.QuestionOption(
                question_id=db_q.id,
                option_label=opt_data.option_label,
                option_value=opt_data.option_value,
                order_index=opt_idx
            )
            db.add(db_opt)

    # Add logic rules if provided
    for l_data in form_in.logic_rules:
        db_l = models.LogicRule(
            form_id=db_form.id,
            source_question_id=l_data.source_question_id,
            condition_operator=l_data.condition_operator,
            condition_value=l_data.condition_value,
            target_question_id=l_data.target_question_id
        )
        db.add(db_l)

    db.commit()
    db.refresh(db_form)
    return get_form(db, db_form.id)

def update_form(db: Session, form_id: str, form_in: schemas.FormUpdate):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        return None
    for field, val in form_in.model_dump(exclude_unset=True).items():
        setattr(db_form, field, val)
    db.commit()
    db.refresh(db_form)
    return get_form(db, form_id)

def delete_form(db: Session, form_id: str):
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        return False
    db.delete(db_form)
    db.commit()
    return True

def duplicate_form(db: Session, form_id: str):
    orig = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not orig:
        return None

    new_form = models.Form(
        title=f"{orig.title} (Copy)",
        description=orig.description,
        cover_image=orig.cover_image,
        status="draft",
        theme=orig.theme,
        thank_you_title=orig.thank_you_title,
        thank_you_description=orig.thank_you_description
    )
    db.add(new_form)
    db.flush()

    q_map = {} # old_q_id -> new_q_id
    for q in orig.questions:
        new_q = models.Question(
            form_id=new_form.id,
            question_type=q.question_type,
            title=q.title,
            description=q.description,
            order_index=q.order_index,
            is_required=q.is_required,
            placeholder=q.placeholder,
            min_val=q.min_val,
            max_val=q.max_val
        )
        db.add(new_q)
        db.flush()
        q_map[q.id] = new_q.id

        for opt in q.options:
            new_opt = models.QuestionOption(
                question_id=new_q.id,
                option_label=opt.option_label,
                option_value=opt.option_value,
                order_index=opt.order_index
            )
            db.add(new_opt)

    for rule in orig.logic_rules:
        new_source = q_map.get(rule.source_question_id, rule.source_question_id)
        new_target = q_map.get(rule.target_question_id, rule.target_question_id)
        new_rule = models.LogicRule(
            form_id=new_form.id,
            source_question_id=new_source,
            condition_operator=rule.condition_operator,
            condition_value=rule.condition_value,
            target_question_id=new_target
        )
        db.add(new_rule)

    db.commit()
    return get_form(db, new_form.id)

def add_question(db: Session, form_id: str, q_in: schemas.QuestionCreate):
    max_idx = db.query(func.max(models.Question.order_index)).filter(models.Question.form_id == form_id).scalar()
    next_idx = (max_idx + 1) if max_idx is not None else 0

    db_q = models.Question(
        form_id=form_id,
        question_type=q_in.question_type,
        title=q_in.title,
        description=q_in.description,
        order_index=next_idx,
        is_required=q_in.is_required,
        placeholder=q_in.placeholder,
        min_val=q_in.min_val,
        max_val=q_in.max_val
    )
    db.add(db_q)
    db.flush()

    for idx, opt in enumerate(q_in.options or []):
        db_opt = models.QuestionOption(
            question_id=db_q.id,
            option_label=opt.option_label,
            option_value=opt.option_value,
            order_index=idx
        )
        db.add(db_opt)

    db.commit()
    db.refresh(db_q)
    return db_q

def update_question(db: Session, question_id: str, q_in: schemas.QuestionCreate):
    db_q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_q:
        return None
    db_q.question_type = q_in.question_type
    db_q.title = q_in.title
    db_q.description = q_in.description
    db_q.is_required = q_in.is_required
    db_q.placeholder = q_in.placeholder
    db_q.min_val = q_in.min_val
    db_q.max_val = q_in.max_val

    # Replace options
    db.query(models.QuestionOption).filter(models.QuestionOption.question_id == question_id).delete()
    for idx, opt in enumerate(q_in.options or []):
        db_opt = models.QuestionOption(
            question_id=question_id,
            option_label=opt.option_label,
            option_value=opt.option_value,
            order_index=idx
        )
        db.add(db_opt)

    db.commit()
    db.refresh(db_q)
    return db_q

def delete_question(db: Session, question_id: str):
    db_q = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_q:
        return False
    db.delete(db_q)
    db.commit()
    return True

def reorder_questions(db: Session, form_id: str, items: List[schemas.QuestionReorderItem]):
    for item in items:
        db.query(models.Question).filter(models.Question.id == item.id, models.Question.form_id == form_id).update(
            {"order_index": item.order_index}
        )
    db.commit()
    return True

def submit_response(db: Session, share_id: str, resp_in: schemas.ResponseSubmit, user_agent: str = None):
    form = db.query(models.Form).filter(models.Form.share_id == share_id).first()
    if not form:
        return None

    db_resp = models.Response(
        form_id=form.id,
        share_id=share_id,
        completion_time_seconds=resp_in.completion_time_seconds or 0,
        user_agent=user_agent
    )
    db.add(db_resp)
    db.flush()

    for ans in resp_in.answers:
        db_ans = models.Answer(
            response_id=db_resp.id,
            question_id=ans.question_id,
            answer_value=ans.answer_value
        )
        db.add(db_ans)

    db.commit()
    db.refresh(db_resp)
    return db_resp

def get_responses_for_form(db: Session, form_id: str):
    responses = db.query(models.Response).filter(models.Response.form_id == form_id).order_by(models.Response.submitted_at.desc()).all()
    return responses

def get_analytics_for_form(db: Session, form_id: str):
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        return None

    total_resp = db.query(func.count(models.Response.id)).filter(models.Response.form_id == form_id).scalar() or 0
    avg_time = db.query(func.avg(models.Response.completion_time_seconds)).filter(models.Response.form_id == form_id).scalar() or 0.0

    q_analytics = []
    for q in form.questions:
        q_data = {
            "question_id": q.id,
            "title": q.title,
            "question_type": q.question_type,
            "total_answers": 0,
            "option_counts": {},
            "numeric_avg": None,
            "recent_answers": []
        }

        answers = db.query(models.Answer).filter(models.Answer.question_id == q.id).all()
        q_data["total_answers"] = len(answers)

        if q.question_type in ["multiple_choice", "dropdown", "yes_no"]:
            counts = {}
            for opt in q.options:
                counts[opt.option_label] = 0
            if q.question_type == "yes_no":
                counts["Yes"] = 0
                counts["No"] = 0

            for ans in answers:
                val = ans.answer_value
                if val in counts:
                    counts[val] += 1
                elif val:
                    counts[val] = counts.get(val, 0) + 1
            q_data["option_counts"] = counts

        elif q.question_type in ["number", "rating"]:
            num_vals = []
            for ans in answers:
                try:
                    if ans.answer_value:
                        num_vals.append(float(ans.answer_value))
                except ValueError:
                    pass
            if num_vals:
                q_data["numeric_avg"] = round(sum(num_vals) / len(num_vals), 2)

            counts = {}
            for val in num_vals:
                key = str(int(val)) if val.is_integer() else str(val)
                counts[key] = counts.get(key, 0) + 1
            q_data["option_counts"] = counts

        else:
            recent = [a.answer_value for a in answers if a.answer_value][-10:]
            q_data["recent_answers"] = recent

        q_analytics.append(q_data)

    return {
        "total_responses": total_resp,
        "completion_rate": 100.0 if total_resp > 0 else 0.0,
        "avg_completion_time_seconds": round(avg_time, 1),
        "question_analytics": q_analytics
    }
