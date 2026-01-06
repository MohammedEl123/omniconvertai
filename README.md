OmniConvert AI
OmniConvert AI is an all‑in‑one file conversion assistant that lets you convert and process images, audio, code/text, and PDF documents using a mix of local conversion and Gemini 3–powered AI features.
​

Convert image formats locally

Transcribe and analyze audio

Transform and summarize code/text

Extract and summarize PDF content, including tables to JSON
​

Features
Smart Image

Convert between common image formats locally

Extract text from images using AI

Generate basic HTML code from UI screenshots
​

Audio Intel

Transcribe audio files (meetings, podcasts, voice notes)

Summarize long recordings

Run basic sentiment or intent analysis on transcripts
​

Code Tools

Convert code between languages (for example, Python ⇄ JavaScript)

Transform data formats (for example, JSON ⇄ XML)

Summarize and explain complex code files
​

PDF Power

Extract raw text from PDFs

Summarize reports and long documents

Convert PDF tables to structured JSON data
​

Tech Stack
Frontend: React + TypeScript (SPA)

App.tsx as main entry

Reusable components such as FileDropzone.tsx and ProcessingItem.tsx
​

Logic & Types:

Centralized type definitions in types.ts

Shared constants in constants.ts
​

Services:

localConverter.ts for local conversions (e.g., image format changes)

geminiService.ts for AI-powered tasks (audio transcription, code tools, PDF processing) via Gemini 3 API
​

Project Structure
text
/
├─ index.html
├─ index.tsx
├─ App.tsx
├─ types.ts
├─ constants.ts
├─ metadata.json
├─ services/
│  ├─ geminiService.ts
│  └─ localConverter.ts
└─ components/
   ├─ FileDropzone.tsx
   └─ ProcessingItem.tsx
Getting Started
Install dependencies

bash
npm install
# or
yarn install
Set environment variables

Configure your Gemini API key (and any other secrets) as environment variables, for example:

bash
export GEMINI_API_KEY=your_api_key_here
Or use a .env file if your bundler supports it.

Run the development server

bash
npm run dev
# or
yarn dev
Build for production

bash
npm run build
Adjust script names if your bundler/tooling differs.

Usage
Open the app in your browser.

Drag and drop files into the Choose Files / dropzone area, or click to browse from your computer.
​

The app automatically categorizes files into Images, Audio, PDF, and Code/Text.

For each file type, select the desired operation (e.g., image format conversion, audio transcription, code conversion, PDF text extraction).

Download or copy the converted/processed output from the UI.

Configuration
Update constants.ts to adjust:

Supported file types and size limits

Default conversion targets (e.g., image formats, code targets)

Text for labels and section names
​

Update types.ts when adding:

New file categories

New processing modes or options per category
​

Extend localConverter.ts and geminiService.ts to support:

Additional formats (e.g., DOCX, CSV)

More advanced AI workflows (chained prompts, multi-step conversions)
​

Roadmap Ideas
Batch operations with progress tracking and cancel support

More granular audio analysis (speaker diarization, topic extraction)

Additional document formats (DOCX, PPTX, XLSX)

Export presets for developers (API schemas, JSON templates)

License
Specify your preferred license here (e.g., MIT, Apache-2.0).
