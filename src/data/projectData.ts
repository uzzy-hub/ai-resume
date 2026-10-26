import { createRealPdfBytes } from '../lib/pdfBuilder';

export interface DemoScenario {
  id: string;
  label: string;
  shortDesc: string;
  fileName: string;
  pagesText: string[];
  jobDescription: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'strong-ml-match',
    label: 'Scenario 1: Strong ML Match',
    shortDesc: '2-page AIML student resume matched against an NLP & Machine Learning Engineer role.',
    fileName: 'Aarav_Sharma_AIML_Resume.pdf',
    pagesText: [
      `AARAV SHARMA
Email: aarav.sharma@iitb.ac.in | Location: Mumbai, India | GitHub: github.com/aarav-ml

EDUCATION
Bachelor of Technology (B.Tech) in Computer Science and Engineering (AIML Specialization)
Indian Institute of Technology — CGPA: 8.92 / 10.0 (2022 - 2026)

TECHNICAL SKILLS
Programming: Python, SQL, C++, JavaScript, TypeScript, HTML, CSS
Machine Learning & NLP: Machine Learning, Deep Learning, Natural Language Processing (NLP), Scikit-learn, Pandas, NumPy, PyTorch, TensorFlow, Data Analysis, Statistics, Data Visualization
Backend & MLOps: FastAPI, Flask, REST API, Git, Docker, Linux, AWS
Professional: Problem Solving, Communication, Agile, Teamwork`,
      `INTERNSHIP EXPERIENCE
Machine Learning Engineer Intern — DataSense AI Labs (May 2025 - Aug 2025)
- Engineered an automated document classification and text similarity pipeline using Python, Scikit-learn, TF-IDF vectorization, and Cosine Similarity across 50,000+ technical documents.
- Improved classification F1-score by 18.4% and reduced inference latency by 35% by optimizing feature extraction and L2 normalization.
- Deployed REST API microservices using FastAPI and Docker containers on AWS EC2.

ACADEMIC PROJECTS & CERTIFICATIONS
- ResumeIQ Automated Resume Analyzer Project: Built an explainable NLP resume evaluation system using PyMuPDF, Scikit-learn TF-IDF vectorization, and React.
- Clinical Sentiment & Entity Extractor: Developed a transformer and TF-IDF hybrid NLP pipeline in PyTorch and Pandas with 91.2% accuracy.
- DeepLearning.AI Machine Learning Specialization Certificate (Coursera, 2025)`
    ],
    jobDescription: `Machine Learning & NLP Engineer (Entry Level / New Grad)

About the Role:
We are seeking a motivated Machine Learning Engineer to join our Applied NLP team. You will design, evaluate, and deploy text analysis pipelines, document similarity engines, and scalable backend APIs.

Responsibilities:
- Build and refine Natural Language Processing (NLP) workflows including text preprocessing, tokenization, TF-IDF vectorization, and semantic similarity scoring.
- Perform exploratory data analysis, statistical modeling, and feature engineering using Python, Pandas, NumPy, and Scikit-learn.
- Train and evaluate Deep Learning models in PyTorch or TensorFlow and track measurable accuracy and latency metrics.
- Expose machine learning models via clean REST APIs using FastAPI and package services with Docker for deployment on AWS or Kubernetes.
- Collaborate with cross-functional engineering teams using Git, Linux, and Agile workflows.

Required Qualifications & Skills:
- Bachelor's or Master's degree in Computer Science, Artificial Intelligence, Data Science, or Engineering.
- Strong proficiency in Python, SQL, Machine Learning, NLP, Scikit-learn, Pandas, and NumPy.
- Experience with Deep Learning frameworks (PyTorch or TensorFlow) and data analysis.
- Hands-on experience building REST APIs with FastAPI and containerizing applications with Docker and Git.
- Familiarity with AWS cloud services, CI/CD pipelines, and Kubernetes is a plus.
- Strong Problem Solving and Communication skills.`
  },
  {
    id: 'partial-web-match',
    label: 'Scenario 2: Partial Skill Match',
    shortDesc: 'Frontend web developer resume evaluated against a Full-Stack AI Engineer posting.',
    fileName: 'Priya_Patel_Frontend_Resume.pdf',
    pagesText: [
      `PRIYA PATEL
Email: priya.patel@stateuniv.edu | Portfolio: priyapatel.dev

EDUCATION
Bachelor of Science in Information Technology
State University College of Engineering — GPA: 3.6 / 4.0

SKILLS
Languages & Web: HTML, CSS, JavaScript, TypeScript, React, Tailwind CSS
Tools & Workflow: Git, Agile, Communication, Teamwork

EXPERIENCE & ACADEMIC WORK
Frontend Web Developer Intern — BrightPixel Studio
- Developed responsive user interfaces using React, TypeScript, and Tailwind CSS for client web applications.
- Collaborated with designers to improve page accessibility and component reusability.

PROJECTS
- Campus Event Portal Project: Designed an interactive student event directory using React and REST API integration.`
    ],
    jobDescription: `Full-Stack AI & Data Platform Engineer

We are looking for a Full-Stack Engineer to build data-intensive web dashboards and machine learning backend services.

Required Skills & Qualifications:
- Proficiency in React, TypeScript, JavaScript, HTML, and CSS for frontend development.
- Strong backend development skills using Python, FastAPI, Node.js, and SQL (PostgreSQL).
- Experience integrating Machine Learning, Data Analysis, Pandas, and Scikit-learn pipelines into production web services.
- Working knowledge of Docker, AWS, CI/CD, and Git version control.
- Strong Problem Solving and Communication skills.`
  },
  {
    id: 'low-overlap',
    label: 'Scenario 3: No Meaningful Overlap',
    shortDesc: 'Culinary hospitality resume compared against a Deep Learning & Systems role.',
    fileName: 'Jordan_Lee_Culinary_Resume.pdf',
    pagesText: [
      `JORDAN LEE
Email: jordan.lee@culinaryarts.org

EDUCATION
Diploma in Culinary Arts and Hospitality Management
Metropolitan Culinary Institute

EXPERIENCE
Head Pastry & Artisan Bread Baker — Hearth & Grain Bakery
- Prepared artisan sourdough loaves, laminated pastries, and seasonal dessert menus for 250 daily guests.
- Managed kitchen ingredient inventory, supplier ordering schedules, and food safety compliance standards.`
    ],
    jobDescription: `Senior Machine Learning & Computer Vision Systems Engineer

Responsibilities & Requirements:
- Architect high-throughput Deep Learning and Computer Vision pipelines using Python, C++, PyTorch, and TensorFlow.
- Optimize neural network inference on Linux, Docker, and Kubernetes clusters on AWS.
- Strong foundation in Machine Learning, Scikit-learn, NumPy, SQL, and Git.`
  },
  {
    id: 'empty-image-pdf',
    label: 'Scenario 4: Unreadable / Image-Only PDF',
    shortDesc: 'Generates a valid PDF containing zero extractable text to test error handling.',
    fileName: 'Scanned_Image_Only_Resume.pdf',
    pagesText: [''],
    jobDescription: `Data Scientist & Machine Learning Engineer
Required skills: Python, SQL, Machine Learning, Pandas, NumPy, Scikit-learn, Data Analysis, and Statistics.`
  }
];

