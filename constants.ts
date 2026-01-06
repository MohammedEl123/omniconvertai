import { ConversionOption, FileCategory } from './types';

// Supported Target Formats Mapping
export const TARGET_FORMATS: Record<FileCategory, ConversionOption[]> = {
  [FileCategory.IMAGE]: [
    { value: 'image/png', label: 'PNG', isAiPowered: false, description: 'Lossless quality' },
    { value: 'image/jpeg', label: 'JPG', isAiPowered: false, description: 'Smaller file size' },
    { value: 'image/webp', label: 'WEBP', isAiPowered: false, description: 'Web optimized' },
    { value: 'text/description', label: 'Describe Image (AI)', isAiPowered: true, description: 'Generate a detailed caption' },
    { value: 'application/json', label: 'Extract Data (AI)', isAiPowered: true, description: 'Extract text/data to JSON' },
    { value: 'text/html', label: 'To HTML/Code (AI)', isAiPowered: true, description: 'Convert UI mockup to code' },
  ],
  [FileCategory.AUDIO]: [
    { value: 'text/transcription', label: 'Transcribe to Text (AI)', isAiPowered: true, description: 'Speech to text' },
    { value: 'text/summary', label: 'Summarize Audio (AI)', isAiPowered: true, description: 'Key points from audio' },
    { value: 'application/json', label: 'Analyze Sentiment (AI)', isAiPowered: true, description: 'Extract sentiment & tone' },
  ],
  [FileCategory.TEXT_CODE]: [
    { value: 'application/json', label: 'To JSON', isAiPowered: true, description: 'Structure unstructured text' },
    { value: 'application/xml', label: 'To XML', isAiPowered: true, description: 'Convert format' },
    { value: 'text/yaml', label: 'To YAML', isAiPowered: true, description: 'Convert format' },
    { value: 'text/javascript', label: 'To JavaScript', isAiPowered: true, description: 'Code translation' },
    { value: 'text/x-python', label: 'To Python', isAiPowered: true, description: 'Code translation' },
    { value: 'text/summary', label: 'Summarize', isAiPowered: true, description: 'Shorten content' },
    { value: 'text/plain', label: 'Proofread & Fix', isAiPowered: true, description: 'Grammar & style check' },
  ],
  [FileCategory.PDF]: [
    { value: 'text/plain', label: 'Extract Text (AI)', isAiPowered: true, description: 'Raw text content' },
    { value: 'text/markdown', label: 'To Markdown (AI)', isAiPowered: true, description: 'Preserve structure/tables' },
    { value: 'text/summary', label: 'Summarize PDF (AI)', isAiPowered: true, description: 'Concise overview' },
    { value: 'application/json', label: 'Extract Data to JSON (AI)', isAiPowered: true, description: 'Structure document data' },
    { value: 'text/html', label: 'To HTML (AI)', isAiPowered: true, description: 'Web format' },
  ],
  [FileCategory.UNKNOWN]: [],
};

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
