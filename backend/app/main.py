import io
import uuid
import traceback
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

from app.services.file_processor import extract_text_from_file, chunk_text
from app.services.quiz_generator import generate_quiz_from_chunks, generate_more_questions
from app.services.pdf_exporter import create_quiz_pdf
from app.database import SessionLocal
from app import models, schemas, security

class NextQuestionsRequest(BaseModel):
    asked_questions: list[str] = []

app = FastAPI(title="QuestionMate API")
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the QuestionMate API!"}

@app.post("/users/signup", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/users/login", response_model=schemas.Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    access_token = security.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/start-quiz-session/")
async def start_quiz_session(file: UploadFile = File(...)):
    try:
        session_id = str(uuid.uuid4())
        file_contents = await file.read()
        file_stream = io.BytesIO(file_contents)
        extracted_text = extract_text_from_file(file_stream, file.content_type)
        if not extracted_text or extracted_text.isspace():
            raise HTTPException(status_code=400, detail="Could not extract text.")
        text_chunks = chunk_text(extracted_text)
        if not text_chunks:
            raise HTTPException(status_code=400, detail="Text was too short to be chunked.")
        initial_quiz = generate_quiz_from_chunks(session_id=session_id, text_chunks=text_chunks, num_questions=5)
        return {"session_id": session_id, "quiz": initial_quiz}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/quiz-session/{session_id}/next-questions")
async def get_next_questions(session_id: str, request: NextQuestionsRequest):
    try:
        new_quiz = generate_more_questions(session_id=session_id, asked_questions=request.asked_questions, num_questions=5)
        return new_quiz
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/export-quiz-pdf/")
async def export_quiz_pdf(quiz_data: dict):
    try:
        pdf_bytes = create_quiz_pdf(quiz_data)
        if not pdf_bytes:
            raise HTTPException(status_code=400, detail="Invalid quiz data provided.")
        return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": "attachment;filename=quiz.pdf"})
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")