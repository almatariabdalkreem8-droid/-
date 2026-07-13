import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import type { Brand } from '../../types';

export default function BrandsManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = () => {
    fetch('/api/brands').then(res => res.ok ? res.json() : Promise.reject(new Error("API failed"))).then(setBrands);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('فشل الحفظ');
      setMessage('تمت الإضافة بنجاح');
      setName('');
      fetchBrands();
    } catch (err) {
      setMessage('حدث خطأ أثناء الإضافة.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟ قد يؤدي هذا لتعطل الأدوات المرتبطة بهذه الشركة.')) return;
    try {
      await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      fetchBrands();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
          <Plus className="w-5 h-5 ml-2 text-indigo-600" /> إضافة شركة جديدة
        </h2>
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('بنجاح') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشركة (Brand)</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="مثال: Samsung, Xiaomi..." />
          </div>
          <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 px-8 rounded-lg transition-colors">
            {saving ? 'جاري الحفظ...' : 'إضافة'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">الشركات المضافة ({brands.length})</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الاسم</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500 w-32">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{brand.name}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDelete(brand.id)} className="text-red-600 hover:text-red-900 p-2"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
