import React, { Component } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-deep-black text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gold mb-4">حدث خطأ غير متوقع</h1>
            <p className="text-gray-300 mb-4">يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="luxury-gold-btn px-6 py-2"
            >
              إعادة تحميل
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;