import React, { useState, useCallback, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { analyzeQuery } from './services/geminiService';
import type { AnalysisResult } from './types';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';

// Set worker source for pdf.js from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('46-year-old male, knee surgery in Pune, 3-month-old insurance policy');
  const [documentContent, setDocumentContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFileProcessing, setIsFileProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/plain' || file.type === 'application/pdf') {
        setFileName(file.name);
        setDocumentContent('');
        setError(null);
        setIsFileProcessing(true);

        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            if (file.type === 'text/plain') {
              const text = e.target?.result as string;
              setDocumentContent(text);
            } else { // application/pdf
              if (!e.target?.result) throw new Error("File could not be read.");
              const arrayBuffer = e.target.result as ArrayBuffer;
              const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
              const pdf = await loadingTask.promise;
              
              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                fullText += pageText + '\n\n';
              }
              setDocumentContent(fullText.trim());
            }
          } catch (processingError) {
            console.error('Error processing file:', processingError);
            setError(`Failed to process file: ${file.name}. It might be corrupted or password-protected.`);
            setFileName('');
          } finally {
            setIsFileProcessing(false);
          }
        };

        reader.onerror = () => {
          setError(`Failed to read the file: ${file.name}.`);
          setFileName('');
          setIsFileProcessing(false);
        };

        if (file.type === 'text/plain') {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      } else {
        setError('Please upload a valid .txt or .pdf file.');
        setDocumentContent('');
        setFileName('');
      }
    }
  };

  const handleClearFile = () => {
    setDocumentContent('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!query.trim()) {
      setError('Query cannot be empty.');
      return;
    }
    if (!documentContent) {
      setError('Please upload a policy document.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeQuery(query, documentContent);
      setResult(analysisResult);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [query, documentContent]);

  const HeaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center mb-6">
          <HeaderIcon />
          <div>
            <h1 className="text-3xl font-bold text-slate-800">PolicyAI</h1>
            <p className="text-slate-600">Smart Document Analyzer</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input and Documents */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Enter Your Claim Details</h2>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out resize-none"
                placeholder="e.g., '52-year-old female, heart surgery in Mumbai, 6-month-old policy'"
              />
              <button
                onClick={handleAnalyze}
                disabled={isLoading || isFileProcessing || !query.trim() || !documentContent}
                className="mt-4 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                aria-label={!documentContent ? "Upload a document to enable analysis" : "Analyze Claim"}
              >
                {isLoading && <Spinner className="w-5 h-5 mr-2" />}
                {isLoading ? 'Analyzing...' : 'Analyze Claim'}
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700 mb-2">Source Document</h2>
                <p className="text-sm text-slate-500 mb-4">Upload a policy document (.pdf, .txt) for the AI to analyze.</p>

                {!fileName ? (
                    <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
                        <div className="text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="mt-4 flex justify-center text-sm leading-6 text-slate-600">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-sky-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-600 focus-within:ring-offset-2 hover:text-sky-500 transition-colors"
                                >
                                    <span>Upload a file</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                        accept=".txt,.pdf"
                                        ref={fileInputRef}
                                    />
                                </label>
                            </div>
                            <p className="text-xs leading-5 text-slate-500">PDF or Plain text (.txt) files only</p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 flex items-center justify-between bg-sky-50 p-3 rounded-lg border border-sky-200">
                        <div className="flex items-center min-w-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="ml-3 text-sm font-medium text-slate-800 truncate" title={fileName}>{fileName}</span>
                             {isFileProcessing && <Spinner className="w-5 h-5 ml-3" />}
                        </div>
                        <button
                            onClick={handleClearFile}
                            disabled={isFileProcessing}
                            className="p-1 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Remove file"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-700 mb-4">Analysis Result</h2>
              <div className="h-[calc(100%-2.5rem)]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Spinner className="w-12 h-12" />
                        <p className="mt-4 text-lg">Processing request...</p>
                    </div>
                )}
                {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>}
                {result && !isLoading && <ResultDisplay result={result} />}
                {!result && !isLoading && !error && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625a1.875 1.875 0 00-1.875 1.875v17.25a1.875 1.875 0 001.875 1.875h12.75A1.875 1.875 0 0020.25 21V7.5a1.875 1.875 0 00-1.875-1.875H15M12 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="mt-4 font-semibold text-slate-500">Analysis results will appear here</p>
                        <p className="text-sm">Enter a query and upload a document to begin.</p>
                    </div>
                )}
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;