'use client';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

type Question = { question: string; options: Record<string, string>; correct_answer: string; reference: string; };
interface QuizResultsProps { questions: Question[]; userAnswers: Record<number, string>; onRestart: () => void; }

export default function QuizResults({ questions, userAnswers, onRestart }: QuizResultsProps) {
  const correctAnswers = questions.reduce((acc, q, i) => (userAnswers[i] === q.correct_answer ? acc + 1 : acc), 0);
  const incorrectAnswers = questions.length - correctAnswers;
  const chartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [{
      data: [correctAnswers, incorrectAnswers],
      backgroundColor: ['#48da7dff', '#e13535ff'],
      hoverBackgroundColor: ['#22c55e', '#ef4444'],
      borderWidth: 1,
    }],
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/export-quiz-pdf/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      if (!response.ok) { throw new Error('PDF generation failed.'); }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF.');
    }
  };

  return (
    <div className="w-full max-w-4xl p-8 mt-10 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6">Quiz Results</h1>
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className="w-full md:w-1/3 max-w-[250px]"><Pie data={chartData} /></div>
        <div className="text-center md:text-left">
          <p className="text-2xl font-bold">Your Score: {((correctAnswers / questions.length) * 100).toFixed(0)}%</p>
          <p className="text-lg text-gray-600">Total Questions: {questions.length}</p>
          <p className="text-lg text-green-500">Correct: {correctAnswers}</p>
          <p className="text-lg text-red-500">Incorrect: {incorrectAnswers}</p>
        </div>
      </div>
      <div className="space-y-6">
        {questions.map((q, i) => {
          const userAnswer = userAnswers[i];
          const isCorrect = userAnswer === q.correct_answer;
          return (
            <div key={i} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-400' : 'border-red-400'}`}>
              <p className="font-semibold">{i + 1}. {q.question}</p>
              <p className={`mt-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>Your answer: {userAnswer ? `${userAnswer}. ${q.options[userAnswer]}` : 'Not answered'}</p>
              {!isCorrect && q.options && (<p className="mt-1 text-green-600">Correct answer: {q.correct_answer}. {q.options[q.correct_answer]}</p>)}
              <blockquote className="mt-3 p-2 bg-gray-100 border-l-4 border-gray-300 text-sm text-gray-700"><strong>Reference:</strong> {q.reference}</blockquote>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-8 flex flex-wrap justify-center gap-4">
        <button onClick={onRestart} className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold">Generate Another Quiz</button>
        <button onClick={handleExportPDF} className="px-6 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 font-semibold">Export as PDF</button>
      </div>
    </div>
  );
}