import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import type { Driver, Brand } from '../../types';

export default function DriversManager() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [formData, setFormData] = useState({
    name: '', version: '', brand_id: '', download_link: '', silent_install_switch: ''
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/drivers').then(res => res.ok ? res.json() : Promise.reject(new Error("API failed"))),
      fetch('/api/brands').then(res => res.ok ? res.json() : Promise.reject(new Error("API failed")))
    ]).then(([d, b]) => {
      setDrivers(d); setBrands(b);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          brand_id: Number(formData.brand_id)
        })
      });
      if (!res.ok) throw new Error('فشل الحفظ');
      setMessage('تمت الإضافة بنجاح');
      setFormData({ name: '', version: '', brand_id: '', download_link: '', silent_install_switch: '' });
      fetchData();
    } catch (err) {
      setMessage('حدث خطأ أثناء الإضافة.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟ قد يؤدي لتعطل الأدوات المرتبطة بهذا التعريف.')) return;
    try {
      await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
          <Plus className="w-5 h-5 ml-2 text-indigo-600" /> إضافة تعريف جديد
        </h2>
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('بنجاح') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم التعريف</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الإصدار</label>
              <input required type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العلامة التجارية المرتبطة</label>
              <select required value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                <option value="">اختر العلامة التجارية...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة سر التثبيت الصامت (اختياري)</label>
              <input type="text" value={formData.silent_install_switch} onChange={e => setFormData({...formData, silent_install_switch: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="مثال: /S أو /quiet" dir="ltr" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">رابط التحميل المباشر</label>
              <input required type="url" value={formData.download_link} onChange={e => setFormData({...formData, download_link: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" dir="ltr" />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 px-8 rounded-lg transition-colors">
              {saving ? 'جاري الحفظ...' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">التعريفات المضافة ({drivers.length})</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الاسم</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">العلامة</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">مفتاح الصامت</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {drivers.map(driver => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{driver.name} <span className="text-gray-500 font-normal">({driver.version})</span></td>
                  <td className="px-6 py-4 text-gray-600">{driver.brand_name}</td>
                  <td className="px-6 py-4 text-gray-500" dir="ltr">{driver.silent_install_switch}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleDelete(driver.id)} className="text-red-600 hover:text-red-900 p-2"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">لا توجد تعريفات مضافة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
