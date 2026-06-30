import React, { useState, useEffect, useRef } from 'react';
import { db, collection, getDocs } from '../firebase';
import { CivicIssueReport } from '../types';
import { MessageSquare, Send, Sparkles, User, HelpCircle, Building } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantViewProps {
  language: 'en' | 'hi';
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ language }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: language === 'en'
        ? "Hello! I am your CiviQ AI assistant, connected to the Validation, Planning, and Analytics multi-agents. Ask me to identify nearby unresolved hazards, predict future waste overloads, summarize complaint logs, or suggest municipal resource paths."
        : "नमस्ते! मैं आपका CiviQ AI सहायक हूँ। मुझसे आस-पास की अनसुलझी समस्याओं के बारे में पूछें, कचरा ओवरलोड की भविष्यवाणी करें, या प्रशासनिक समाधान पर सुझाव लें।"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<CivicIssueReport[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load latest reports context so AI can answer with real-time ward data
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const snap = await getDocs(collection(db, 'reports'));
        const list: CivicIssueReport[] = [];
        snap.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as CivicIssueReport);
        });
        setReports(list);
      } catch (e) {
        console.warn("Failed to load AI reports context:", e);
      }
    };
    fetchContext();
  }, []);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMessage = { role: 'user' as const, content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send chat message to Express backend with reports data for context grounding!
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages.slice(1), // Exclude initial greeting
          reportsContext: reports.map(r => ({
            category: r.category,
            address: r.address,
            priority: r.priority,
            status: r.status,
            ward: r.ward,
            reporter: r.reporterName,
            severity: r.severity,
            days: r.aiAnalysis?.estimatedDays || 5
          }))
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I am having trouble connecting to my central multi-agent server. Please ensure your GEMINI_API_KEY is configured." }]);
      }
    } catch (e) {
      console.error("AI Chat error:", e);
      setMessages(prev => [...prev, { role: 'assistant', content: "An unexpected connection error occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    { en: "Which issue is most urgent?", hi: "कौन सी समस्या सबसे जरूरी है?" },
    { en: "Show nearby unresolved issues.", hi: "आस-पास की अनसुलझी समस्याएँ दिखाएं।" },
    { en: "Summarize today's reports.", hi: "आज की रिपोर्ट का सारांश दें।" },
    { en: "Predict future hotspots.", hi: "भविष्य के हॉटस्पॉट की भविष्यवाणी करें।" },
    { en: "Suggest resource allocation.", hi: "संसाधन आवंटन का सुझाव दें।" }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)] flex flex-col justify-between transition-colors duration-300 text-slate-800 dark:text-slate-100">
      
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col h-[calc(100vh-8rem)] justify-between gap-4">
        
        {/* Chat window viewport */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h2 className="text-sm font-black leading-none">CiviQ AI Copilot</h2>
                <span className="text-5xs text-slate-400 font-extrabold uppercase mt-1 block">Full Context Grounding</span>
              </div>
            </div>
            <span className="text-5xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black rounded-lg uppercase">
              Online
            </span>
          </div>

          {/* Scrolling messages viewport */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Icon indicator */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}>
                  {m.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-emerald-500" />}
                </div>

                {/* Speech Bubble */}
                <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200'
                }`}>
                  {m.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div className="markdown-body text-xs sm:text-sm space-y-1">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-700 dark:text-slate-200">{children}</p>,
                          strong: ({ children }) => <strong className="font-black text-slate-900 dark:text-white">{children}</strong>,
                          h1: ({ children }) => <h1 className="text-base font-extrabold mt-3 mb-1 text-slate-900 dark:text-white border-b border-slate-200/40 dark:border-slate-800/40 pb-0.5">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-bold mt-2.5 mb-1 text-slate-900 dark:text-white">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xs font-semibold mt-2 mb-1 text-slate-800 dark:text-slate-300">{children}</h3>,
                          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-slate-700 dark:text-slate-200">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-slate-700 dark:text-slate-200">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          code: ({ children }) => <code className="font-mono text-2xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-blue-600 dark:text-blue-400">{children}</code>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 mr-auto items-center">
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Sparkles className="h-4 w-4 animate-spin text-indigo-500" />
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs text-slate-400 animate-pulse">
                  Querying CiviQ agents database...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sample preset prompts */}
          {messages.length === 1 && (
            <div className="border-t border-slate-50 dark:border-slate-800/60 pt-4">
              <span className="text-5xs font-black text-slate-400 uppercase tracking-widest block mb-2">Suggested Inquiries:</span>
              <div className="flex flex-wrap gap-2">
                {sampleQuestions.map((q, i) => {
                  const text = language === 'en' ? q.en : q.hi;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSend(text)}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-3xs font-extrabold border border-slate-200/50 dark:border-slate-800 text-left cursor-pointer transition flex items-center space-x-1"
                    >
                      <HelpCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span>{text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Input box */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-2.5 flex items-center gap-3 shadow-md"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'en' ? "Ask the Ward-1 to Ward-5 copilot..." : "वार्ड-1 से वार्ड-5 के सहायक से पूछें..."}
            className="flex-1 pl-3 bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
