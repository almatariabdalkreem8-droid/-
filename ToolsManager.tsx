import React, { useState, useEffect, useRef } from 'react';
import { Save, Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import Papa from 'papaparse';
import type { Tool, Brand, Category, Driver } from '../../types';

export default function ToolsManager() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const initialFormState = {
    name: '', version: '', brand_id: '', category_id: '', download_link: '', 
    file_size: '', icon_image: '', short_description: '', long_description: '', required_driver_id: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch('/api/tools').then(res => res.ok ? res.json() : Promise.reject(new Error("API failed"))),
      fetch('/api/brands').then(res => res.ok ? res.json() : Promise.reject(new Error("API failed"))),
      fetch('/api/categories').then(res => res.ok ? res.json() : Promise.reject(new Error("API failed"))),
      fetch('/api/drivers').then(res => res.ok ? res.json() : Promise.reject(new Error("API failed")))
    ]).then(([t, b, c, d]) => {
      setTools(t); setBrands(b); setCategories(c); setDrivers(d);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage('');
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const items = results.data.map((row: any) => ({
            name: row['اسم الأداة/البرنامج'],
            download_link: row['رابط التحميل المباشر'],
            category_name: row['الفئة / الصفحة']
          }));

          const res = await fetch('/api/tools/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          });

          if (!res.ok) throw new Error('فشل الاستيراد');
          
          const data = await res.json();
          setMessage(`تم الاستيراد بنجاح! إدراج: ${data.inserted}، تحديث: ${data.updated}`);
          fetchData();
        } catch (err) {
          setMessage('حدث خطأ أثناء استيراد الملف. تأكد من صيغة الملف.');
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: () => {
        setMessage('حدث خطأ أثناء قراءة ملف CSV.');
        setIsImporting(false);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMessage('');

    try {
      const url = isEditing ? `/api/tools/${editingId}` : '/api/tools';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          brand_id: Number(formData.brand_id),
          category_id: Number(formData.category_id),
          required_driver_id: formData.required_driver_id ? Number(formData.required_driver_id) : null
        })
      });

      if (!res.ok) throw new Error('فشل الحفظ');
      
      setMessage('تم الحفظ بنجاح!');
      resetForm();
      fetchData();
    } catch (err) {
      setMessage('حدث خطأ أثناء الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      await fetch(`/api/tools/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleEdit = (tool: Tool) => {
    setIsEditing(true);
    setEditingId(tool.id);
    setFormData({
      name: tool.name,
      version: tool.version || '',
      brand_id: String(tool.brand_id),
      category_id: String(tool.category_id),
      download_link: tool.download_link || '',
      file_size: tool.file_size || '',
      icon_image: tool.icon_image || '',
      short_description: tool.short_description || '',
      long_description: tool.long_description || '',
      required_driver_id: tool.required_driver_id ? String(tool.required_driver_id) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            {isEditing ? <Edit2 className="w-5 h-5 ml-2 text-indigo-600" /> : <Plus className="w-5 h-5 ml-2 text-indigo-600" />}
            {isEditing ? 'تعديل الأداة' : 'إضافة أداة / روم جديد'}
          </h2>
          <div className="flex items-center gap-4">
            {isEditing && (
              <button onClick={resetForm} className="text-gray-500 hover:text-red-500 flex items-center text-sm font-medium">
                <X className="w-4 h-4 ml-1" /> إلغاء التعديل
              </button>
            )}
            
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
                disabled={isImporting}
              />
              <label 
                htmlFor="csv-upload"
                className={`cursor-pointer inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isImporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                ) : (
                  <Upload className="w-4 h-4 ml-2" />
                )}
                استيراد الأدوات (CSV)
              </label>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('بنجاح') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الأداة</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الإصدار</label>
              <input required type="text" name="version" value={formData.version} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العلامة التجارية</label>
              <select required name="brand_id" value={formData.brand_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                <option value="">اختر العلامة التجارية...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
              <select required name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                <option value="">اختر الفئة...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رابط التحميل</label>
              <input required type="url" name="download_link" value={formData.download_link} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">حجم الملف</label>
              <input required type="text" name="file_size" placeholder="مثال: 50 MB" value={formData.file_size} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">رابط أيقونة الأداة (اختياري)</label>
              <input type="url" name="icon_image" value={formData.icon_image} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" dir="ltr" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">التعريف المطلوب (الآلية الذكية)</label>
              <select name="required_driver_id" value={formData.required_driver_id} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                <option value="">بدون تعريف مطلوب</option>
                {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.brand_name})</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">وصف مختصر</label>
              <input required type="text" name="short_description" value={formData.short_description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">شرح مفصل وخطوات</label>
              <textarea required name="long_description" rows={3} value={formData.long_description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button type="submit" disabled={saving} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 px-8 rounded-lg flex items-center justify-center transition-colors">
              <Save className="w-5 h-5 ml-2" />
              {saving ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'إضافة')}
            </button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">العناصر المضافة ({tools.length})</h2>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الاسم</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">الفئة</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">العلامة</th>
                <th className="px-6 py-3 text-center font-medium text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tools.map(tool => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{tool.name} <span className="text-gray-500 font-normal">({tool.version})</span></td>
                  <td className="px-6 py-4 text-gray-600">{tool.category_name}</td>
                  <td className="px-6 py-4 text-gray-600">{tool.brand_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button onClick={() => handleEdit(tool)} className="text-indigo-600 hover:text-indigo-900 p-2"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(tool.id)} className="text-red-600 hover:text-red-900 p-2"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {tools.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">لا توجد عناصر مضافة حتى الآن.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
