/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  FileUp,
  FileText,
  Trash2,
  RefreshCw,
  Search,
  AlertCircle,
  Loader2,
  Download,
  FlaskConical,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { HowItWorksAndAbout } from './components/HowItWorksAndAbout';
import { DEMO_SCENARIOS, buildPdfFileFromScenario, type DemoScenario } from './data/projectData';
import type { AnalysisResult } from './lib/analyzer';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jobTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);

    const fileNameLower = file.name.toLowerCase();
    const isPdfMime = file.type === 'application/pdf' || fileNameLower.endsWith('.pdf');

    if (!isPdfMime) {
      setSelectedFile(null);
      setErrorMessage('Invalid file format. Please upload a PDF (.pdf) file only.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit. Please choose a smaller PDF.`
      );
      return;
    }

    if (file.size === 0) {
      setSelectedFile(null);
      setErrorMessage('The selected PDF file is empty (0 bytes).');
      return;
    }

    setSelectedFile(file);
    setActiveScenarioId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
    // Reset input value so selecting the same file again still triggers onChange
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setActiveScenarioId(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadScenario = (scenario: DemoScenario) => {
    const generatedPdfFile = buildPdfFileFromScenario(scenario);
    setSelectedFile(generatedPdfFile);
    setJobDescription(scenario.jobDescription);
    setActiveScenarioId(scenario.id);
    setErrorMessage(null);
  };

  const handleDownloadSelectedPdf = () => {
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnalyzing) return;

    setErrorMessage(null);

    if (!selectedFile) {
      setErrorMessage('Please upload a PDF resume before starting the analysis.');
      return;
    }

    const trimmedJd = jobDescription.trim();
    if (!trimmedJd) {
      setErrorMessage('Please enter a target job description to match against.');
      return;
    }

    if (trimmedJd.length < 20) {
      setErrorMessage(
        'The job description is too short. Please include the role responsibilities, required skills, and qualifications.'
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('jobDescription', trimmedJd);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setAnalysisResult(null);
        setErrorMessage(data.error || data.detail || 'Resume analysis failed. Please check your PDF file and try again.');
        return;
      }

      setAnalysisResult(data as AnalysisResult);

      setTimeout(() => {
        scrollToSection('analysis-results');
      }, 80);
    } catch {
      setAnalysisResult(null);
      setErrorMessage('Unable to reach the analysis service. Please verify your connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAll = () => {
    setSelectedFile(null);
    setJobDescription('');
    setAnalysisResult(null);
    setErrorMessage(null);
    setActiveScenarioId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    scrollToSection('analyze-workspace');
  };

  const handleEditJobDescription = () => {
    scrollToSection('analyze-workspace');
    setTimeout(() => {
      jobTextareaRef.current?.focus();
    }, 300);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const jdWordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#172033]">
      {/* A. Navigation Bar */}
      <Navbar onNavigate={scrollToSection} />

      <main className="flex-1">
        {/* B. Hero Section */}
        <HeroSection
          onAnalyzeClick={() => scrollToSection('analyze-workspace')}
          onHowItWorksClick={() => scrollToSection('how-it-works')}
        />

        {/* C. Resume Analysis Workspace */}
        <section
          id="analyze-workspace"
          className="scroll-mt-20 py-16 md:py-20 px-6 bg-[#F8FAFC]"
        >
          <div className="max-w-[1160px] mx-auto">
            {/* Workspace Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] mb-2">
                  Analyze Your Resume
                </h2>
                <p className="text-base text-[#64748B]">
                  Upload your resume and add a job description to understand how well they align.
                </p>
              </div>

              {/* Real PDF Test Scenarios Bar for College Demo / Quick Verification */}
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] mb-2">
                  <FlaskConical className="w-3.5 h-3.5 text-[#6D5EF7]" aria-hidden="true" />
                  <span>Load Real PDF Test Scenario (Optional):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {DEMO_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      type="button"
                      onClick={() => handleLoadScenario(scenario)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        activeScenarioId === scenario.id
                          ? 'bg-[#6D5EF7] text-white'
                          : 'bg-[#F8FAFC] text-[#172033] hover:bg-[#F5F3FF] hover:text-[#6D5EF7] border border-[#E5E7EB]'
                      }`}
                    >
                      {scenario.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleAnalyzeSubmit} noValidate>
              {/* Two Balanced Panels on Desktop, Vertically Stacked on Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">
                {/* Left Panel — Upload Resume */}
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-6 sm:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-lg font-bold text-[#172033]">Your Resume</h3>
                      <span className="text-xs text-[#64748B] font-mono tabular-nums">
                        PDF · Max 5 MB
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B] mb-5">
                      Upload your latest resume to get started.
                    </p>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      id="resume-file-input"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                      aria-label="Upload PDF Resume"
                    />

                    {!selectedFile ? (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`h-[260px] rounded-[12px] border-2 border-dashed transition-colors flex flex-col items-center justify-center p-6 text-center ${
                          isDragging
                            ? 'border-[#6D5EF7] bg-[#F5F3FF]'
                            : 'border-[#E5E7EB] bg-[#F8FAFC] hover:border-[#6D5EF7]/60'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-[12px] bg-[#F5F3FF] border border-[#E5E7EB] flex items-center justify-center mb-4">
                          <FileUp className="w-6 h-6 text-[#6D5EF7]" aria-hidden="true" />
                        </div>

                        <p className="text-base font-semibold text-[#172033] mb-1">
                          Drop your resume here
                        </p>
                        <p className="text-sm text-[#64748B] mb-4">
                          or{' '}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="font-semibold text-[#6D5EF7] hover:text-[#5B4CE1] underline underline-offset-2 cursor-pointer"
                          >
                            browse files
                          </button>
                        </p>

                        <p className="text-xs text-[#64748B]">
                          Supported format: PDF · Maximum file size: 5 MB
                        </p>
                      </div>
                    ) : (
                      <div className="h-[260px] rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFC] p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-[10px] bg-[#F5F3FF] border border-[#E5E7EB] flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-[#6D5EF7]" aria-hidden="true" />
                              </div>
                              <div className="min-w-0">
                                <p
                                  data-testid="selected-filename"
                                  className="text-sm font-bold text-[#172033] truncate"
                                  title={selectedFile.name}
                                >
                                  {selectedFile.name}
                                </p>
                                <p className="text-xs text-[#64748B] font-mono tabular-nums mt-0.5">
                                  PDF Document · {formatFileSize(selectedFile.size)} · Ready for text extraction
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-[10px] bg-[#FFFFFF] border border-[#E5E7EB] text-xs text-[#64748B] leading-relaxed">
                            File validated. Clicking <strong className="text-[#172033]">Analyze Resume</strong> will extract readable text from all pages of this PDF and compute TF-IDF similarity.
                          </div>
                        </div>

                        {/* File Actions: Replace, Download, or Remove */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#E5E7EB]">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#172033] bg-[#FFFFFF] hover:bg-[#F5F3FF] border border-[#E5E7EB] rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-[#6D5EF7]" aria-hidden="true" />
                              <span>Replace File</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleDownloadSelectedPdf}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#172033] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Download PDF</span>
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-red-50 rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel — Job Description */}
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-6 sm:p-7 flex flex-col justify-between">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label
                        htmlFor="job-description-textarea"
                        className="text-lg font-bold text-[#172033] cursor-pointer"
                      >
                        Target Job
                      </label>

                      <div className="flex items-center gap-3 text-xs text-[#64748B]">
                        <span className="font-mono tabular-nums">{jdWordCount} words</span>
                        {jobDescription.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <button
                              type="button"
                              onClick={() => {
                                setJobDescription('');
                                setErrorMessage(null);
                              }}
                              className="font-semibold text-[#6D5EF7] hover:text-[#5B4CE1] cursor-pointer"
                            >
                              Clear text
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-[#64748B] mb-5">
                      Paste the job description you want to match against.
                    </p>

                    <textarea
                      ref={jobTextareaRef}
                      id="job-description-textarea"
                      rows={9}
                      value={jobDescription}
                      onChange={(e) => {
                        setJobDescription(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="Paste the job title, responsibilities, required skills, and qualifications here..."
                      className="w-full h-[260px] p-4 rounded-[12px] bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#172033] placeholder:text-[#64748B]/70 leading-relaxed resize-none focus:bg-[#FFFFFF] focus:border-[#6D5EF7] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Validation or Processing Error Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  data-testid="analysis-error-banner"
                  className="mb-6 p-4 rounded-[12px] bg-red-50/70 border border-red-200 flex items-start gap-3 text-sm text-[#DC2626]"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Unable to complete analysis</p>
                    <p className="text-xs sm:text-sm mt-0.5 text-[#172033]">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Prominent Full-Width Violet Analysis Button */}
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-4 px-6 rounded-[12px] bg-[#6D5EF7] hover:bg-[#5B4CE1] disabled:bg-[#6D5EF7]/60 text-white text-base font-semibold transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D5EF7]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
                    <span>Extracting PDF Text & Running TF-IDF Analysis...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Analyze Resume</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        {/* 5. Results Dashboard (Rendered only after a real analysis completes) */}
        {analysisResult && selectedFile && (
          <ResultsDashboard
            result={analysisResult}
            fileName={selectedFile.name}
            onReset={handleResetAll}
            onEditJobDescription={handleEditJobDescription}
          />
        )}

        {/* 6, 7, 8. How It Works, About, Academic Documentation, and Footer */}
        <HowItWorksAndAbout onNavigate={scrollToSection} />
      </main>
    </div>
  );
}
