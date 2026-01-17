import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public handleReboot = () => {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('the_hangar_save')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Could not clear localStorage:', e);
    }
    window.location.reload();
  };

  // FIX: Changed `render` from an arrow function to a standard class method to ensure the correct `this` context for `this.props` as handled by React's class component lifecycle.
  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center text-red-500 bg-black">
          <h1 className="text-6xl font-black mb-8 tracking-tighter">FATAL EXCEPTION</h1>
          <p className="text-xs uppercase mb-12 tracking-[0.5em] opacity-50">
            The simulation has become unstable.
          </p>
          <p className="text-sm mb-4">
            A critical error has occurred. Please try rebooting. Your save data may be corrupted.
          </p>
          <button
            onClick={this.handleReboot}
            className="px-10 py-5 border-2 border-red-600 font-bold hover:bg-red-600 hover:text-white transition-all"
          >
            REBOOT
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
