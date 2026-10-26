# ResumeIQ — AI-Powered Resume Analyzer

An educational AI/ML web application that helps students and job seekers evaluate how well their PDF resumes align with a target job description using **Natural Language Processing (NLP)**, **TF-IDF Vectorization**, **Cosine Similarity**, and **Token-Boundary Skill Extraction**.

---

## 1. Project Abstract

**ResumeIQ** is an explainable AI/ML mini-project designed to analyze a candidate's PDF resume against a target job description. Unlike opaque commercial resume scorers that generate arbitrary hiring probability claims, ResumeIQ implements a transparent, mathematically grounded pipeline. It extracts readable text from multi-page PDF documents, normalizes and tokenizes text while preserving technical notation (`C++`, `C#`, `.NET`, `Node.js`, `Scikit-learn`), vectorizes documents using **Term Frequency–Inverse Document Frequency (TF-IDF)**, and computes **Cosine Similarity** to measure lexical overlap. In parallel, a configurable phrase- and token-boundary skill extraction engine identifies **Matching Skills** and **Potentially Missing Skills**, extracts structured resume overview details (with privacy-masked email detection), and generates actionable improvement suggestions.

---

## 2. Problem Statement

Job seekers and college students applying for internships or full-time engineering roles frequently struggle to tailor their resumes to specific job descriptions.
1. Manual comparison between a resume and a lengthy job posting is tedious and prone to overlooking critical domain keywords or technical tools.
2. Many existing commercial Applicant Tracking System (ATS) scanners act as black boxes—providing unexplained single-number scores, conflating text similarity with hiring probability, or encouraging candidates to stuff keywords they do not genuinely possess.
3. Standard text tokenizers often strip punctuation, corrupting crucial technical terms such as `C++`, `C#`, `.NET`, or `Node.js`, or falsely matching substrings such as `Java` inside `JavaScript`.

---

## 3. Project Objectives

- **Extract Readable PDF Text:** Parse single- and multi-page PDF resumes reliably while detecting empty or scanned image-only PDFs gracefully.
- **Technical-Aware Text Preprocessing:** Normalize whitespace and lowercase text while preserving technical symbols (`C++`, `C#`, `.NET`, `Node.js`, `Scikit-learn`, `CI/CD`).
- **Explainable Text Similarity:** Compute `Resume–Job Text Similarity` (`Cosine Similarity × 100`, rounded to 1 decimal place) and expose the top contributing TF-IDF terms.
- **Accurate Skill Gap Analysis:** Identify matching job skills and potentially missing job skills using a maintainable, expandable skill dictionary with strict token boundaries.
- **Actionable Guidance:** Generate 3 to 5 practical resume improvement suggestions grounded strictly in detected resume data without fabricating candidate qualifications.

---

## 4. Existing System vs. Proposed System

| Feature | Existing Systems | Proposed System (ResumeIQ) |
| :--- | :--- | :--- |
| **Transparency** | Black-box percentages with hidden proprietary heuristics. | Full mathematical transparency showing TF-IDF weights and cosine contributions. |
| **Score Meaning** | Often marketed misleadingly as "Hiring Probability" or pass/fail verdicts. | Explicitly labeled **Resume–Job Text Similarity** measuring lexical overlap. |
| **Technical Terms** | Naive punctuation stripping breaks `C++`, `C#`, `.NET` or confuses `Java` with `JavaScript`. | Custom lookbehind/lookahead token boundaries preserve technical notation. |
| **Privacy** | Often stores resumes on third-party servers or sends PII to external LLMs automatically. | Processes PDFs strictly in volatile memory (RAM), masks detected emails, and requires explicit user consent before optional AI phrasing. |

---

## 5. System Architecture

```
+-----------------------------------------------------------------------+
|                        FRONTEND (React + TypeScript)                  |
|  - Bright, Minimal SaaS UI (Tailwind CSS + Lucide Icons)              |
|  - Drag-and-Drop PDF Uploader (Type & 5 MB Size Validation)           |
|  - Job Description Editor & Real PDF Test Scenario Generator          |
|  - Results Dashboard (Similarity Gauge, Skill Gaps, Overview, Details)|
+-----------------------------------+-----------------------------------+
                                    |
                           POST /api/analyze
                    (multipart/form-data: resume, jobDescription)
                                    |
                                    v
+-----------------------------------------------------------------------+
|                     BACKEND REST API LAYER                            |
|  - Python FastAPI (/backend/main.py) OR Node/Express (/server.ts)     |
|  - In-Memory Multipart Validation (PDF MIME check, <= 5 MB limit)     |
+-----------------------------------+-----------------------------------+
                                    |
        +---------------------------+---------------------------+
        |                                                       |
        v                                                       v
+-------------------------------+               +-------------------------------+
|  STATISTICAL ML / NLP ENGINE  |               |    RULE-BASED NLP ENGINE      |
|  - Technical Tokenizer        |               |  - Configurable Skill Dict    |
|  - Stopword Filtering         |               |  - Lookbehind/Lookahead Regex |
|  - Smoothed TF-IDF Vectorizer |               |  - Privacy-Masked Email Regex |
|  - L2 Vector Normalization    |               |  - Education & Project Parser |
|  - Cosine Similarity Scoring  |               |  - Improvement Heuristics     |
+-------------------------------+               +-------------------------------+
```

