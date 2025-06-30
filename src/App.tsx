import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthContainer } from './components/auth/AuthContainer';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <div className="App">
            <AuthContainer />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
                success: {
                  style: {
                    background: '#059669',
                    color: '#fff',
                  },
                },
                error: {
                  style: {
                    background: '#DC2626',
                    color: '#fff',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;