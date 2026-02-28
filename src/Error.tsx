import './Error.css';
export type ToastStatus = 'idle' | 'error' | 'success' | 'warning';

// 2. Define the props the component expects
interface ErrorMessageProps {
  errorType: ToastStatus;
  errorMessage: string;
  onAnimationEnd: () => void;
}
const alertStyles: { [key: string]: any } = {
  error: 'bg-rose-100 text-rose-800 border-rose-500 dark:bg-rose-950/85 dark:text-rose-400 dark:border-rose-800',
  success: 'bg-green-100 text-green-800 border-green-500 dark:bg-green-950/85 dark:text-green-400 dark:border-green-800',
  warning: 'bg-amber-100 text-amber-800 border-amber-500 dark:bg-amber-950/85 dark:text-amber-400 dark:border-amber-800',
};

export default function Error({ errorType, errorMessage, onAnimationEnd }: ErrorMessageProps) {
  // 1. Temporarily set the default state to 'error' so it shows up immediately on refresh
  if (errorType === 'idle') return null;
  return (
    <div>
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 p-4 border-2 rounded shadow-lg z-50 ${alertStyles[errorType]} lemegy`} onAnimationEnd={onAnimationEnd}>
        <p className="text-sm opacity-90">{errorMessage}</p>
      </div>
    </div>
  );
}