### Runtime Environment Note
- **Python FastAPI Backend (`/backend/`):** Contains the complete Python implementation (`main.py`, `resume_analyzer.py`, `skill_dictionary.py`, `requirements.txt`) powered by **FastAPI**, **PyMuPDF (`fitz`)**, **Scikit-learn (`TfidfVectorizer`, `cosine_similarity`)**, and **NumPy**.
- **Google AI Studio Live Preview (`/server.ts` & `/src/lib/`):** Because the hosted AI Studio preview container executes a Node.js runtime on port 3000 without Python `pip` packages installed, `/server.ts` and `/src/lib/analyzer.ts` implement the exact same smoothed TF-IDF + L2-normalized Cosine Similarity + multi-page PDF text extraction pipeline in TypeScript so the live web preview works end-to-end out of the box.

---

## 6. Methodology (ML vs. Rule-Based Logic)

### A. Machine Learning & Statistical Vector Space Modeling
1. **TF-IDF Vectorization:**
   Each document $d \in \{\text{Resume}, \text{Job Description}\}$ is converted into a numerical feature vector where each term $t$ is weighted by:
   $$\text{idf}(t) = \ln\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$$
   $$\text{tfidf}(t, d) = (1 + \ln(\text{tf}(t, d))) \times \text{idf}(t)$$
2. **L2 Normalization & Cosine Similarity:**
   Each TF-IDF vector is normalized to unit length ($\|\mathbf{v}\|_2 = 1$), and the cosine of the angle between the Resume vector $\mathbf{r}$ and Job Description vector $\mathbf{j}$ is calculated:
   $$\text{Cosine Similarity} = \frac{\mathbf{r} \cdot \mathbf{j}}{\|\mathbf{r}\|_2 \|\mathbf{j}\|_2}$$
   $$\text{Similarity Percentage} = \text{round}(\text{Cosine Similarity} \times 100, 1)$$

### B. Rule-Based NLP Extraction
1. **Phrase & Token-Boundary Skill Matching:** Uses negative lookbehind `(?<![a-z0-9_.+#-])` and negative lookahead `(?![a-z0-9_+#-])` expressions against a curated skill dictionary (`SKILL_DICTIONARY`).
2. **Entity & Section Parsing:** Extracts privacy-masked email addresses (e.g., `aa***a@iitb.ac.in`), academic degrees/institutions, engineering action verbs, and project/certification lines.
3. **Deterministic Improvement Heuristics:** Evaluates missing job skills, quantitative metric presence (`%`, latency/accuracy indicators), and high-weight unaligned job terms to produce 3–5 tailored suggestions.

---

## 7. Functional & Non-Functional Requirements

### Functional Requirements
- Accept PDF resumes up to 5 MB via drag-and-drop or file browser.
- Extract readable text across single or multiple PDF pages and detect empty/image-only PDFs.
- Accept multiline job descriptions and validate against empty or overly brief input.
- Compute and display the `Resume–Job Text Similarity` score, `Matching Skills`, `Potentially Missing Skills`, `Resume Overview`, and `Actionable Improvement Suggestions`.
- Provide functional `Analyze Another Resume`, `Edit Job Description`, and `View Analysis Details` actions.

### Non-Functional Requirements
- **Privacy & Security:** Process uploaded PDFs strictly in memory without disk retention; mask extracted email addresses; keep API keys strictly server-side.
- **Performance:** Complete PDF text extraction and TF-IDF vector analysis in under 1.5 seconds for typical 1–5 page resumes.
- **Usability & Accessibility:** Bright, high-contrast light theme with keyboard navigation, visible focus states, and responsive layout across desktop, tablet, and mobile viewports.

---

## 8. Project Structure

