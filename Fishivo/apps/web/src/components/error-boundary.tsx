'use client';

import React, { Component, ReactNode } from 'react';
// TODO: @fishivo/shared import'ları kaldırıldı, geçici tip tanımlamaları eklendi
// import { ApiError, ErrorCode, isApiError } from '@fishivo/shared';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

// Geçici tip tanımlamaları
enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_BANNED = 'ACCOUNT_BANNED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  RESOURCE_DELETED = 'RESOURCE_DELETED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

class ApiError extends Error {
  constructor(public code: ErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry or similar service
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // If custom fallback provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const error = this.state.error;
      const isApi = isApiError(error);
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bir hata oluştu</AlertTitle>
              <AlertDescription className="space-y-2">
                <p className="text-sm">
                  {isApi && error instanceof ApiError
                    ? this.getErrorMessage(error.code)
                    : 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.'}
                </p>
                
                {isDevelopment && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-medium">
                      Hata Detayları (Development)
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 dark:bg-gray-800 rounded">
                      {error.stack || error.message}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={this.handleReset} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
              
              <Link href="/" className="flex-1">
                <Button variant="default" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  private getErrorMessage(code: ErrorCode): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.UNAUTHORIZED]: 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.',
      [ErrorCode.FORBIDDEN]: 'Bu sayfaya erişim yetkiniz bulunmuyor.',
      [ErrorCode.NOT_FOUND]: 'Aradığınız sayfa bulunamadı.',
      [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.',
      [ErrorCode.NETWORK_ERROR]: 'İnternet bağlantınızı kontrol edin.',
      [ErrorCode.TIMEOUT]: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
      [ErrorCode.SERVICE_UNAVAILABLE]: 'Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
      [ErrorCode.INTERNAL_SERVER_ERROR]: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
      [ErrorCode.UNKNOWN_ERROR]: 'Beklenmeyen bir hata oluştu.',
      
      // Add other error codes as needed
      [ErrorCode.INVALID_CREDENTIALS]: 'Geçersiz kullanıcı adı veya şifre.',
      [ErrorCode.TOKEN_EXPIRED]: 'Oturum süreniz dolmuş.',
      [ErrorCode.TOKEN_INVALID]: 'Geçersiz oturum.',
      [ErrorCode.SESSION_EXPIRED]: 'Oturum süreniz dolmuş.',
      [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Bu işlem için yetkiniz yok.',
      [ErrorCode.ACCOUNT_SUSPENDED]: 'Hesabınız askıya alındı.',
      [ErrorCode.ACCOUNT_BANNED]: 'Hesabınız yasaklandı.',
      [ErrorCode.VALIDATION_ERROR]: 'Girilen bilgiler hatalı.',
      [ErrorCode.INVALID_INPUT]: 'Geçersiz giriş.',
      [ErrorCode.MISSING_REQUIRED_FIELD]: 'Zorunlu alan eksik.',
      [ErrorCode.INVALID_FORMAT]: 'Geçersiz format.',
      [ErrorCode.ALREADY_EXISTS]: 'Bu kayıt zaten mevcut.',
      [ErrorCode.RESOURCE_LOCKED]: 'Kaynak kilitli.',
      [ErrorCode.RESOURCE_DELETED]: 'Kaynak silinmiş.',
      [ErrorCode.QUOTA_EXCEEDED]: 'Kota aşıldı.',
      [ErrorCode.DATABASE_ERROR]: 'Veritabanı hatası.',
      [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'Dış servis hatası.',
      [ErrorCode.CONNECTION_REFUSED]: 'Bağlantı reddedildi.',
      [ErrorCode.BUSINESS_RULE_VIOLATION]: 'İş kuralı ihlali.',
      [ErrorCode.INSUFFICIENT_BALANCE]: 'Yetersiz bakiye.',
      [ErrorCode.LIMIT_EXCEEDED]: 'Limit aşıldı.',
      [ErrorCode.FILE_TOO_LARGE]: 'Dosya çok büyük.',
      [ErrorCode.INVALID_FILE_TYPE]: 'Geçersiz dosya tipi.',
      [ErrorCode.UPLOAD_FAILED]: 'Yükleme başarısız.',
    };

    return messages[code] || 'Beklenmeyen bir hata oluştu.';
  }
}

/**
 * Hook to use error boundary
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error; // This will be caught by the nearest error boundary
  };
}