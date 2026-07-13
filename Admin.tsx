import React, { useState } from 'react';
import ToolsManager from '../components/admin/ToolsManager';
import BrandsManager from '../components/admin/BrandsManager';
import DriversManager from '../components/admin/DriversManager';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'tools' | 'brands' | 'drivers'>('tools');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 ${activeTab === 'tools' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          إدارة الأدوات والرومات
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 ${activeTab === 'brands' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          إدارة الشركات
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`pb-4 px-2 font-medium text-lg transition-colors border-b-2 ${activeTab === 'drivers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          إدارة التعريفات الذكية
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {activeTab === 'tools' && <ToolsManager />}
        {activeTab === 'brands' && <BrandsManager />}
        {activeTab === 'drivers' && <DriversManager />}
      </div>
    </div>
  );
}
