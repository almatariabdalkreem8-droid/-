import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Download, AlertTriangle, ShieldCheck, Wrench, HardDrive, Bot, Heart } from 'lucide-react';
import type { Tool, Driver } from '../types';
import AIAssistant from '../components/AIAssistant';
import { useFavorites } from '../hooks/useFavorites';

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  
  // Simulated smart check state
  const [showDriverWarning, setShowDriverWarning] = useState(false);
  const [isDriverInstalled, setIsDriverInstalled] = useState(false);
  const [isInstallingDriver, setIsInstallingDriver] = useState(false);

  useEffect(() => {
    fetchTool();
  }, [id]);

  const fetchTool = async () => {
    try {
      const res = await fetch(`/api/tools/${id}`);
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setTool(data);
      
      if (!data.long_description || data.long_description.length < 20) {
        fetchAiExplanation(data.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiExplanation = async (toolName: string) => {
    setLoadingExplanation(true);
    setAiExplanation('');
    try {
      const res = await fetch('/api/explain-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolName })
      });
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      if (res.ok && data.explanation) {
        setAiExplanation(data.explanation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleRunClick = () => {
    if (!tool) return;
    
    // Simulate prerequisite check
    // In a real desktop app, this would check Device Manager or Registry
    console.log(`Checking system for driver ID: ${tool.required_driver_id}`);
    
    if (tool.required_driver_id && !isDriverInstalled) {
      setShowDriverWarning(true);
    } else {
      // Launch tool directly
      alert(`جاري فتح ${tool.name}...`);
    }
  };

  const handleInstallDriver = () => {
    setIsInstallingDriver(true);
    // Simulate silent installation (/S or /quiet)
    setTimeout(() => {
      setIsInstallingDriver(false);
      setIsDriverInstalled(true);
      setShowDriverWarning(false);
      alert('تم تثبيت التعريفات بنجاح. يمكنك الآن تشغيل الأداة.');
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!tool) {
    return <div className="text-center py-12 text-gray-500">الأداة غير موجودة.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700">
        <ArrowRight className="w-4 h-4 ml-1" />
        العودة للكتالوج
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-10 border-b border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
          {tool.icon_image ? (
            <div className="w-32 h-32 bg-gray-50 rounded-3xl flex items-center justify-center p-4 shadow-inner shrink-0">
              <img src={tool.icon_image} alt={tool.name} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-32 h-32 bg-indigo-50 rounded-3xl flex items-center justify-center shrink-0">
              <Wrench className="w-16 h-16 text-indigo-500" />
            </div>
          )}
          
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{tool.name}</h1>
              <span className="text-sm font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">{tool.version}</span>
              <button
                onClick={() => toggleFavorite(tool.id)}
                className={`p-2 rounded-full transition-colors mr-2 ${
                  isFavorite(tool.id) 
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 bg-gray-50 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isFavorite(tool.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              >
                <Heart className={`w-6 h-6 ${isFavorite(tool.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 text-sm text-gray-600 font-medium">
              <span className="flex items-center"><HardDrive className="w-4 h-4 ml-1 text-gray-400" /> {tool.file_size}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{tool.brand_name}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{tool.category_name}</span>
            </div>
            
            <p className="text-gray-600 text-lg">{tool.short_description}</p>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-gray-50">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <ShieldCheck className="w-6 h-6 ml-2 text-green-500" />
                  شرح وخطوات الاستخدام
                </h2>
                <button 
                  onClick={() => fetchAiExplanation(tool.name)}
                  disabled={loadingExplanation}
                  className="flex items-center text-sm font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 disabled:opacity-50 py-2 px-4 rounded-xl transition-colors shadow-sm border border-indigo-200"
                >
                  <Bot className="w-4 h-4 ml-2" />
                  {loadingExplanation ? 'جاري الشرح...' : 'اشرح بالذكاء الاصطناعي'}
                </button>
              </div>
              
              {loadingExplanation ? (
                <div className="flex items-center text-indigo-600 font-medium bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 ml-3"></div>
                  يقوم الذكاء الاصطناعي الآن بكتابة شرح مفصل لهذه الأداة...
                </div>
              ) : (
                <div className="prose prose-blue prose-p:text-gray-600 font-medium">
                  {aiExplanation ? (
                    aiExplanation.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))
                  ) : (
                    tool.long_description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-72 space-y-4 shrink-0">
              <button 
                onClick={handleRunClick}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center text-lg"
              >
                تشغيل الأداة
              </button>
              
              <a 
                href={tool.download_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold py-3 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center"
              >
                <Download className="w-5 h-5 ml-2" />
                تحميل الملف ({tool.file_size})
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Check Modal Simulation */}
      {showDriverWarning && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">تحذير: تعريفات مفقودة</h3>
            <p className="text-center text-gray-600 mb-6">
              لم يتم التعرف على تعريفات <strong>{tool.brand_name}</strong> المطلوبة لهذه الأداة. 
              يرجى تثبيت (<strong>{tool.required_driver_name}</strong>) أولاً لتجنب مشكلة "الجهاز غير موجود".
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleInstallDriver}
                disabled={isInstallingDriver}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
              >
                {isInstallingDriver ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
                    جاري التثبيت الصامت...
                  </>
                ) : (
                  'تثبيت التعريفات الآن'
                )}
              </button>
              <button 
                onClick={() => setShowDriverWarning(false)}
                disabled={isInstallingDriver}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
              >
                تخطي ومتابعة
              </button>
            </div>
          </div>
        </div>
      )}
      
      <AIAssistant toolName={tool.name} toolDescription={tool.short_description} />
    </div>
  );
}
