import io
from uuid import uuid4
from pypdf import PdfReader
from docx import Document
from PIL import Image
import pytesseract
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.supabase_client import supabase

BUCKET_NAME = "documents"

def upload_to_storage(file_stream: io.BytesIO, file_name: str, content_type: str) -> str:
    try:
        file_path = f"uploads/{uuid4()}/{file_name}"
        file_stream.seek(0)
        supabase.storage.from_(BUCKET_NAME).upload(
            file=file_stream.read(),
            path=file_path,
            file_options={"content-type": content_type}
        )
        return supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)
    except Exception as e:
        print(f"Error uploading to Supabase: {e}")
        raise

def _process_pdf(stream: io.BytesIO) -> str:
    stream.seek(0)
    reader = PdfReader(stream)
    return "".join(page.extract_text() for page in reader.pages)

def _process_docx(stream: io.BytesIO) -> str:
    stream.seek(0)
    doc = Document(stream)
    return "\n".join(para.text for para in doc.paragraphs)

def _process_image(stream: io.BytesIO) -> str:
    stream.seek(0)
    image = Image.open(stream)
    try:
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    except Exception:
        pass
    return pytesseract.image_to_string(image)

def extract_text_from_file(file_stream: io.BytesIO, content_type: str) -> str:
    processors = {
        "application/pdf": _process_pdf,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": _process_docx,
        "image/png": _process_image,
        "image/jpeg": _process_image,
    }
    processor = processors.get(content_type)
    if not processor:
        raise ValueError(f"Unsupported file type: {content_type}")
    return processor(file_stream)

def chunk_text(text: str) -> list[str]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_text(text)
    return [chunk for chunk in chunks if len(chunk.strip()) > 10]