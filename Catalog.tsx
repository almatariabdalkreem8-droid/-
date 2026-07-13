import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, ChevronLeft, Wrench, Heart, Layers, Monitor, HardDrive } from 'lucide-react';
import type { Tool, Category } from '../types';
import { useFavorites } from '../hooks/useFavorites';

export default function Catalog() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [mainTab, setMainTab] = useState<'programs' | 'tools'>('programs');
  const [loading, setLoading] = useState(true);
  const { favorites, isFavorite } = useFavorites();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [toolsRes, catRes] = await Promise.all([
        fetch('/api/tools'),
        fetch('/api/categories')
      ]);
      if (!toolsRes.ok || !catRes.ok) throw new Error("API failed");
      const toolsData = await toolsRes.json();
      const catData = await catRes.json();
      setTools(toolsData);
      setCategories(catData);
      
      const programsCat = catData.find((c: any) => c.name === 'البرامج');
      if (programsCat) {
        setSelectedCategory(programsCat.id);
      }
    } catch (err) {
      console.error('Failed to load catalog data', err);
    } finally {
      setLoading(false);
    }
  };

  const programsCategory = categories.find(c => c.name === 'البرامج');
  const isProgramsTab = mainTab === 'programs';
  
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || 
                          tool.short_description.includes(search);
                          
    const matchesFavorites = showFavorites ? isFavorite(tool.id) : true;
    
    // Split logic
    let matchesMainTab = false;
    if (isProgramsTab) {
      matchesMainTab = programsCategory ? tool.category_id === programsCategory.id : false;
    } else {
      matchesMainTab = programsCategory ? tool.category_id !== programsCategory.id : true;
    }
    
    // For Tools tab, allow category filtering
    let matchesCategory = true;
    if (!isProgramsTab && selectedCategory !== null && (!programsCategory || selectedCategory !== programsCategory.id)) {
       matchesCategory = tool.category_id === selectedCategory;
    }

    return matchesSearch && matchesFavorites && matchesMainTab && matchesCategory;
  });
  
  const handleTabChange = (tab: 'programs' | 'tools') => {
    setMainTab(tab);
    setShowFavorites(false);
    if (tab === 'programs') {
      if (programsCategory) setSelectedCategory(programsCategory.id);
    } else {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Main Tabs */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex inline-flex w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('programs')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
              isProgramsTab ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Monitor className="w-5 h-5" />
            البرامج
          </button>
          <button
            onClick={() => handleTabChange('tools')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
              !isProgramsTab ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-5 h-5" />
            الأدوات والملفات
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-shadow"
            placeholder="ابحث هنا..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
              showFavorites ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
            المفضلة
          </button>
          
          {!isProgramsTab && (
            <>
              <div className="w-px h-8 bg-gray-200 mx-1 self-center"></div>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === null && !showFavorites ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل
              </button>
              {categories.filter(c => c.name !== 'البرامج').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setShowFavorites(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id && !showFavorites ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map(tool => (
            <Link key={tool.id} to={`/tool/${tool.id}`} className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 relative transform hover:-translate-y-1">
              {isFavorite(tool.id) && (
                <div className="absolute top-4 left-4 text-red-500 z-10 bg-white p-1.5 rounded-full shadow-sm" title="في المفضلة">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col items-center text-center">
                {tool.icon_image ? (
                  <div className="w-20 h-20 mb-5 bg-gray-50 rounded-2xl flex items-center justify-center p-3 shadow-inner group-hover:scale-105 transition-transform">
                    <img src={tool.icon_image} alt={tool.name} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-20 h-20 mb-5 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    {isProgramsTab ? <Monitor className="w-10 h-10 text-indigo-500" /> : <Wrench className="w-10 h-10 text-indigo-500" />}
                  </div>
                )}
                
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">{tool.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{tool.version}</span>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><HardDrive className="w-3 h-3"/>{tool.file_size}</span>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{tool.short_description}</p>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100 group-hover:bg-indigo-50 transition-colors">
                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-700">{tool.brand_name}</span>
                <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </Link>
          ))}
          
          {filteredTools.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center">
              <Layers className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-500 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-400">جرب تغيير كلمات البحث أو التصنيف</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
