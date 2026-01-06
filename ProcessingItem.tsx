import React from 'react';
import { ConversionOption, ConversionStatus, QueuedFile } from '../types';

interface ProcessingItemProps {
  item: QueuedFile;
  options: ConversionOption[];
  onTargetChange: (id: string, format: string) => void;
  onRemove: (id: string) => void;
}

const ProcessingItem: React.FC<ProcessingItemProps> = ({ item, options, onTargetChange, onRemove }) => {
  
  const isProcessing = item.status === ConversionStatus.PROCESSING || item.status === ConversionStatus.UPLOADING;
  const isDone = item.status === ConversionStatus.COMPLETED;
  const isError = item.status === ConversionStatus.ERROR;

  // Function to create downloadable Blob URL for text results
  const getDownloadUrl = () => {
    if (item.result instanceof Blob) {
      return URL.createObjectURL(item.result);
    }
    if (typeof item.result === 'string') {
      const blob = new Blob([item.result], { type: 'text/plain' });
      return URL.createObjectURL(blob);
    }
    return '';
  };

  const downloadUrl = isDone ? getDownloadUrl() : undefined;
  
  // Decide file extension for download
  const getExtension = () => {
    const format = item.targetFormat;
    if (format.includes('json')) return 'json';
    if (format.includes('xml')) return 'xml';
    if (format.includes('html')) return 'html';
    if (format.includes('javascript')) return 'js';
    if (format.includes('python')) return 'py';
    if (format.includes('png')) return 'png';
    if (format.includes('jpeg')) return 'jpg';
    if (format.includes('webp')) return 'webp';
    return 'txt';
  };

  return (
    <div className="bg-surface border border-slate-700 rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-4 items-center shadow-sm hover:border-slate-600 transition-colors">
      
      {/* File Info */}
      <div className="flex-1 w-full md:w-auto flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs overflow-hidden shrink-0">
          {item.category === 'IMAGE' ? (
             // eslint-disable-next-line jsx-a11y/alt-text
             <img src={URL.createObjectURL(item.file)} className="h-full w-full object-cover" />
          ) : (
            item.file.name.split('.').pop()?.toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate max-w-[200px]" title={item.file.name}>
            {item.file.name}
          </p>
          <p className="text-xs text-slate-500">
            {(item.file.size / 1024).toFixed(1)} KB • {item.category}
          </p>
        </div>
      </div>

      {/* Controls */}
      {!isDone && !isError && (
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-slate-400 text-sm whitespace-nowrap">Convert to:</span>
          <select
            value={item.targetFormat}
            onChange={(e) => onTargetChange(item.id, e.target.value)}
            disabled={isProcessing}
            className="bg-dark border border-slate-600 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full md:w-48 p-2.5 outline-none"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label} {opt.isAiPowered ? '✨' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Indicators */}
      <div className="w-full md:w-32 flex justify-center">
        {item.status === ConversionStatus.IDLE && (
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Ready</span>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-primary text-sm font-medium animate-pulse">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        )}
        {isDone && (
          <span className="text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-900 px-2 py-1 rounded font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Success
          </span>
        )}
        {isError && (
          <span className="text-xs text-red-400 bg-red-900/20 border border-red-900 px-2 py-1 rounded font-medium" title={item.error}>
            Failed
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end w-full md:w-auto">
        {isDone && downloadUrl && (
          <a
            href={downloadUrl}
            download={`converted_${item.file.name.split('.')[0]}.${getExtension()}`}
            className="flex items-center gap-1 bg-primary hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm transition-colors font-medium shadow-lg shadow-primary/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </a>
        )}
        
        <button
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
          title="Remove"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

    </div>
  );
};

export default ProcessingItem;