import React, { createContext, useState, useContext } from 'react';
import ErrorMessage from './Error';
import type { ToastStatus } from './Error';
import type { ReactNode } from 'react';

// 1. Define what functions are available globally
interface ToastContextType {
  showToast: (message: string, status?: ToastStatus) => void;
}

// 2. Create context with an undefined default (enforces proper usage later)
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 3. Define props for the Provider wrapper
interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  // Use our strict ToastStatus type for state
  const [status, setStatus] = useState<ToastStatus>('idle');
  const [message, setMessage] = useState<string>('');

  // The function exposed to the app. We default the status to 'error'.
  const showToast = (newMessage: string, newStatus: ToastStatus = 'error') => {
    setMessage(newMessage);
    setStatus(newStatus);
  };

  const hideToast = () => {
    setStatus('idle');
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ErrorMessage 
        errorType={status} 
        errorMessage={message} 
        onAnimationEnd={hideToast} 
      />
    </ToastContext.Provider>
  );
}

// 4. Custom Hook with built-in safety check
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};