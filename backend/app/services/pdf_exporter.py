from fpdf import FPDF
import os

ASSETS_PATH = os.path.join(os.path.dirname(__file__), '..', 'assets')
FONT_PATH = os.path.join(ASSETS_PATH, 'DejaVuSans.ttf')

class PDF(FPDF):
    def header(self):
        if 'dejavu' not in self.fonts:
            self.add_font('DejaVu', '', FONT_PATH, uni=True)
            self.add_font('DejaVu', 'B', FONT_PATH, uni=True)
            self.add_font('DejaVu', 'I', FONT_PATH, uni=True)
        self.set_font('DejaVu', 'B', 14)
        self.cell(0, 10, 'AI Trainer Quiz', 0, 1, 'C')
        self.ln(5)
    def footer(self):
        self.set_y(-15)
        self.set_font('DejaVu', '', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def create_quiz_pdf(quiz_data: dict) -> bytes:
    pdf = PDF()
    pdf.add_page()
    if 'questions' not in quiz_data:
        return b''
    for i, q in enumerate(quiz_data['questions']):
        pdf.set_font('DejaVu', 'B', 12)
        pdf.multi_cell(0, 7, f"{i+1}. {q.get('question', 'N/A')}", split_only=True)
        pdf.ln(2)
        pdf.set_font('DejaVu', '', 11)
        options = q.get('options', {})
        for key, value in options.items():
            pdf.multi_cell(0, 7, f"   {key}) {value}", split_only=True)
        pdf.set_font('DejaVu', 'I', 10)
        pdf.multi_cell(0, 7, f"Correct Answer: {q.get('correct_answer', 'N/A')}", split_only=True)
        pdf.ln(2)
        pdf.set_font('DejaVu', '', 9)
        pdf.multi_cell(0, 5, f"Reference: {q.get('reference', 'N/A')}", split_only=True)
        pdf.ln(10)
    return pdf.output()