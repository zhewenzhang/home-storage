import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button, Card } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-8">
          <div className="text-center max-w-md">
            <Card className="text-center !p-8">
              <div className="w-16 h-16 mx-auto mb-6 border-2 border-swiss-red flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-swiss-red" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-wider text-black dark:text-white mb-2">出現了一些問題</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                HomeBox 遇到了一個意外錯誤
              </p>
              {this.state.error && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mb-6 font-mono bg-gray-100 dark:bg-gray-900 border-2 border-black dark:border-white p-3 text-left break-all">
                  {this.state.error.message}
                </div>
              )}
              <Button onClick={() => window.location.reload()} variant="primary" className="mx-auto">
                <RefreshCw className="w-4 h-4" />
                重新載入
              </Button>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