```
resumeiq/
├── backend/
│   ├── main.py                # FastAPI server exposing POST /api/analyze
│   ├── resume_analyzer.py     # PyMuPDF text extraction + Scikit-learn TF-IDF & Cosine Similarity
│   ├── skill_dictionary.py    # Configurable skill dictionary & regex boundary matcher
│   └── requirements.txt       # Python dependencies (fastapi, PyMuPDF, scikit-learn, numpy)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx               # Responsive top navigation bar
│   │   ├── HeroSection.tsx          # Hero banner with quick navigation
│   │   ├── ResultsDashboard.tsx     # Similarity gauge, skill gap panels, overview, details
│   │   └── HowItWorksAndAbout.tsx   # Workflow steps, academic report tabs, viva Q&A, footer
│   ├── data/
│   │   └── projectData.ts           # Real PDF test scenario builder & viva dataset
│   ├── lib/
│   │   ├── analyzer.ts              # Smoothed TF-IDF, Cosine Similarity, and entity parser
│   │   ├── analyzer.test.ts         # Automated unit tests across all 8 test scenarios
│   │   ├── pdfBuilder.ts            # Standards-compliant PDF 1.4 binary generator
│   │   ├── pdfExtractor.ts          # Multi-page PDF text extractor
│   │   └── skillDictionary.ts       # Expandable skill dictionary
│   ├── App.tsx                      # Main application workspace
│   ├── index.css                    # Tailwind CSS & typography rules
│   └── main.tsx                     # React entry point
├── server.ts                  # Express + Vite full-stack server for AI Studio runtime
├── package.json
└── README.md
```

---

## 9. Installation & Execution Instructions

### Option A: Running Full-Stack Node/React App (AI Studio & Local Default)

```bash
# 1. Install dependencies
npm install

# 2. Run automated unit tests (verifies TF-IDF, skill matching, and PDF extraction)
npx --yes tsx --test src/lib/analyzer.test.ts

# 3. Start the development server on http://localhost:3000
npm run dev
```

### Option B: Running the Python FastAPI Backend Locally

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install Python dependencies (FastAPI, PyMuPDF, Scikit-learn, NumPy)
pip install -r requirements.txt

# 4. Start the FastAPI server on http://localhost:8000
uvicorn main:app --reload --port 8000
```

---

## 10. Testing Plan & Verification Matrix

| # | Test Scenario | Input Description | Expected Result | Status |
| :- | :--- | :--- | :--- | :--- |
| 1 | **Valid resume + matching JD** | 2-page AIML student PDF resume + NLP/ML Engineer JD | High similarity score (~45–60%), 12+ matched skills, 3–5 suggestions | **Passed** |
| 2 | **Resume with few relevant skills** | Frontend student PDF resume + Full-Stack AI Engineer JD | Partial skill match (HTML, CSS, JS, React, Git), lists missing backend/ML skills | **Passed** |
| 3 | **No meaningful overlap** | Culinary chef PDF resume + Deep Learning Systems JD | Near-zero similarity (< 5%), 0 matched skills, helpful empty state | **Passed** |
| 4 | **Empty job description** | Valid PDF resume + blank JD textarea | Validation error message displayed; submission prevented | **Passed** |
| 5 | **Invalid file type** | Uploading a `.txt` or non-PDF buffer | Rejected immediately with invalid file format message | **Passed** |
| 6 | **Unreadable / image-only PDF** | Valid PDF container with empty text stream | Returns HTTP 422 with clear message that no readable text could be extracted | **Passed** |
| 7 | **Large PDF (> 5 MB)** | File exceeding `5 * 1024 * 1024` bytes | Blocked on client and server (`LIMIT_FILE_SIZE`) with 5 MB limit error | **Passed** |
| 8 | **Second analysis after reset** | Clicking `Analyze Another Resume` then running a new scenario | Clears previous state and computes fresh results for the new input | **Passed** |

---

## 11. Conclusion & Future Enhancements

**Conclusion:** ResumeIQ successfully demonstrates how classical Natural Language Processing and vector-space information retrieval (`TF-IDF` + `Cosine Similarity`) can be combined with deterministic rule-based skill extraction to provide transparent, privacy-first career feedback for students and job seekers.

**Future Enhancements:**
1. **Optical Character Recognition (OCR):** Integrate Tesseract OCR to extract text from scanned image-only PDF resumes.
2. **Semantic Embeddings:** Incorporate Sentence-BERT (`all-MiniLM-L6-v2`) alongside TF-IDF to capture semantic equivalence beyond exact keyword matches.
3. **Section-Aware Weighting:** Assign higher weights to skills demonstrated inside `Experience` and `Projects` sections compared to standalone skill lists.
