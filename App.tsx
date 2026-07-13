import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Catalog from './pages/Catalog';
import ToolDetail from './pages/ToolDetail';
import Admin from './pages/Admin';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans" dir="rtl">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/tool/:id" element={<ToolDetail />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
