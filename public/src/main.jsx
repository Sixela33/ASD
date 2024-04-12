import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AlertProvider } from './context/AlertProvider';
import LoadingPage from './LoadingPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <Suspense fallback={<LoadingPage/>}>
          <Routes>
            <Route path="/*" element={<App />}/>
          </Routes>
          </Suspense>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);