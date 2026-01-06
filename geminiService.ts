import { GoogleGenAI } from "@google/genai";
import { FileCategory } from "../types";

const API_KEY = process.env.API_KEY || '';

// Initialize client
// Note: We create the client dynamically to avoid issues if the key is missing initially, 
// though in this env we assume it exists.
const getClient = () => new GoogleGenAI({ apiKey: API_KEY });

/**
 * Helper to convert File/Blob to Base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:mime/type;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Handles Text/Code Transformations
 */
export const processTextWithGemini = async (
  text: string, 
  targetFormat: string
): Promise<string> => {
  const ai = getClient();
  const model = 'gemini-3-flash-preview'; // Good for text tasks

  let prompt = '';
  switch (targetFormat) {
    case 'application/json':
      prompt = 'Convert the following text/data into a valid JSON structure. Only output the JSON code block.';
      break;
    case 'application/xml':
      prompt = 'Convert the following content into valid XML. Only output the XML code block.';
      break;
    case 'text/yaml':
      prompt = 'Convert the following content into valid YAML. Only output the YAML code block.';
      break;
    case 'text/javascript':
      prompt = 'Convert this code to JavaScript/TypeScript. If it is not code, explain why. Only output the code.';
      break;
    case 'text/x-python':
      prompt = 'Convert this code to Python. If it is not code, explain why. Only output the code.';
      break;
    case 'text/summary':
      prompt = 'Summarize the following text concisely.';
      break;
    case 'text/plain':
      prompt = 'Proofread and improve the following text. Maintain original meaning but fix grammar and style.';
      break;
    default:
      prompt = `Convert or transform the following content to match the format/goal: ${targetFormat}.`;
  }

  const response = await ai.models.generateContent({
    model,
    contents: `${prompt}\n\nContent:\n${text}`,
  });

  return response.text || "No response generated.";
};

/**
 * Handles Audio Transcription/Analysis
 */
export const processAudioWithGemini = async (
  audioFile: File,
  targetFormat: string
): Promise<string> => {
  const ai = getClient();
  const model = 'gemini-2.5-flash-native-audio-preview-09-2025';

  const base64Audio = await fileToBase64(audioFile);
  
  let prompt = "Transcribe this audio file accurately.";
  if (targetFormat === 'text/summary') {
    prompt = "Listen to this audio and provide a concise summary of the key points discussed.";
  } else if (targetFormat === 'application/json') {
    prompt = "Analyze the sentiment and tone of this audio. Return a JSON object with keys: sentiment, tone, key_topics (array).";
  }

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: audioFile.type,
            data: base64Audio
          }
        },
        { text: prompt }
      ]
    }
  });

  return response.text || "No transcript generated.";
};

/**
 * Handles Image Analysis/Conversion to Text/Code
 */
export const processImageWithGemini = async (
  imageFile: File,
  targetFormat: string
): Promise<string> => {
  const ai = getClient();
  // Using gemini-2.5-flash-image for general tasks, or pro if we needed higher reasoning
  const model = 'gemini-2.5-flash-image';

  const base64Image = await fileToBase64(imageFile);

  let prompt = "Describe this image.";
  if (targetFormat === 'text/html') {
    prompt = "You are an expert frontend engineer. Look at this UI design/screenshot and write the HTML/Tailwind CSS code to replicate it. Return only the code.";
  } else if (targetFormat === 'application/json') {
    prompt = "Extract all visible text and data fields from this image and structure them into a clean JSON object. If it is a receipt or document, organize by fields.";
  } else if (targetFormat === 'text/description') {
    prompt = "Provide a detailed textual description of this image for accessibility purposes (Alt Text).";
  }

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: base64Image
          }
        },
        { text: prompt }
      ]
    }
  });

  return response.text || "No analysis generated.";
};

/**
 * Handles PDF Document Processing
 */
export const processPdfWithGemini = async (
  pdfFile: File,
  targetFormat: string
): Promise<string> => {
  const ai = getClient();
  // gemini-3-flash-preview is suitable for high-volume text tasks including documents
  const model = 'gemini-3-flash-preview'; 

  const base64Pdf = await fileToBase64(pdfFile);

  let prompt = "Analyze this PDF document.";
  switch (targetFormat) {
    case 'text/plain':
      prompt = "Extract all the text from this PDF document. Do not use markdown formatting, just plain text.";
      break;
    case 'text/markdown':
      prompt = "Convert the content of this PDF into well-structured Markdown. Preserve headers, lists, and tables.";
      break;
    case 'text/summary':
      prompt = "Read this PDF document and provide a comprehensive summary of its contents.";
      break;
    case 'application/json':
      prompt = "Extract the structured data from this PDF (like forms, tables, or key-value pairs) and output it as a JSON object.";
      break;
    case 'text/html':
      prompt = "Convert this PDF document into semantic HTML5 code.";
      break;
  }

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf
          }
        },
        { text: prompt }
      ]
    }
  });

  return response.text || "No result generated.";
};