export function buildPdfFileFromScenario(scenario: DemoScenario): File {
  const bytes = createRealPdfBytes(scenario.pagesText);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  return new File([blob], scenario.fileName, { type: 'application/pdf' });
}

export interface VivaQuestion {
  q: string;
  a: string;
}

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    q: '1. What is TF-IDF, and why is it used in ResumeIQ instead of simple word counts?',
    a: 'TF-IDF stands for Term Frequency–Inverse Document Frequency. Simple word counts (Bag-of-Words) give high weight to common words that appear frequently across all documents. TF-IDF multiplies how often a term appears in a document (Term Frequency) by how rare it is across the document corpus (Inverse Document Frequency: ln((1 + N) / (1 + df)) + 1), ensuring domain-specific terms like "scikit-learn" or "fastapi" carry meaningful weight while generic words are down-weighted.'
  },
  {
    q: '2. How does Cosine Similarity work mathematically, and why is its output between 0 and 1?',
    a: 'Cosine similarity measures the cosine of the angle between two non-zero TF-IDF vectors A and B in a multi-dimensional vector space: cos(θ) = (A · B) / (||A|| × ||B||). Because TF-IDF term weights are non-negative and L2-normalized (unit length ||A|| = ||B|| = 1), their dot product always lies between 0.0 (completely orthogonal, zero shared vocabulary) and 1.0 (identical normalized term distribution), which we scale to 0.0%–100.0%.'
  },
  {
    q: '3. Does a 65% Resume–Job Text Similarity score mean the candidate has a 65% probability of being hired?',
    a: 'No. The similarity score strictly measures lexical and terminology overlap between the resume text and the job description text. Hiring decisions depend on verified skill depth, interview performance, years of experience, portfolio quality, and human evaluation.'
  },
  {
    q: '4. Which parts of ResumeIQ use Machine Learning/Statistical NLP and which parts use Rule-Based NLP?',
    a: 'Statistical NLP / ML Feature Engineering is used for text vectorization (TF-IDF feature extraction with smoothed IDF and L2 vector normalization) and vector-space Cosine Similarity calculation. Rule-Based NLP is used for token-boundary skill extraction against our configurable skill dictionary, regex-based entity parsing (privacy-masked email, education, experience action verbs, projects), and deterministic improvement heuristics.'
  },
  {
    q: '5. How do you prevent false positives during skill extraction, such as matching "Java" inside "JavaScript" or losing symbols in "C++" and ".NET"?',
    a: 'Standard word-boundary regexes (\\b) fail on non-alphanumeric characters like +, #, and leading dots. We use custom negative lookbehind (?<![a-z0-9_.+#-]) and negative lookahead (?![a-z0-9_+#-]) boundary patterns alongside a custom tokenizer regex so "C++", "C#", ".NET", and "Node.js" remain intact, and "Java" never triggers on "JavaScript".'
  },
  {
    q: '6. Why did you choose not to include a supervised classification model in the baseline system?',
    a: 'Training a supervised hiring or category classifier requires a large, unbiased, labeled dataset of resumes and hiring outcomes. Arbitrary synthetic labels can introduce severe bias and misleading predictions. Using unsupervised TF-IDF vectorization + Cosine Similarity alongside explainable skill matching makes every score transparent, reproducible, and verifiable.'
  },
  {
    q: '7. Why are unmatched job skills labeled "Potentially Missing Skills" instead of "Absent Skills"?',
    a: 'A candidate might possess a skill without writing its exact keyword in the resume, or might have described it using an uncommon phrasing. Labeling them "Potentially Missing Skills" reminds the user to verify the list and only add skills they genuinely possess.'
  },
  {
    q: '8. How does the application handle scanned or image-only PDFs?',
    a: 'During PDF text extraction (via PyMuPDF in Python and pdfjs-dist in Node), the system extracts text streams page by page. If the extracted character count across all pages is empty or below a minimal readable threshold (< 15 non-whitespace characters), the backend returns HTTP 422 with a clear message explaining that the PDF appears to be empty or a scanned image-only file and OCR is not enabled.'
  },
  {
    q: '9. What privacy precautions are implemented when handling uploaded resumes?',
    a: 'First, uploaded PDFs are processed strictly in volatile memory (RAM) and are never written to disk or stored in a database. Second, detected email addresses are automatically masked (e.g., aa***a@iitb.ac.in) in the overview display. Third, resume content is never transmitted to external LLM APIs automatically.'
  },
  {
    q: '10. What are the limitations of TF-IDF and Cosine Similarity, and how can this project be enhanced in the future?',
    a: 'TF-IDF is a lexical representation and cannot automatically recognize synonyms unless mapped (e.g., " container orchestration " vs. "Kubernetes"). Future enhancements include integrating dense transformer embeddings (Sentence-BERT), Optical Character Recognition (Tesseract OCR) for scanned PDFs, and section-weighted scoring.'
  }
];
