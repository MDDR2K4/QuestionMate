'use client';
import QuizGenerator from '@/components/QuizGenerator';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 w-full">
      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <div className="text-center mb-10">
            <h1 className="text-5xl font-extrabold text-gray-800">
              Welcome to <span className="text-blue-600">QuestionMate</span>
            </h1>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your study material, and our AI will craft a personalized quiz to help you master the content.
            </p>
          </div>
          <QuizGenerator />
        </>
      ) : (
        <div className="text-center bg-white p-10 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold">Welcome to QuestionMate</h1>
          <p className="mt-4 text-lg text-gray-600">
            Please{' '}
            <Link href="/auth" className="text-blue-500 hover:underline">
              login or sign up
            </Link>{' '}
            to start generating quizzes.
          </p>
        </div>
      )}
    </div>
  );
}