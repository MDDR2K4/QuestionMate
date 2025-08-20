'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import QuizInterface from './QuizInterface';
import LoadingAnimation from './LoadingAnimation';
import { UploadCloud } from 'lucide-react';
import robotAnimationData from '../../public/robot-animation.json';

type Question = { question: string; options: Record<string, string>; correct_answer: string; reference: string; };
type Quiz = { questions: Question[]; };

export default function QuizGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setQuizData(null);
      setError(null);
      setSessionId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) { setError('Please select a file first.'); return; }
    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setSessionId(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://127.0.0.1:8000/start-quiz-session/', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
      }
      const data = await response.json();
      setSessionId(data.session_id);
      setQuizData(data.quiz);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setQuizData(null);
    setFile(null);
    setSessionId(null);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full max-w-5xl mt-10">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" variants={containerVariants} initial="hidden" animate="visible" exit="exit"><LoadingAnimation /></motion.div>
        ) : quizData && sessionId ? (
          <motion.div key="quiz" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <QuizInterface quizData={quizData} sessionId={sessionId} onRestart={handleRestart} setQuizData={setQuizData} />
          </motion.div>
        ) : (
          <motion.div key="form" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="grid md:grid-cols-3 gap-12 items-center">
            <div className="md:col-span-1 hidden md:flex justify-center">
              <Lottie animationData={robotAnimationData} loop={true} style={{ width: '100%', maxWidth: '300px' }} />
            </div>
            <div className="md:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="flex flex-col items-center justify-center w-full">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500 text-center"><span className="font-semibold">Click to upload</span><br/>or drag and drop</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.png,.jpg,.jpeg" />
                  </label>
                  {file && <p className="mt-4 text-sm text-gray-600">Selected: <span className="font-semibold">{file.name}</span></p>}
                </div>
                <button type="submit" disabled={isLoading || !file} className="w-full mt-6 px-4 py-3 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">Generate Quiz</button>
              </form>
              {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}