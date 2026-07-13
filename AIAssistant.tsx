import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Minimize2, Maximize2 } from 'lucide-react';

interface AIAssistantProps {
  toolName: string;
  toolDescription: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant({ toolName, toolDescription }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `مرحباً! أنا المساعد الذكي. كيف يمكنني مساعدتك بخصوص أداة ${toolName}؟` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          toolName,
          toolDescription
        })
      });

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group z-50 animate-bounce"
        title="اسأل الذكاء الاصطناعي"
      >
        <Bot className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out font-medium group-hover:mr-2">
          اسأل المساعد الذكي
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 left-6 bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-[450px] h-[600px]' : 'w-[350px] h-[450px]'}`}>
      <div className="bg-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">المساعد الذكي (AI)</h3>
            <p className="text-xs text-indigo-100 opacity-90">{toolName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm prose prose-sm prose-indigo'
              }`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {msg.content}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">
              {msg.role === 'user' ? 'أنت' : 'المساعد الذكي'}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-3 shadow-sm flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              جاري التفكير...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-4 pl-12 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute left-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
