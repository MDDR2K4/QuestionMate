'use client';
import { useState } from 'react';
import Lottie from 'lottie-react';
import QuizResults from './QuizResults';
import robotAnimationData from '../../public/robot-animation.json';

type Question = { question: string; options: Record<string, string>; correct_answer: string; reference: string; };
type Quiz = { questions: Question[]; };
interface QuizInterfaceProps { quizData: Quiz; sessionId: string; onRestart: () => void; setQuizData: (quiz: Quiz) => void; }

export default function QuizInterface({ quizData, sessionId, onRestart, setQuizData }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="text-center p-8"><p>The AI could not generate a quiz. Please try another file.</p><button onClick={onRestart} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Try Again</button></div>
    );
  }
  const currentQuestion = quizData.questions[currentQuestionIndex];
  if (!currentQuestion) {
    setShowResults(true);
    return <QuizResults questions={quizData.questions} userAnswers={userAnswers} onRestart={onRestart} />;
  }

  const handleOptionSelect = (optionKey: string) => {
    setSelectedOption(optionKey);
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: optionKey });
  };

  const fetchMoreQuestions = async () => {
    setIsFetchingMore(true);
    try {
      const askedQuestions = quizData.questions.map(q => q.question);
      const response = await fetch(`http://127.0.0.1:8000/quiz-session/${sessionId}/next-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asked_questions: askedQuestions }),
      });
      if (!response.ok) throw new Error('Failed to fetch more questions.');
      const newQuizData = await response.json();
      if (newQuizData.questions && newQuizData.questions.length > 0) {
        setQuizData({ questions: [...quizData.questions, ...newQuizData.questions] });
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setShowResults(true);
      }
    } catch (error) {
      console.error(error);
      setShowResults(true);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      fetchMoreQuestions();
    }
  };

  if (showResults) {
    return <QuizResults questions={quizData.questions} userAnswers={userAnswers} onRestart={onRestart} />;
  }

  const isLastQuestionOfBatch = currentQuestionIndex === quizData.questions.length - 1;
  const isQuestionBroken = !currentQuestion.options || typeof currentQuestion.options !== 'object';

  return (
    <div className="grid md:grid-cols-3 gap-12 items-start w-full">
      <div className="md:col-span-1 hidden md:flex justify-center items-start pt-10">
        <Lottie animationData={robotAnimationData} loop={true} style={{ width: '100%', maxWidth: '300px' }} />
      </div>
      <div className="md:col-span-2 w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-gray-900">
        <div className="mb-4">
          <p className="text-lg font-semibold">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
          <h2 className="text-2xl mt-2">{currentQuestion.question || 'Question text is missing.'}</h2>
        </div>
        <div className="space-y-4">
          {isQuestionBroken ? (<p className="text-red-500">Options for this question are missing or invalid.</p>) : (
            Object.entries(currentQuestion.options).map(([key, value]) => (
              <button key={key} onClick={() => handleOptionSelect(key)} className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${selectedOption === key ? 'bg-blue-100 border-blue-500' : 'bg-white hover:bg-gray-50 border-gray-300'}`}>
                <span className="font-bold mr-2">{key}:</span> {value}
              </button>
            ))
          )}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button onClick={() => setShowResults(true)} className="w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 font-semibold">Finish Quiz</button>
          <button onClick={handleNextQuestion} disabled={(isFetchingMore || !selectedOption) && !isQuestionBroken} className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400">
            {isFetchingMore ? 'Loading...' : isLastQuestionOfBatch ? 'Get More Questions' : isQuestionBroken ? 'Skip Question' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}