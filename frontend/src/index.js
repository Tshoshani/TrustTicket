import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { applyTheme, getSavedTheme, watchSystemTheme } from './utils/theme';

// Apply the saved theme before the app renders to avoid a flash of the wrong theme.
applyTheme(getSavedTheme());
watchSystemTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
