import React, { useState } from 'react';
import { Upload, GitCompare, TrendingUp, FileSearch, BookOpen, Terminal, CheckSquare, HelpCircle } from 'lucide-react';
import { VIVA_QUESTIONS } from '../data/projectData';

interface HowItWorksAndAboutProps {
  onNavigate: (sectionId: string) => void;
}

export const HowItWorksAndAbout: React.FC<HowItWorksAndAboutProps> = ({ onNavigate }) => {
  const [activeDocTab, setActiveDocTab] = useState<'overview' | 'architecture' | 'testing' | 'viva'>('overview');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    onNavigate(sectionId);
  };

  return (
    <>
      {/* 6. HOW IT WORKS SECTION */}
      <section
        id="how-it-works"
        className="scroll-mt-20 py-20 px-6 bg-[#FFFFFF] border-t border-[#E5E7EB]"
      >
        <div className="max-w-[1160px] mx-auto">
          <div className="max-w-[640px] mb-12">
            <p className="text-xs font-semibold text-[#6D5EF7] mb-2">
              Workflow
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] mb-3">
              How It Works
            </h2>
            <p className="text-base text-[#64748B]">
              A straightforward three-step NLP pipeline that evaluates your resume against a target job posting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-mono font-bold text-[#6D5EF7]">
                  01 — Upload
                </span>
                <Upload className="w-5 h-5 text-[#6D5EF7]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#172033] mb-2">
                Upload a PDF resume
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Select your PDF resume (up to 5 MB). The system validates the file and extracts readable text across single or multiple pages.
              </p>
            </div>

            {/* Step 02 */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-mono font-bold text-[#6D5EF7]">
                  02 — Compare
                </span>
                <GitCompare className="w-5 h-5 text-[#6D5EF7]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#172033] mb-2">
                Compare with job description
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                The system preprocesses both documents, preserves technical symbols (like C++, C#, .NET, and Scikit-learn), and computes TF-IDF cosine similarity.
              </p>
            </div>

            {/* Step 03 */}
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[14px] p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-mono font-bold text-[#6D5EF7]">
                  03 — Improve
                </span>
                <TrendingUp className="w-5 h-5 text-[#6D5EF7]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[#172033] mb-2">
                Review gaps and suggestions
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                Inspect matching skills, verify potentially missing job skills, and apply practical suggestions to strengthen your resume before applying.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ABOUT & ACADEMIC DOCUMENTATION SECTION */}
      <section
        id="about"
        className="scroll-mt-20 py-20 px-6 bg-[#F8FAFC] border-t border-[#E5E7EB]"
      >
        <div className="max-w-[1160px] mx-auto">
          <div className="max-w-[760px] mb-12">
            <p className="text-xs font-semibold text-[#6D5EF7] mb-2">
              About the Project
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] mb-4">
              Built to Make Resume Analysis Simpler
            </h2>
            <p className="text-base text-[#64748B] leading-relaxed mb-4">
              ResumeIQ is an educational AIML project that demonstrates how Natural Language Processing and text similarity techniques can help candidates evaluate their resumes against job descriptions.
            </p>
            <p className="text-sm text-[#64748B] leading-relaxed">
              This tool provides constructive guidance on keyword alignment and skill coverage rather than automated hiring decisions. A similarity score reflects textual overlap between two documents, not a candidate's real-world engineering competence or hiring probability.
            </p>
          </div>

          {/* Academic Mini-Project Documentation & Viva Prep Tabs */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB] mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#172033]">
                  AIML Mini-Project Report & Viva Reference
                </h3>
                <p className="text-xs text-[#64748B]">
                  Complete project documentation, architecture notes, testing verification, and viva questions.
                </p>
              </div>

              {/* Interactive Segmented Tab Bar */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[10px]">
                <button
                  type="button"
                  onClick={() => setActiveDocTab('overview')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeDocTab === 'overview'
                      ? 'bg-[#6D5EF7] text-white'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Synopsis & Objectives</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('architecture')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeDocTab === 'architecture'
                      ? 'bg-[#6D5EF7] text-white'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Architecture & Python Setup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('testing')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeDocTab === 'testing'
                      ? 'bg-[#6D5EF7] text-white'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Testing Scenarios</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDocTab('viva')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    activeDocTab === 'viva'
                      ? 'bg-[#6D5EF7] text-white'
                      : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Viva Q&A (10)</span>
                </button>
              </div>
            </div>

            {activeDocTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#64748B] leading-relaxed">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-[#172033] mb-1">1. Project Abstract</h4>
                    <p>
                      ResumeIQ is an explainable AI/ML web application that assists students and job seekers in aligning their resumes with target job descriptions. Using PDF text extraction, token-boundary NLP preprocessing, TF-IDF vectorization, and Cosine Similarity, the system quantifies textual overlap, identifies matching and potentially missing skills, and provides grounded improvement suggestions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172033] mb-1">2. Problem Statement</h4>
                    <p>
                      Students applying for technical roles often struggle to identify whether their resume terminology matches the phrasing and skill requirements of a specific job description. Existing commercial resume scanners frequently act as opaque "black boxes" that output arbitrary hiring probabilities or fabricate unverified recommendations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172033] mb-1">3. Objectives</h4>
                    <ul className="space-y-1">
                      <li>• Extract clean, readable text from multi-page PDF resumes while detecting empty or scanned image-only files.</li>
                      <li>• Preserve technical terms (C++, C#, .NET, Node.js, Scikit-learn) during tokenization.</li>
                      <li>• Compute explainable Resume–Job Text Similarity via TF-IDF and Cosine Similarity.</li>
                      <li>• Identify matched and potentially missing skills using a configurable skill dictionary.</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-[#172033] mb-1">4. Existing vs. Proposed System</h4>
                    <p className="mb-2">
                      <strong className="text-[#172033]">Existing System:</strong> Manual side-by-side comparison is slow and error-prone, while commercial ATS scorers often rely on opaque heuristics, lock results behind paywalls, or confuse keyword overlap with hiring probability.
                    </p>
                    <p>
                      <strong className="text-[#172033]">Proposed System (ResumeIQ):</strong> Transparent, privacy-preserving analysis pipeline that separates statistical vector similarity (TF-IDF + Cosine Similarity) from deterministic rule-based skill extraction, showing the exact mathematical term contributions.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172033] mb-1">5. Conclusion & Future Enhancements</h4>
                    <p>
                      ResumeIQ demonstrates how core NLP and vector-space retrieval techniques solve a practical career-readiness problem with full explainability. Future enhancements include integrating OCR (Tesseract) for scanned resumes, semantic embeddings (Sentence-BERT) for synonym awareness, and section-weighted scoring.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeDocTab === 'architecture' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#64748B] leading-relaxed">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-[#172033] mb-1">System Architecture & Runtime Note</h4>
                    <p className="mb-2">
                      The project includes both the complete <strong className="text-[#172033]">Python FastAPI + Scikit-learn + PyMuPDF</strong> backend in the <code className="text-xs bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E5E7EB] text-[#172033]">/backend</code> directory and an identical <strong className="text-[#172033]">Node/Express + TypeScript TF-IDF</strong> backend in <code className="text-xs bg-[#F8FAFC] px-1.5 py-0.5 rounded border border-[#E5E7EB] text-[#172033]">/server.ts</code>.
                    </p>
                    <p>
                      Because the hosted Google AI Studio preview container runs Node.js on port 3000 without Python <code className="text-xs font-mono">pip</code> packages installed, the live preview executes the mathematical TF-IDF + Cosine Similarity + PDF extraction pipeline via <code className="text-xs font-mono">/server.ts</code>, while providing the full Python FastAPI codebase in <code className="text-xs font-mono">/backend</code> for local execution.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172033] mb-1">Methodology Breakdown</h4>
                    <ul className="space-y-1">
                      <li>• <strong className="text-[#172033]">ML / Statistical NLP:</strong> Smoothed TF-IDF vectorization (<code className="text-xs font-mono">idf(t) = ln((1+N)/(1+df(t))) + 1</code>), L2 vector normalization, and Cosine Similarity inner product.</li>
                      <li>• <strong className="text-[#172033]">Rule-Based NLP:</strong> Lookbehind/lookahead regex skill extraction, privacy-masked email extraction, and heuristic suggestions.</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#172033] mb-2">Running the Python FastAPI Backend Locally</h4>
                  <pre className="p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-mono text-[#172033] overflow-x-auto leading-relaxed">
{`# 1. Navigate to the Python backend folder
cd backend

# 2. Create a virtual environment & install dependencies
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# 3. Start the FastAPI server (runs on port 8000)
uvicorn main:app --reload --port 8000

# 4. In a second terminal, run the React frontend
npm install
npm run dev`}
                  </pre>
                </div>
              </div>
            )}

            {activeDocTab === 'testing' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B] font-semibold">
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Test Scenario</th>
                      <th className="py-2.5 px-4">Expected Behavior</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-[#64748B]">
                    <tr>
                      <td className="py-2.5 px-4 font-mono">01</td>
                      <td className="py-2.5 px-4 font-medium text-[#172033]">Valid resume + matching JD</td>
                      <td className="py-2.5 px-4">High similarity score, matched ML/NLP skills identified, tailored suggestions</td>
                      <td className="py-2.5 px-4 font-mono text-[#16A34A] font-semibold">Verified (Unit + E2E)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono">02</td>
                      <td className="py-2.5 px-4 font-medium text-[#172033]">Resume with only a few relevant skills</td>
                      <td className="py-2.5 px-4">Moderate/low score, partial match (e.g. React, Git), lists potentially missing backend/ML skills</td>
                      <td className="py-2.5 px-4 font-mono text-[#16A34A] font-semibold">Verified (Unit + E2E)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono">03</td>
                      <td className="py-2.5 px-4 font-medium text-[#172033]">No meaningful overlap (Culinary vs. ML)</td>
                      <td className="py-2.5 px-4">Near-zero similarity (&lt; 5%), 0 matched skills, clear empty state</td>
                      <td className="py-2.5 px-4 font-mono text-[#16A34A] font-semibold">Verified (Unit + E2E)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono">04</td>
                      <td className="py-2.5 px-4 font-medium text-[#172033]">Empty job description</td>
                      <td className="py-2.5 px-4">Blocked by validation with clear error message before analysis</td>
                      <td className="py-2.5 px-4 font-mono text-[#16A34A] font-semibold">Verified (Unit + E2E)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono">05</td>
                      <td className="py-2.5 px-4 font-medium text-[#172033]">Invalid file type (non-PDF)</td>
                      <td className="py-2.5 px-4">Rejected with readable error stating only PDF files are accepted</td>
                      <td className="py-2.5 px-4 font-mono text-[#16A34A] font-semibold">Verified (Unit + API)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono">06</td>
                      <td className="py-2.5 px-4 font-medium text-[#172033]">Unreadable or image-only PDF</td>
                      <td className="py-2.5 px-4">Returns HTTP 422 explaining no readable text was found (OCR not enabled)</td>
                      <td className="py-2.5 px-4 font-mono text-[#16A34A] font-semibold">Verified (Unit + E2E)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono">07</td>
                      <td className="py-2.5 px-4 font-medium text-[#172033]">Large PDF exceeding 5 MB limit</td>
                      <td className="py-2.5 px-4">Blocked on client &amp; server (Multer LIMIT_FILE_SIZE) with 5 MB limit message</td>
                      <td className="py-2.5 px-4 font-mono text-[#16A34A] font-semibold">Verified (Client + API)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-mono">08</td>
                      <td className="py-2.5 px-4 font-medium text-[#172033]">Second analysis after resetting</td>
                      <td className="py-2.5 px-4">Clears previous file &amp; results cleanly; subsequent analysis computes fresh metrics</td>
                      <td className="py-2.5 px-4 font-mono text-[#16A34A] font-semibold">Verified (E2E)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeDocTab === 'viva' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VIVA_QUESTIONS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E5E7EB]"
                  >
                    <h4 className="text-sm font-bold text-[#172033] mb-1.5">
                      {item.q}
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="py-12 px-6 bg-[#FFFFFF] border-t border-[#E5E7EB]">
        <div className="max-w-[1160px] mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E5E7EB]">
            <div>
              <a
                href="#home"
                onClick={(e) => handleLinkClick(e, 'home')}
                className="inline-flex items-center gap-2 text-base font-bold text-[#172033] mb-1"
              >
                <FileSearch className="w-4 h-4 text-[#6D5EF7]" aria-hidden="true" />
                <span>ResumeIQ</span>
              </a>
              <p className="text-xs text-[#64748B]">
                An educational AI/ML project.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-[#64748B]">
              <a
                href="#home"
                onClick={(e) => handleLinkClick(e, 'home')}
                className="hover:text-[#172033] transition-colors"
              >
                Home
              </a>
              <a
                href="#analyze-workspace"
                onClick={(e) => handleLinkClick(e, 'analyze-workspace')}
                className="hover:text-[#172033] transition-colors"
              >
                Analyze Resume
              </a>
              <a
                href="#about"
                onClick={(e) => handleLinkClick(e, 'about')}
                className="hover:text-[#172033] transition-colors"
              >
                About
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#64748B]">
            <p>
              Privacy Note: Uploaded PDF resumes are processed in memory strictly for immediate text analysis and are never stored on disk or retained after your request completes.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
