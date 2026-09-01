import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ORCA Application Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070e1a] text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#0b1420] border-2 border-red-500/80 p-8 rounded-2xl max-w-lg shadow-2xl space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-bounce" />
            <h1 className="text-xl font-extrabold text-white uppercase tracking-wider">
              ORCA SYSTEM RECOVERY ACTIVE
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-5 py-2.5 bg-[#122438] hover:bg-[#1a304a] text-slate-200 border border-[#203754] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition"
              >
                <Home className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
