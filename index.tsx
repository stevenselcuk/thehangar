import * as Sentry from '@sentry/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App.tsx';
import ErrorBoundary from './src/components/ErrorBoundary.tsx';
import './src/styles.css';
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

Sentry.init({
  dsn: 'https://530027018ecd84767a35b73a9427f390@o4509418930831360.ingest.de.sentry.io/4510725964103760',
  sendDefaultPii: true,
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
