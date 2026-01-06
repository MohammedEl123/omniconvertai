export enum FileCategory {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  TEXT_CODE = 'TEXT_CODE',
  PDF = 'PDF',
  UNKNOWN = 'UNKNOWN',
}

export enum ConversionStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ConversionOption {
  value: string;
  label: string;
  isAiPowered: boolean; // True if it requires Gemini
  description?: string;
}

export interface QueuedFile {
  id: string;
  file: File;
  category: FileCategory;
  previewUrl?: string;
  targetFormat: string;
  status: ConversionStatus;
  result?: string | Blob; // Text content or Blob URL
  resultType?: 'text' | 'blob'; // How to render/download the result
  error?: string;
  progress?: number;
}

export type SupportedMimeType = 
  | 'image/png' 
  | 'image/jpeg' 
  | 'image/webp' 
  | 'audio/mpeg' 
  | 'audio/wav' 
  | 'audio/ogg' 
  | 'application/json' 
  | 'text/plain' 
  | 'text/javascript' 
  | 'text/x-python' 
  | 'text/html'
  | 'text/markdown'
  | 'application/pdf'; // Basic support

export interface GeminiConfig {
    model: string;
    temperature?: number;
    mimeType?: string;
}