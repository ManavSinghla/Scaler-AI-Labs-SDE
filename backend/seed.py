from database import Base, engine, SessionLocal
import models
import random
from datetime import datetime, timedelta, timezone

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Form 1: SDE Candidate Tech Survey
        f1 = models.Form(
            title="SDE Candidate Tech Stack & AI Survey 2026",
            description="Help us understand your preferred tech stack, backend frameworks, and AI copilot usage.",
            status="published",
            theme="cyber_neon",
            share_id="sde-survey-2026",
            thank_you_title="Thanks for participating!",
            thank_you_description="Your tech profile has been saved. We appreciate your insights."
        )
        db.add(f1)
        db.flush()

        # Questions for Form 1
        q1_1 = models.Question(
            form_id=f1.id,
            question_type="short_text",
            title="What is your full name?",
            description="Enter your full name as it appears on GitHub or your resume.",
            order_index=0,
            is_required=True,
            placeholder="e.g. Alex Chen"
        )
        db.add(q1_1)

        q1_2 = models.Question(
            form_id=f1.id,
            question_type="email",
            title="What is your primary email address?",
            description="We'll send updates regarding the evaluation.",
            order_index=1,
            is_required=True,
            placeholder="alex.chen@example.com"
        )
        db.add(q1_2)

        q1_3 = models.Question(
            form_id=f1.id,
            question_type="multiple_choice",
            title="What is your primary backend framework of choice?",
            description="Select the framework you feel most confident in.",
            order_index=2,
            is_required=True
        )
        db.add(q1_3)
        db.flush()

        for idx, (lbl, val) in enumerate([("FastAPI (Python)", "fastapi"), ("Next.js / Node.js", "nextjs"), ("Django (Python)", "django"), ("Go / Gin", "go"), ("Spring Boot (Java)", "spring")]):
            db.add(models.QuestionOption(question_id=q1_3.id, option_label=lbl, option_value=val, order_index=idx))

        q1_4 = models.Question(
            form_id=f1.id,
            question_type="rating",
            title="How would you rate your proficiency with Three.js / WebGL?",
            description="1 = Beginner, 5 = Senior Wizard",
            order_index=3,
            is_required=False,
            min_val=1,
            max_val=5
        )
        db.add(q1_4)

        q1_5 = models.Question(
            form_id=f1.id,
            question_type="yes_no",
            title="Do you regularly use AI coding agents (Cursor, Copilot, Antigravity)?",
            description="Yes or No",
            order_index=4,
            is_required=True
        )
        db.add(q1_5)
        db.flush()

        q1_6 = models.Question(
            form_id=f1.id,
            question_type="long_text",
            title="What is the most interesting project you've built recently?",
            description="Tell us about the architecture and key challenges.",
            order_index=5,
            is_required=False,
            placeholder="I built a real-time collaborative canvas with WebSockets..."
        )
        db.add(q1_6)
        db.flush()

        # Logic Rule for Form 1
        rule1 = models.LogicRule(
            form_id=f1.id,
            source_question_id=q1_5.id,
            condition_operator="equals",
            condition_value="Yes",
            target_question_id=q1_6.id
        )
        db.add(rule1)

        # Form 2: Typeform 3D Product Feedback
        f2 = models.Form(
            title="3D Ambient Interface UX Feedback",
            description="Share your thoughts on our new 3D spatial interface & micro-interactions.",
            status="published",
            theme="deep_space",
            share_id="ux-feedback-3d",
            thank_you_title="Feedback Received!",
            thank_you_description="Your response directly shapes our next major release."
        )
        db.add(f2)
        db.flush()

        q2_1 = models.Question(
            form_id=f2.id,
            question_type="rating",
            title="Overall visual satisfaction with the 3D aesthetic?",
            description="Rate from 1 to 5 stars",
            order_index=0,
            is_required=True,
            min_val=1,
            max_val=5
        )
        db.add(q2_1)

        q2_2 = models.Question(
            form_id=f2.id,
            question_type="multiple_choice",
            title="Which feature stood out to you the most?",
            description="Choose your favorite visual element.",
            order_index=1,
            is_required=True
        )
        db.add(q2_2)
        db.flush()

        for idx, (lbl, val) in enumerate([("3D Floating Background Geometry", "3d_bg"), ("Smooth 1-Question Card Depth Transitions", "depth_trans"), ("Keyboard Navigation (Enter / Shortcuts)", "keyboard"), ("Live Split-Screen Drag & Drop Builder", "builder")]):
            db.add(models.QuestionOption(question_id=q2_2.id, option_label=lbl, option_value=val, order_index=idx))

        q2_3 = models.Question(
            form_id=f2.id,
            question_type="dropdown",
            title="What device did you view this application on?",
            description="Select your main platform.",
            order_index=2,
            is_required=False
        )
        db.add(q2_3)
        db.flush()

        for idx, (lbl, val) in enumerate([("MacBook Pro / macOS", "mac"), ("Windows Desktop / Laptop", "windows"), ("Linux Workstation", "linux"), ("iPad / Tablet", "tablet"), ("Mobile Phone", "mobile")]):
            db.add(models.QuestionOption(question_id=q2_3.id, option_label=lbl, option_value=val, order_index=idx))

        q2_4 = models.Question(
            form_id=f2.id,
            question_type="long_text",
            title="Any feature requests or improvements?",
            description="We read every single comment.",
            order_index=3,
            is_required=False,
            placeholder="It would be awesome to support custom 3D shader imports!"
        )
        db.add(q2_4)

        db.commit()

        # Seed Responses for Form 1
        sample_names = ["Sarah Jenkins", "Marcus Vance", "Elena Rostova", "Devon Lee", "Priya Sharma", "Lucas Meyer", "Aria Vance", "Carlos Mendez"]
        sample_frameworks = ["FastAPI (Python)", "Next.js / Node.js", "FastAPI (Python)", "Go / Gin", "Next.js / Node.js", "Django (Python)", "FastAPI (Python)", "Spring Boot (Java)"]
        sample_projects = [
            "Built a distributed event-driven microservices architecture handling 50k req/sec.",
            "Created a 3D procedural shader playground using WebGL & React Three Fiber.",
            "Designed a real-time collaborative document editor with Operational Transformation.",
            "Developed an AI autonomous coding assistant sidecar for IDEs.",
            "Engineered a high-speed vector search DB wrapper in Rust.",
            "Formulated a graph visualization engine with D3.js and Three.js.",
            "Implemented an end-to-end Typeform clone with FastAPI & SQLite.",
            "Built an automated CI/CD pipeline generator for Kubernetes clusters."
        ]

        for i in range(8):
            resp_dt = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48), minutes=random.randint(5, 50))
            comp_time = random.randint(35, 120)
            r = models.Response(
                form_id=f1.id,
                share_id=f1.share_id,
                submitted_at=resp_dt,
                completion_time_seconds=comp_time,
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0"
            )
            db.add(r)
            db.flush()

            name = sample_names[i]
            email = f"{name.lower().replace(' ', '.')}@devmail.io"
            fw = sample_frameworks[i]
            rating = str(random.randint(3, 5))
            ai_use = "Yes" if i % 4 != 3 else "No"
            proj = sample_projects[i]

            db.add(models.Answer(response_id=r.id, question_id=q1_1.id, answer_value=name))
            db.add(models.Answer(response_id=r.id, question_id=q1_2.id, answer_value=email))
            db.add(models.Answer(response_id=r.id, question_id=q1_3.id, answer_value=fw))
            db.add(models.Answer(response_id=r.id, question_id=q1_4.id, answer_value=rating))
            db.add(models.Answer(response_id=r.id, question_id=q1_5.id, answer_value=ai_use))
            db.add(models.Answer(response_id=r.id, question_id=q1_6.id, answer_value=proj))

        # Seed Responses for Form 2
        for i in range(5):
            resp_dt = datetime.now(timezone.utc) - timedelta(hours=random.randint(2, 24))
            r = models.Response(
                form_id=f2.id,
                share_id=f2.share_id,
                submitted_at=resp_dt,
                completion_time_seconds=random.randint(25, 80),
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
            )
            db.add(r)
            db.flush()

            rating = str(random.choice([4, 5, 5, 4, 5]))
            feat = random.choice(["3D Floating Background Geometry", "Smooth 1-Question Card Depth Transitions", "Keyboard Navigation (Enter / Shortcuts)"])
            dev = random.choice(["MacBook Pro / macOS", "Windows Desktop / Laptop"])
            fb = "The glassmorphism card depth transitions feel incredibly smooth and responsive!"

            db.add(models.Answer(response_id=r.id, question_id=q2_1.id, answer_value=rating))
            db.add(models.Answer(response_id=r.id, question_id=q2_2.id, answer_value=feat))
            db.add(models.Answer(response_id=r.id, question_id=q2_3.id, answer_value=dev))
            db.add(models.Answer(response_id=r.id, question_id=q2_4.id, answer_value=fb))

        db.commit()
        print("Database successfully seeded with realistic sample forms, questions, logic rules, and responses!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
