import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './utils/themeProvider';

// Add this to suppress React Router warnings (works across all React Router versions)
// We'll create a custom handler for the specific warnings we want to silence
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
  // Check if this is a React Router future flag warning
  const warningMsg = args[0] || '';
  if (typeof warningMsg === 'string' && 
      (warningMsg.includes('React Router Future Flag Warning') || 
       warningMsg.includes('v7_startTransition') || 
       warningMsg.includes('v7_relativeSplatPath'))) {
    // Suppress these specific warnings
    return;
  }
  // Pass through all other warnings
  originalConsoleWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
