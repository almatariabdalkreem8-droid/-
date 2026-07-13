import React from 'react';
import { Settings, LayoutGrid, Cpu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 bg-white border-l border-gray-100 hidden md:flex flex-col shadow-sm z-0">
      <nav className="flex-1 p-6 space-y-3 mt-4">
        <Link 
          to="/" 
          className={`flex items-center px-4 py-3.5 rounded-xl transition-all ${location.pathname === '/' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
        >
          <LayoutGrid className="w-5 h-5 ml-3" />
          <span className="font-bold text-sm">تصفح الكتالوج</span>
        </Link>
        <Link 
          to="/admin" 
          className={`flex items-center px-4 py-3.5 rounded-xl transition-all ${location.pathname === '/admin' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
        >
          <Settings className="w-5 h-5 ml-3" />
          <span className="font-bold text-sm">إدارة المحتوى</span>
        </Link>
      </nav>
      
      <div className="p-6">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-center flex-col text-center">
           <Cpu className="w-8 h-8 text-indigo-500 mb-2" />
           <p className="text-xs font-bold text-indigo-800">بيئة صيانة متكاملة</p>
           <p className="text-[10px] text-indigo-600 mt-1">نسخة 1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
