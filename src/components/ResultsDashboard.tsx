import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit3,
  SlidersHorizontal,
  Sparkles,
  FileText,
  GraduationCap,
  Briefcase,
  Award,
  Mail,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { AnalysisResult, SuggestionItem } from '../lib/analyzer';

interface ResultsDashboardProps {
  result: AnalysisResult;
  fileName: string;
  onReset: () => void;
  onEditJobDescription: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  fileName,
  onReset,
  onEditJobDescription,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(result.suggestions);
  const [refiningWithGemini, setRefiningWithGemini] = useState(false);
  const [geminiConsent, setGeminiConsent] = useState(false);
  const [geminiStatusNote, setGeminiStatusNote] = useState<string | null>(null);

  // Sync suggestions if result changes
  React.useEffect(() => {
    setSuggestions(result.suggestions);
    setGeminiStatusNote(null);
  }, [result]);

  const handleRefineWithGemini = async () => {
    if (!geminiConsent) {
      setGeminiStatusNote('Please check the consent box first to confirm sending summary skill metadata to Gemini.');
      return;
    }

    setRefiningWithGemini(true);
    setGeminiStatusNote(null);

    try {
      const response = await fetch('/api/refine-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchingSkills: result.matchingSkills,
          missingSkills: result.missingSkills,
          similarityPercentage: result.similarityPercentage,
          currentSuggestions: result.suggestions,
          userConsented: true,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setGeminiStatusNote(data.error || 'Could not refine suggestions with Gemini; showing deterministic NLP suggestions.');
      } else if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setGeminiStatusNote('Suggestions phrased using Gemini AI based on your deterministic analysis results.');
      }
    } catch {
      setGeminiStatusNote('Network error reaching Gemini refinement endpoint; keeping baseline deterministic suggestions.');
    } finally {
      setRefiningWithGemini(false);
    }
  };

  // SVG circular gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, result.similarityPercentage));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <section
      id="analysis-results"
      aria-label="Resume Analysis Results"
      className="scroll-mt-20 py-16 px-6 bg-[#FFFFFF] border-t border-[#E5E7EB]"
    >
      <div className="max-w-[1160px] mx-auto">
        {/* Section Heading */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] mb-2">
            Your Resume Analysis
          </h2>
          <p className="text-base text-[#64748B]">
            Here is how your resume (<span className="font-medium text-[#172033]">{fileName}</span>) aligns with the selected job description.
          </p>
        </div>

        {/* A. Similarity Score Panel */}
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px] p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Circular Progress Indicator + Percentage */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#6D5EF7"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    data-testid="similarity-score-value"
                    className="text-2xl font-bold text-[#172033] font-mono tabular-nums"
                  >
                    {result.similarityPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6D5EF7] mb-1">
                  TF-IDF Cosine Similarity
                </p>
                <h3 className="text-xl font-bold text-[#172033] mb-2">
                  Resume–Job Text Similarity
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B] font-mono tabular-nums">
                  <span>Matched Job Skills: {result.totalMatchedSkills} / {result.totalJobSkills}</span>
                  <span aria-hidden="true">·</span>
                  <span>Cosine Score: {result.details.cosineSimilarityRaw.toFixed(4)}</span>
                  <span aria-hidden="true">·</span>
                  <span>Pages Analyzed: {result.overview.pageCount}</span>
                </div>
              </div>
            </div>

            {/* Horizontal Bar + Clear Explanation */}
            <div className="w-full md:max-w-[460px]">
              <div className="flex items-center justify-between text-xs font-medium text-[#64748B] mb-2">
                <span>Textual Overlap Scale</span>
                <span className="font-mono tabular-nums text-[#172033] font-semibold">
                  {result.similarityPercentage.toFixed(1)}%
                </span>
              </div>
              <div
                className="w-full h-2.5 bg-[#E5E7EB] rounded-full overflow-hidden mb-3"
                role="progressbar"
                aria-valuenow={result.similarityPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Resume-Job Text Similarity Percentage"
              >
                <div
                  className="h-full bg-[#6D5EF7] transition-all duration-200"
                  style={{ width: `${clampedScore}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                This metric measures lexical and keyword overlap between your resume and the job description using TF-IDF vectorization and cosine similarity. It is an informational text alignment indicator and does not represent the probability of being hired.
              </p>
            </div>
          </div>
        </div>

        {/* B. Skills Analysis (2 Clean Sections) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-stretch">
          {/* Matching Skills */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-[#172033]">Matching Skills</h3>
                </div>
                <span className="text-xs font-mono tabular-nums text-[#16A34A] font-semibold">
                  {result.matchingSkills.length} of {result.totalJobSkills} matched
                </span>
              </div>
              <p className="text-sm text-[#64748B] mb-5">
                Skills explicitly required in the job description that were also detected in your resume.
              </p>

              {result.matchingSkills.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" aria-label="Matched skills list">
                  {result.matchingSkills.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] text-sm font-medium text-[#172033]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" aria-hidden="true" />
                      <span className="truncate">{skill}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5 rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#64748B]">
                  No overlapping dictionary skills were detected between your resume and this job description. Review the potentially missing skills to see what the posting emphasizes.
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-[#E5E7EB] text-xs text-[#64748B]">
              Total skills detected in resume: <span className="font-mono tabular-nums font-semibold text-[#172033]">{result.resumeSkills.length}</span>
            </div>
          </div>

          {/* Potentially Missing Skills */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-[#172033]">Potentially Missing Skills</h3>
                </div>
                <span className="text-xs font-mono tabular-nums text-[#D97706] font-semibold">
                  {result.missingSkills.length} not detected
                </span>
              </div>
              <p className="text-sm text-[#64748B] mb-5">
                Job-related skills identified in the job description that were not detected in your resume text.
              </p>

              {result.missingSkills.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" aria-label="Potentially missing skills list">
                  {result.missingSkills.map((skill) => (
                    <li
                      key={skill}
                      className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] text-sm font-medium text-[#172033]"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" aria-hidden="true" />
                      <span className="truncate">{skill}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5 rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#16A34A] font-medium">
                  All dictionary skills identified in the job description were found in your resume.
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-[#E5E7EB] text-xs text-[#64748B]">
              Verify these findings carefully: only add a skill to your resume if you genuinely possess working knowledge of it.
            </div>
          </div>
        </div>

        {/* C. Resume Overview */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-6 sm:p-8 mb-8">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#172033] mb-1">Resume Overview</h3>
            <p className="text-sm text-[#64748B]">
              Key information extracted from your uploaded PDF document ({result.overview.wordCount} words across {result.overview.pageCount} {result.overview.pageCount === 1 ? 'page' : 'pages'}).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email & Education */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-1.5">
                  <Mail className="w-4 h-4 text-[#6D5EF7]" aria-hidden="true" />
                  <span>Detected Email (Privacy Masked)</span>
                </div>
                <p className="text-sm font-mono text-[#172033] bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5">
                  {result.overview.emailMasked}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-1.5">
                  <GraduationCap className="w-4 h-4 text-[#6D5EF7]" aria-hidden="true" />
                  <span>Education Information</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5 space-y-1.5">
                  {result.overview.education.map((edu, idx) => (
                    <p key={idx} className="text-sm text-[#172033]">
                      {edu}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-1.5">
                  <Briefcase className="w-4 h-4 text-[#6D5EF7]" aria-hidden="true" />
                  <span>Experience & Action Keywords</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5">
                  <p className="text-sm text-[#172033] leading-relaxed">
                    {result.overview.experienceKeywords.join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            {/* All Resume Skills & Projects/Certifications */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-1.5">
                  <FileText className="w-4 h-4 text-[#6D5EF7]" aria-hidden="true" />
                  <span>All Detected Resume Skills ({result.resumeSkills.length})</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5">
                  <p className="text-sm text-[#172033] leading-relaxed">
                    {result.overview.relevantSkills.join(' · ')}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mb-1.5">
                  <Award className="w-4 h-4 text-[#6D5EF7]" aria-hidden="true" />
                  <span>Projects & Certifications</span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] px-3.5 py-2.5 space-y-1.5">
                  {result.overview.projectsAndCertifications.map((proj, idx) => (
                    <p key={idx} className="text-sm text-[#172033]">
                      {proj}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* D. Improvement Suggestions */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#172033] mb-1">
                Actionable Improvement Suggestions
              </h3>
              <p className="text-sm text-[#64748B]">
                Practical recommendations based on your detected skills, keyword overlap, and resume structure.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {suggestions.map((item, index) => (
              <div
                key={item.id || index}
                className="p-4 sm:p-5 rounded-[12px] bg-[#F8FAFC] border border-[#E5E7EB]"
              >
                <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
                  <span className="font-mono font-semibold text-[#6D5EF7]">
                    0{index + 1}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#172033]">{item.category}</span>
                </div>
                <h4 className="text-base font-semibold text-[#172033] mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Optional Gemini Rewriting with Explicit User Disclosure */}
          <div className="pt-5 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="flex items-start gap-2.5 text-xs text-[#64748B] cursor-pointer">
              <input
                type="checkbox"
                checked={geminiConsent}
                onChange={(e) => setGeminiConsent(e.target.checked)}
                className="mt-0.5 rounded border-[#E5E7EB] text-[#6D5EF7] focus:ring-[#6D5EF7]"
              />
              <span>
                Optional AI phrasing: Allow sending anonymized skill summary counts (never raw resume PII) to the server-side Gemini API to rewrite these suggestions in natural language.
              </span>
            </label>

            <button
              type="button"
              onClick={handleRefineWithGemini}
              disabled={refiningWithGemini}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-[#6D5EF7] bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#E5E7EB] rounded-[10px] transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{refiningWithGemini ? 'Refining...' : 'Refine Wording with Gemini'}</span>
            </button>
          </div>

          {geminiStatusNote && (
            <p className="mt-3 text-xs text-[#64748B]" role="status">
              {geminiStatusNote}
            </p>
          )}
        </div>

        {/* E. Result Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE1] rounded-[10px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Analyze Another Resume</span>
            </button>

            <button
              type="button"
              onClick={onEditJobDescription}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#172033] bg-[#FFFFFF] hover:bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Edit3 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Edit Job Description</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            aria-expanded={showDetails}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#172033] bg-[#F8FAFC] hover:bg-[#F5F3FF] border border-[#E5E7EB] rounded-[10px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#6D5EF7] shrink-0" aria-hidden="true" />
            <span>View Analysis Details</span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Expandable Technical Analysis Details Panel */}
        {showDetails && (
          <div
            data-testid="analysis-details-panel"
            className="scroll-mt-20 mt-6 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px] p-6 sm:p-8"
          >
            <h3 className="text-lg font-bold text-[#172033] mb-2">
              How Similarity & Skill Matching Were Calculated
            </h3>
            <p className="text-sm text-[#64748B] mb-6">
              Transparent breakdown of the statistical NLP vectorization and rule-based extraction pipeline executed on your input.
            </p>

            {/* Vector Statistics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4">
                <p className="text-xs text-[#64748B] mb-1">Unique Vocabulary Terms</p>
                <p className="text-xl font-bold text-[#172033] font-mono tabular-nums">
                  {result.details.vocabularySize}
                </p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4">
                <p className="text-xs text-[#64748B] mb-1">Resume Filtered Tokens</p>
                <p className="text-xl font-bold text-[#172033] font-mono tabular-nums">
                  {result.details.resumeTokenCount}
                </p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4">
                <p className="text-xs text-[#64748B] mb-1">Job Description Tokens</p>
                <p className="text-xl font-bold text-[#172033] font-mono tabular-nums">
                  {result.details.jobTokenCount}
                </p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4">
                <p className="text-xs text-[#64748B] mb-1">Raw Cosine Similarity</p>
                <p className="text-xl font-bold text-[#6D5EF7] font-mono tabular-nums">
                  {result.details.cosineSimilarityRaw.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Top Overlapping TF-IDF Terms Table */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-[#172033] mb-3">
                Top Contributing TF-IDF Terms (Vector Inner Product)
              </h4>
              {result.details.topOverlappingTerms.length > 0 ? (
                <div className="overflow-x-auto bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-xs font-semibold text-[#64748B] bg-[#F8FAFC]">
                        <th className="py-2.5 px-4">Normalized Term</th>
                        <th className="py-2.5 px-4 text-right">Resume TF-IDF (L2)</th>
                        <th className="py-2.5 px-4 text-right">Job TF-IDF (L2)</th>
                        <th className="py-2.5 px-4 text-right">Cosine Contribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] font-mono text-xs tabular-nums">
                      {result.details.topOverlappingTerms.map((row) => (
                        <tr key={row.term} className="hover:bg-[#F8FAFC]">
                          <td className="py-2.5 px-4 font-medium text-[#172033]">{row.term}</td>
                          <td className="py-2.5 px-4 text-right text-[#64748B]">{row.resumeTfIdf.toFixed(4)}</td>
                          <td className="py-2.5 px-4 text-right text-[#64748B]">{row.jobTfIdf.toFixed(4)}</td>
                          <td className="py-2.5 px-4 text-right font-semibold text-[#6D5EF7]">
                            +{row.product.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-[#64748B] bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4">
                  No overlapping content terms were found after stopword removal.
                </p>
              )}
            </div>

            {/* ML vs Rule-Based Methodology Attribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-5">
                <h4 className="text-sm font-bold text-[#172033] mb-2">
                  Statistical NLP & Machine Learning Components
                </h4>
                <ul className="space-y-2 text-xs text-[#64748B] leading-relaxed">
                  {result.details.mlComponentsUsed.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-5">
                <h4 className="text-sm font-bold text-[#172033] mb-2">
                  Rule-Based NLP & Heuristic Components
                </h4>
                <ul className="space-y-2 text-xs text-[#64748B] leading-relaxed">
                  {result.details.ruleBasedComponentsUsed.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
