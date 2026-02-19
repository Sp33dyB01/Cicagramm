import { useState } from 'react';
import './Error.css';
export type ToastStatus = 'idle' | 'error' | 'success' | 'warning';

// 2. Define the props the component expects
interface ErrorMessageProps {
  errorType: ToastStatus;
  errorMessage: string;
  onAnimationEnd: () => void;
}
const alertStyles: { [key: string]: any } = {
  error: 'bg-red-100 text-red-800 border-red-500',
  success: 'bg-green-100 text-green-800 border-green-500',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-500',
};

export default function Error({errorType, errorMessage, onAnimationEnd}: ErrorMessageProps) {
  // 1. Temporarily set the default state to 'error' so it shows up immediately on refresh
  if (errorType === 'idle') return null;
  return (
    <div>
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 p-4 border-2 rounded shadow-lg z-50 ${alertStyles[errorType]} lemegy`} onAnimationEnd={onAnimationEnd}>
        <p className="font-bold capitalize">{errorType}</p>
        <p className="text-sm opacity-90">{errorMessage}</p>
      </div>
    </div>
  );
}