import requests
import json
import chromadb
import random
from chromadb.utils import embedding_functions

OLLAMA_API_URL = "http://localhost:11434/api/generate"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
client = chromadb.PersistentClient(path="./chroma_db")
sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=EMBEDDING_MODEL)
collection = client.get_or_create_collection(
    name="quiz_documents_v2",
    embedding_function=sentence_transformer_ef,
    metadata={"hnsw:space": "cosine"}
)

def _call_ollama(context: str, num_questions: int, asked_questions: list[str] = []) -> dict:
    asked_questions_str = "\n".join(f"- {q}" for q in asked_questions)
    prompt = f"""
    You are an expert AI Trainer. Based ONLY on the following context, generate {num_questions} multiple-choice questions.
    DO NOT ask any of the following questions that have already been asked:
    {asked_questions_str}

    Context:
    ---
    {context}
    ---

    Rules for the output:
    1. The questions must be directly answerable from the provided context.
    2. Provide 4 options (A, B, C, D) for each question. The 'options' key MUST be an object.
    3. Specify the correct answer and a "reference" sentence from the context.
    4. Your final output MUST be a single, valid JSON object with a key "questions".
    """
    payload = {"model": "llama3:8b", "prompt": prompt, "stream": False, "format": "json"}
    try:
        print("Sending request to Ollama...")
        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()
        response_text = response.json()['response']
        print("Quiz generated successfully.")
        return json.loads(response_text)
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        raise

def generate_quiz_from_chunks(session_id: str, text_chunks: list[str], num_questions: int) -> dict:
    print(f"Starting session {session_id}. Storing {len(text_chunks)} chunks.")
    chunk_ids = [f"{session_id}_{i}" for i in range(len(text_chunks))]
    collection.delete(where={"session_id": session_id})
    collection.add(
        documents=text_chunks,
        ids=chunk_ids,
        metadatas=[{"session_id": session_id} for _ in text_chunks]
    )
    initial_context = "\n".join(text_chunks[:3])
    return _call_ollama(context=initial_context, num_questions=num_questions)

def generate_more_questions(session_id: str, asked_questions: list[str], num_questions: int) -> dict:
    print(f"Fetching more questions for session {session_id}.")
    all_session_chunks = collection.get(where={"session_id": session_id})
    if not all_session_chunks or not all_session_chunks['documents']:
        raise ValueError("Session ID not found or no documents in session.")
    random_chunk = random.choice(all_session_chunks['documents'])
    relevant_chunks_query = collection.query(
        query_texts=[random_chunk],
        n_results=5,
        where={"session_id": session_id}
    )
    new_context = "\n".join(relevant_chunks_query['documents'][0])
    return _call_ollama(context=new_context, num_questions=num_questions, asked_questions=asked_questions)