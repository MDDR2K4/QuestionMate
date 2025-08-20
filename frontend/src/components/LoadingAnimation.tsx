'use client';
import Lottie from 'lottie-react';
import animationData from '../../public/loading-animation.json';

export default function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-64 h-64">
        <Lottie animationData={animationData} loop={true} />
      </div>
      <p className="text-lg text-gray-600 -mt-8">
        Your AI trainer is thinking...
      </p>
    </div>
  );
}