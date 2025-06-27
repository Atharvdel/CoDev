import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import './App.css';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <HelmetProvider>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              duration: 4000,
              theme: 'dark',
            },
            error: {
              duration: 4000,
              theme: 'dark',
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor/:roomId" element={<EditorPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </HelmetProvider>
  );
}

export default App;
