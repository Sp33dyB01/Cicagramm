
export interface OperationResult<T = any> {
  data: T | null;
  error: any | null;
}

async function retryOperation<T>(
  operation: () => Promise<OperationResult<T>>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<OperationResult<T>> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await operation();

      if (result?.error) {
        throw result.error;
      }

      return result; // Success!
    } catch (err) {
      console.warn(`Attempt ${i + 1} failed:`, err);

      if (i === maxRetries - 1) {
        return { data: null, error: err };
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return { data: null, error: new Error('Unknown error') };
}
export default retryOperation;