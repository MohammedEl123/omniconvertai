import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Actually we will use a simple random string gen to avoid dep if possible, but let's stick to simple
import FileDropzone from './components/FileDropzone';
import ProcessingItem from './components/ProcessingItem';
import { QueuedFile, FileCategory, ConversionStatus } from './types';
import { TARGET_FORMATS } from './constants';
import { processAudioWithGemini, processImageWithGemini, processTextWithGemini, processPdfWithGemini } from './services/geminiService';
import { convertImageLocally } from './services/localConverter';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);

  const categorizeFile = (file: File): FileCategory => {
    if (file.type === 'application/pdf') return FileCategory.PDF;
    if (file.type.startsWith('image/')) return FileCategory.IMAGE;
    if (file.type.startsWith('audio/')) return FileCategory.AUDIO;
    if (file.type.startsWith('text/') || 
        file.type.includes('json') || 
        file.type.includes('javascript') || 
        file.name.endsWith('.ts') || 
        file.name.endsWith('.py') ||
        file.name.endsWith('.md')) {
      return FileCategory.TEXT_CODE;
    }
    return FileCategory.UNKNOWN;
  };

  const handleFilesAdded = (files: File[]) => {
    const newItems: QueuedFile[] = files.map(file => {
      const category = categorizeFile(file);
      const availableOptions = TARGET_FORMATS[category] || [];
      const defaultFormat = availableOptions.length > 0 ? availableOptions[0].value : 'text/plain';

      return {
        id: generateId(),
        file,
        category,
        targetFormat: defaultFormat,
        status: category === FileCategory.UNKNOWN ? ConversionStatus.ERROR : ConversionStatus.IDLE,
        error: category === FileCategory.UNKNOWN ? "Unsupported file type" : undefined
      };
    });

    setQueue(prev => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  const handleTargetChange = (id: string, format: string) => {
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, targetFormat: format } : item
    ));
  };

  const processQueue = async () => {
    setIsGlobalProcessing(true);
    
    // Process items sequentially to avoid hitting rate limits too hard if multiple AI calls
    // But for UX, we'll map promises and handle them.
    
    const pendingItems = queue.filter(item => item.status === ConversionStatus.IDLE);

    for (const item of pendingItems) {
      // Update status to processing
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: ConversionStatus.PROCESSING } : q));

      try {
        let result: string | Blob;
        
        const isAiAction = TARGET_FORMATS[item.category]?.find(opt => opt.value === item.targetFormat)?.isAiPowered;

        if (item.category === FileCategory.IMAGE && !isAiAction) {
          // Local Canvas Conversion
          result = await convertImageLocally(item.file, item.targetFormat);
        } else if (item.category === FileCategory.IMAGE && isAiAction) {
          // Gemini Image Analysis
          result = await processImageWithGemini(item.file, item.targetFormat);
        } else if (item.category === FileCategory.AUDIO) {
          // Gemini Audio
          result = await processAudioWithGemini(item.file, item.targetFormat);
        } else if (item.category === FileCategory.TEXT_CODE) {
          // Gemini Text
          const textContent = await item.file.text();
          result = await processTextWithGemini(textContent, item.targetFormat);
        } else if (item.category === FileCategory.PDF) {
          // Gemini PDF
          result = await processPdfWithGemini(item.file, item.targetFormat);
        } else {
          throw new Error("Unknown conversion path");
        }

        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: ConversionStatus.COMPLETED, result } : q
        ));

      } catch (err: any) {
        console.error("Conversion failed", err);
        setQueue(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: ConversionStatus.ERROR, error: err.message || "Failed" } : q
        ));
      }
    }

    setIsGlobalProcessing(false);
  };

  const clearCompleted = () => {
    setQueue(prev => prev.filter(item => item.status !== ConversionStatus.COMPLETED));
  };

  return (
    <div className="min-h-screen bg-dark text-slate-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 shadow-lg shadow-purple-900/50">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-3">
            OmniConvert AI
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Convert images locally or use <span className="text-primary font-bold">Gemini 3</span> to transcribe audio, transform code, and process PDF documents.
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          
          <FileDropzone onFilesAdded={handleFilesAdded} />

          {/* Queue List */}
          {queue.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <h2 className="text-xl font-semibold text-white">Conversion Queue ({queue.length})</h2>
                {queue.some(i => i.status === ConversionStatus.COMPLETED) && (
                  <button 
                    onClick={clearCompleted}
                    className="text-sm text-slate-400 hover:text-white underline"
                  >
                    Clear Completed
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {queue.map(item => (
                  <ProcessingItem
                    key={item.id}
                    item={item}
                    options={TARGET_FORMATS[item.category] || []}
                    onTargetChange={handleTargetChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              {/* Action Bar */}
              <div className="sticky bottom-6 bg-surface/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl flex justify-between items-center mt-6 z-10">
                <div className="text-sm text-slate-400 hidden md:block">
                  {queue.filter(i => i.status === ConversionStatus.IDLE).length} files ready to process
                </div>
                <button
                  onClick={processQueue}
                  disabled={isGlobalProcessing || !queue.some(i => i.status === ConversionStatus.IDLE)}
                  className={`
                    w-full md:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5
                    ${isGlobalProcessing || !queue.some(i => i.status === ConversionStatus.IDLE)
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-primary to-secondary hover:shadow-primary/50'}
                  `}
                >
                  {isGlobalProcessing ? 'Processing...' : 'Convert All Files'}
                </button>
              </div>
            </div>
          )}
          
          {/* Info Cards */}
          {queue.length === 0 && (
            <div className="grid md:grid-cols-4 gap-4 mt-12">
              <div className="bg-surface/50 p-6 rounded-xl border border-slate-700/50">
                <div className="text-primary mb-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-white font-bold mb-2">Smart Image</h3>
                <p className="text-xs text-slate-400">Convert formats or use AI to extract text and generate HTML code from screenshots.</p>
              </div>
              
              <div className="bg-surface/50 p-6 rounded-xl border border-slate-700/50">
                <div className="text-secondary mb-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </div>
                <h3 className="text-white font-bold mb-2">Audio Intel</h3>
                <p className="text-xs text-slate-400">Transcribe meetings, summarize podcasts, or analyze sentiment from audio.</p>
              </div>

              <div className="bg-surface/50 p-6 rounded-xl border border-slate-700/50">
                <div className="text-emerald-400 mb-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <h3 className="text-white font-bold mb-2">Code Tools</h3>
                <p className="text-xs text-slate-400">Convert Python to JS, JSON to XML, or summarize complex code files.</p>
              </div>

              <div className="bg-surface/50 p-6 rounded-xl border border-slate-700/50">
                <div className="text-red-400 mb-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h3 className="text-white font-bold mb-2">PDF Power</h3>
                <p className="text-xs text-slate-400">Extract text, summarize reports, or convert PDF tables to JSON data.</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default App;