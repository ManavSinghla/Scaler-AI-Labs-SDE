"""
Typeform 3D Engine - SQLAlchemy ORM Relational Schema Definitions
Defines tables for Forms, Questions, Options, Logic Rules, Responses, and Answers.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid() -> str:
    """Generate a unique UUID string representation for entity IDs."""
    return str(uuid.uuid4())

class Form(Base):
    """
    Form metadata model representing a creator's Typeform entity.
    Stores title, ambient theme configuration, share slug, and thank-you messaging.
    """
    __tablename__ = "forms"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, default="Untitled Form")
    description = Column(Text, nullable=True, default="")
    cover_image = Column(String, nullable=True)
    status = Column(String, default="draft")  # 'draft' or 'published'
    theme = Column(String, default="cyber_neon")  # 'cyber_neon', 'deep_space', 'sunset_glass', 'emerald_dark'
    share_id = Column(String, unique=True, index=True, default=generate_uuid)
    thank_you_title = Column(String, default="Thank you!")
    thank_you_description = Column(Text, default="Your response has been recorded.")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    questions = relationship("Question", back_populates="form", cascade="all, delete-orphan", order_by="Question.order_index")
    logic_rules = relationship("LogicRule", back_populates="form", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="form", cascade="all, delete-orphan")

class Question(Base):
    """
    Individual question entity within a Form.
    Supports 8+ question types (short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating).
    """
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    question_type = Column(String, nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True, default="")
    order_index = Column(Integer, nullable=False, default=0)
    is_required = Column(Boolean, default=False)
    placeholder = Column(String, nullable=True, default="")
    min_val = Column(Integer, nullable=True)
    max_val = Column(Integer, nullable=True)

    # Relationships
    form = relationship("Form", back_populates="questions")
    options = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.order_index")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class QuestionOption(Base):
    """
    Choice options for multiple-choice and dropdown question types.
    """
    __tablename__ = "question_options"

    id = Column(String, primary_key=True, default=generate_uuid)
    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    option_label = Column(String, nullable=False)
    option_value = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False, default=0)

    question = relationship("Question", back_populates="options")

class LogicRule(Base):
    """
    Conditional branching logic rule.
    Directs respondent flow based on question answers (e.g., if answer equals X, jump to Y).
    """
    __tablename__ = "logic_rules"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    source_question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    condition_operator = Column(String, nullable=False)  # 'equals', 'not_equals', 'contains'
    condition_value = Column(String, nullable=False)
    target_question_id = Column(String, nullable=False)  # target question id or 'END'

    form = relationship("Form", back_populates="logic_rules")

class Response(Base):
    """
    Form submission record capturing submission timestamp, completion duration, and user agent.
    """
    __tablename__ = "responses"

    id = Column(String, primary_key=True, default=generate_uuid)
    form_id = Column(String, ForeignKey("forms.id", ondelete="CASCADE"), nullable=False)
    share_id = Column(String, nullable=False)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completion_time_seconds = Column(Integer, default=0)
    user_agent = Column(String, nullable=True)

    form = relationship("Form", back_populates="responses")
    answers = relationship("Answer", back_populates="response", cascade="all, delete-orphan")

class Answer(Base):
    """
    Individual answer item recorded for a specific Question in a Response.
    """
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=generate_uuid)
    response_id = Column(String, ForeignKey("responses.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    answer_value = Column(Text, nullable=True)

    response = relationship("Response", back_populates="answers")
    question = relationship("Question", back_populates="answers")
