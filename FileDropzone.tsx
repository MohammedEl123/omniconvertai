import React, { useCallback, useState } from 'react';
import { MAX_FILE_SIZE_BYTES } from '../constants';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateAndAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    
    const validFiles: File[] = [];
    let hasHugeFile = false;

    Array.from(fileList).forEach(file => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        hasHugeFile = true;
      } else {
        validFiles.push(file);
      }
    });

    if (hasHugeFile) {
      setErrorMsg("Some files were skipped because they exceed the 10MB limit.");
    } else {
      setErrorMsg(null);
    }

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndAddFiles(e.dataTransfer.files);
  }, [onFilesAdded]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files);
    // Reset value so same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
        flex flex-col items-center justify-center min-h-[250px] cursor-pointer
        ${isDragging 
          ? 'border-primary bg-primary/10 scale-[1.01]' 
          : 'border-slate-600 hover:border-slate-400 bg-surface/50 hover:bg-surface'}
      `}
    >
      <input
        type="file"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
      />
      
      <div className="bg-slate-700 p-4 rounded-full mb-4 shadow-lg group-hover:shadow-primary/50 transition-shadow">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-2">
        {isDragging ? 'Drop files here' : 'Drag & Drop files here'}
      </h3>
      <p className="text-slate-400 text-sm mb-6">
        or click to browse from your computer
      </p>

      <div className="flex gap-3 text-xs text-slate-500 uppercase font-semibold tracking-wider">
        <span className="bg-slate-800 px-2 py-1 rounded">Images</span>
        <span className="bg-slate-800 px-2 py-1 rounded">Audio</span>
        <span className="bg-slate-800 px-2 py-1 rounded">PDF</span>
        <span className="bg-slate-800 px-2 py-1 rounded">Code/Text</span>
      </div>

      {errorMsg && (
        <div className="mt-4 text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded">
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default FileDropzone;