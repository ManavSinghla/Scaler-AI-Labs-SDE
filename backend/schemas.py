from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class QuestionOptionBase(BaseModel):
    option_label: str
    option_value: str
    order_index: Optional[int] = 0

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOptionOut(QuestionOptionBase):
    id: str
    question_id: str

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    question_type: str
    title: str
    description: Optional[str] = ""
    order_index: Optional[int] = 0
    is_required: Optional[bool] = False
    placeholder: Optional[str] = ""
    min_val: Optional[int] = None
    max_val: Optional[int] = None

class QuestionCreate(QuestionBase):
    options: Optional[List[QuestionOptionCreate]] = []

class QuestionOut(QuestionBase):
    id: str
    form_id: str
    options: List[QuestionOptionOut] = []

    class Config:
        from_attributes = True

class LogicRuleBase(BaseModel):
    source_question_id: str
    condition_operator: str
    condition_value: str
    target_question_id: str

class LogicRuleCreate(LogicRuleBase):
    pass

class LogicRuleOut(LogicRuleBase):
    id: str
    form_id: str

    class Config:
        from_attributes = True

class FormBase(BaseModel):
    title: str
    description: Optional[str] = ""
    cover_image: Optional[str] = None
    status: Optional[str] = "draft"
    theme: Optional[str] = "cyber_neon"
    thank_you_title: Optional[str] = "Thank you!"
    thank_you_description: Optional[str] = "Your response has been recorded."

class FormCreate(FormBase):
    questions: Optional[List[QuestionCreate]] = []
    logic_rules: Optional[List[LogicRuleCreate]] = []

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    status: Optional[str] = None
    theme: Optional[str] = None
    thank_you_title: Optional[str] = None
    thank_you_description: Optional[str] = None

class FormOut(FormBase):
    id: str
    share_id: str
    created_at: datetime
    updated_at: datetime
    questions: List[QuestionOut] = []
    logic_rules: List[LogicRuleOut] = []
    response_count: Optional[int] = 0

    class Config:
        from_attributes = True

class QuestionReorderItem(BaseModel):
    id: str
    order_index: int

class AnswerSubmit(BaseModel):
    question_id: str
    answer_value: Optional[str] = ""

class ResponseSubmit(BaseModel):
    answers: List[AnswerSubmit]
    completion_time_seconds: Optional[int] = 0

class AnswerOut(BaseModel):
    id: str
    question_id: str
    answer_value: Optional[str]

    class Config:
        from_attributes = True

class ResponseOut(BaseModel):
    id: str
    form_id: str
    submitted_at: datetime
    completion_time_seconds: int
    answers: List[AnswerOut] = []

    class Config:
        from_attributes = True

class AnalyticsSummary(BaseModel):
    total_responses: int
    completion_rate: float
    avg_completion_time_seconds: float
    question_analytics: List[dict]
