interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on certain errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (
          message.includes('unauthorized') ||
          message.includes('forbidden') ||
          message.includes('not found') ||
          message.includes('bad request')
        ) {
          throw error;
        }
      }

      if (attempt < maxRetries) {
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attempt)
          : retryDelay;

        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('connection')
    );
  }
  return false;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Network errors
    if (isNetworkError(error)) {
      return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    }

    // Auth errors
    const message = error.message.toLowerCase();
    if (message.includes('unauthorized') || message.includes('unauthenticated')) {
      return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    }

    if (message.includes('forbidden')) {
      return 'Bu işlem için yetkiniz yok.';
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Girilen bilgiler geçersiz. Lütfen kontrol edin.';
    }

    // Default to error message
    return error.message;
  }

  return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
}