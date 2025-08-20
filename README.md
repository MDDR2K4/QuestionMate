# QuestionMate - AI-Powered Study Assistant

![QuestionMate Demo](https://via.placeholder.com/800x400.png?text=Add+a+GIF+or+Screenshot+of+Your+App+Here)

**QuestionMate** is a full-stack AI web application designed to be the ultimate study partner for students. It transforms any study material—be it a PDF textbook, a Word document, or even an image of lecture notes—into an interactive and continuous quiz session, helping users master their content through active recall.

---

## ✨ Key Features

*   **Secure User Authentication**: Full signup and login functionality with secure password hashing and JWT-based sessions.
*   **Multi-Format Document Upload**: Accepts `.pdf`, `.docx`, and image files (`.png`, `.jpg`) for maximum flexibility.
*   **Advanced RAG Pipeline**: Utilizes a Retrieval-Augmented Generation (RAG) architecture with a local vector database (ChromaDB) to understand the context of the *entire* document.
*   **Continuous Quiz Mode**: Generates questions in batches, allowing users to request more questions on-demand for extended, dynamic study sessions.
*   **Interactive & Animated UI**: A polished, two-column interface featuring a friendly robot mascot, built with Next.js and animated with Framer Motion and Lottie.
*   **Detailed Performance Review**: A comprehensive results page with a visual pie chart and a question-by-question breakdown, including AI-generated references from the source material.
*   **Export to PDF**: Allows users to download their completed quiz for offline study and review.

---

## 🛠️ Technology Stack

This project is built with a modern, robust technology stack, running entirely on a local machine.

| Area | Technology |
| :--- | :--- |
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI, Python |
| **AI Engine** | Ollama (running Llama 3) |
| **Vector DB** | ChromaDB |
| **Database** | PostgreSQL (managed by Docker) |
| **Authentication** | JWT (JSON Web Tokens), Passlib |
| **File Processing** | PyPDF, python-docx, Pytesseract (OCR) |

---

## 🚀 Getting Started

To run this project locally, you will need Python, Node.js, Docker, and Ollama installed.

### 1. Clone the Repository

```bash
git clone https://github.com/MDDR2K4/QuestionMate.git
cd QuestionMate


2. Backend Setup
code
Bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create a .env file and add your Supabase keys
# (Note: Supabase is used for file storage in this version)
3. Frontend Setup
code
Bash
# Navigate to the frontend directory
cd frontend

# Install JavaScript dependencies
npm install
4. Running the Application
You will need to start all services in separate terminals:
Start the Database:
code
Bash
# From the root directory
docker-compose up -d
Start the AI Model:
code
Bash
ollama run llama3:8b
Start the Backend Server:
code
Bash
# From the backend directory, with .venv active
uvicorn app.main:app --reload
Start the Frontend Server:
code
Bash
# From the frontend directory
npm run dev
Access the application at http://localhost:3000.

📸 Screenshots
(This is where you should add more screenshots of your application)
Login Page:
![alt text](https://via.placeholder.com/400x250.png?text=Add+Login+Page+Screenshot)
Quiz Interface:
![alt text](https://via.placeholder.com/400x250.png?text=Add+Quiz+Page+Screenshot)
Results Page:
![alt text](https://via.placeholder.com/400x250.png?text=Add+Results+Page+Screenshot)