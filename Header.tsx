import React from 'react';
import { Cpu, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-indigo-600 p-2.5 rounded-xl group-hover:bg-indigo-700 transition-colors shadow-md">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">مكتبة صيانة الهواتف</h1>
          <p className="text-xs font-medium text-gray-400">أدوات وبرامج احترافية</p>
        </div>
      </Link>
      <div className="hidden sm:flex items-center gap-3">
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <div className="text-sm text-gray-500 font-bold">
          النظام متصل
        </div>
      </div>
    </header>
  );
}
