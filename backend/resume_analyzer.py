"""
Core NLP and Machine Learning module for ResumeIQ.
Uses PyMuPDF (fitz) for PDF text extraction and Scikit-learn's TfidfVectorizer
and cosine_similarity for resume-to-job text comparison.
"""

import re
from typing import Dict, Any, List, Tuple
import fitz  # PyMuPDF
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from sklearn.metrics.pairwise import cosine_similarity

from skill_dictionary import extract_skills_from_text


CUSTOM_STOP_WORDS = list(
    ENGLISH_STOP_WORDS.union(
        {
            "looking", "seeking", "join", "team", "role", "position",
            "candidate", "work", "working", "must", "able", "including",
            "within", "across", "using", "used",
        }
    )
)

# Custom token pattern that preserves technical tokens such as C++, C#, .NET, Node.js, Scikit-learn, CI/CD
TECHNICAL_TOKEN_PATTERN = r"(?:\.net|c\+\+|c#|ci/cd|[a-zA-Z0-9]+(?:[._-][a-zA-Z0-9]+)*)"


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Tuple[str, int]:
    """
    Extracts readable text from a PDF byte stream using PyMuPDF (fitz).
    Handles multi-page PDFs and raises ValueError for unreadable or image-only PDFs.
    """
    if not pdf_bytes:
        raise ValueError("The uploaded PDF file is empty.")

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError("Could not read the PDF file. Ensure it is a valid, unencrypted PDF.") from exc

    page_count = len(doc)
    if page_count == 0:
        raise ValueError("The uploaded PDF contains no pages.")

    pages_text: List[str] = []
    for page in doc:
        raw_page_text = page.get_text("text") or ""
        cleaned = re.sub(r"[ \t]+", " ", raw_page_text)
        cleaned = re.sub(r"\n\s*\n+", "\n", cleaned).strip()
        if cleaned:
            pages_text.append(cleaned)

    doc.close()
    combined = "\n\n".join(pages_text).strip()

    if not combined or len(re.sub(r"\s+", "", combined)) < 15:
        raise ValueError(
            "No readable text could be extracted from this PDF. "
            "It appears to be an empty or scanned image-only PDF (OCR is not enabled)."
        )

    return combined, page_count


def mask_email_address(email: str) -> str:
    parts = email.strip().split("@")
    if len(parts) != 2:
        return "Not detected"
    local, domain = parts
    if len(local) <= 2:
        return f"{local[0] if local else '*'}***@{domain}"
    return f"{local[:2]}***{local[-1]}@{domain}"


def compute_tfidf_similarity(resume_text: str, job_text: str) -> Dict[str, Any]:
    """
    Vectorizes resume and job description using Scikit-learn's TfidfVectorizer
    and computes cosine similarity.
    """
    vectorizer = TfidfVectorizer(
        lowercase=True,
        token_pattern=TECHNICAL_TOKEN_PATTERN,
        stop_words=CUSTOM_STOP_WORDS,
        sublinear_tf=True,
        smooth_idf=True,
        norm="l2",
    )

    tfidf_matrix = vectorizer.fit_transform([resume_text, job_text])
    sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    raw_cosine = float(np.clip(sim_matrix[0][0], 0.0, 1.0))
    similarity_percentage = round(raw_cosine * 100.0, 1)

    feature_names = vectorizer.get_feature_names_out()
    r_vec = tfidf_matrix[0].toarray().flatten()
    j_vec = tfidf_matrix[1].toarray().flatten()

    overlapping = []
    missing_job_terms = []

    for idx, term in enumerate(feature_names):
        r_val = float(r_vec[idx])
        j_val = float(j_vec[idx])
        if r_val > 0 and j_val > 0:
            prod = r_val * j_val
            overlapping.append(
                {
                    "term": term,
                    "resumeTfIdf": round(r_val, 4),
                    "jobTfIdf": round(j_val, 4),
                    "product": round(prod, 4),
                }
            )
        elif j_val > 0 and r_val == 0 and not term.isdigit():
            missing_job_terms.append((term, j_val))

    overlapping.sort(key=lambda x: x["product"], reverse=True)
    missing_job_terms.sort(key=lambda x: x[1], reverse=True)

    return {
        "similarityPercentage": similarity_percentage,
        "cosineSimilarityRaw": round(raw_cosine, 4),
        "vocabularySize": len(feature_names),
        "resumeTokenCount": int(np.count_nonzero(r_vec)),
        "jobTokenCount": int(np.count_nonzero(j_vec)),
        "topOverlappingTerms": overlapping[:10],
        "topMissingJobKeywords": [t[0] for t in missing_job_terms[:8]],
    }


def extract_resume_overview(resume_text: str, resume_skills: List[str], page_count: int) -> Dict[str, Any]:
    lines = [line.strip() for line in resume_text.splitlines() if line.strip()]

    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", resume_text)
    email_masked = mask_email_address(email_match.group(0)) if email_match else "Not detected"

    edu_pattern = re.compile(
        r"\b(b\.?tech|m\.?tech|b\.?s\.?|m\.?s\.?|b\.?e\.?|b\.?sc|m\.?sc|ph\.?d|bachelor|master|university|institute of technology|college|computer science|artificial intelligence|data science|engineering|gpa|cgpa)\b",
        re.IGNORECASE,
    )
    education: List[str] = []
    for line in lines:
        if edu_pattern.search(line) and len(line) <= 140:
            cleaned = re.sub(r"^[•\-*]\s*", "", line).strip()
            if cleaned not in education:
                education.append(cleaned)
        if len(education) >= 3:
            break

    exp_terms = [
        "Intern", "Internship", "Software Engineer", "Machine Learning Engineer", "Data Analyst",
        "Research Assistant", "Developer", "Full Stack", "Backend", "Frontend", "Developed",
        "Engineered", "Implemented", "Deployed", "Optimized", "Built", "Automated", "Collaborated",
        "Production", "Pipeline", "Architecture",
    ]
    experience_keywords = [
        term for term in exp_terms if re.search(rf"\b{re.escape(term)}\b", resume_text, re.IGNORECASE)
    ]

    proj_pattern = re.compile(
        r"\b(project|certified|certification|certificate|capstone|aws certified|coursera|udemy|stanford|deeplearning\.ai|hackathon|winner|published|publication|system|analyzer|classifier|dashboard|platform)\b",
        re.IGNORECASE,
    )
    projects: List[str] = []
    for line in lines:
        if proj_pattern.search(line) and 12 <= len(line) <= 130:
            cleaned = re.sub(r"^[•\-*]\s*", "", line).strip()
            if not re.match(r"^(projects|certifications|academic projects|personal projects|experience|work experience)$", cleaned, re.IGNORECASE):
                if cleaned not in projects:
                    projects.append(cleaned)
        if len(projects) >= 4:
            break

    word_count = len(resume_text.split())

    return {
        "emailMasked": email_masked,
        "education": education if education else ["Not detected"],
        "relevantSkills": resume_skills if resume_skills else ["Not detected"],
        "experienceKeywords": experience_keywords[:10] if experience_keywords else ["Not detected"],
        "projectsAndCertifications": projects if projects else ["Not detected"],
        "wordCount": word_count,
        "pageCount": page_count,
    }


def generate_improvement_suggestions(
    similarity_percentage: float,
    matching_skills: List[str],
    missing_skills: List[str],
    overview: Dict[str, Any],
    top_missing_keywords: List[str],
    resume_text: str,
) -> List[Dict[str, str]]:
    suggestions: List[Dict[str, str]] = []

    if missing_skills:
        sample = ", ".join(missing_skills[:4])
        extra = f" (and {len(missing_skills) - 4} more)" if len(missing_skills) > 4 else ""
        suggestions.append(
            {
                "id": "missing-skills",
                "category": "Skills",
                "title": "Review potentially missing job skills",
                "description": (
                    f"The job description mentions {sample}{extra}, which were not detected in your resume. "
                    "If you genuinely possess experience with any of these tools, list them explicitly in your Skills or Projects section."
                ),
            }
        )
    elif matching_skills:
        suggestions.append(
            {
                "id": "strong-skill-coverage",
                "category": "Skills",
                "title": "Contextualize matched technical skills in bullet points",
                "description": (
                    f"Your resume matches all {len(matching_skills)} detected skills from the job description. "
                    "Strengthen this further by demonstrating how you applied each skill inside project or internship outcomes."
                ),
            }
        )

    has_metrics = re.search(
        r"\b(\d+%|\d+x|\d+\+|\bms\b|accuracy|latency|f1-score|precision|recall|reduced|improved|increased)\b",
        resume_text,
        re.IGNORECASE,
    )
    if not has_metrics:
        suggestions.append(
            {
                "id": "measurable-achievements",
                "category": "Impact",
                "title": "Add measurable outcomes to project descriptions",
                "description": (
                    "No quantitative metrics (such as percentage improvements, dataset sizes, model accuracy, or response times) were detected. "
                    "Where accurate, add concrete figures to illustrate the scale and outcome of your work."
                ),
            }
        )
    else:
        suggestions.append(
            {
                "id": "expand-metrics",
                "category": "Impact",
                "title": "Ensure every major project includes a clear outcome metric",
                "description": (
                    "Your resume already includes quantitative indicators. Verify that each technical project and role pairs the action taken "
                    "with a measurable engineering or analytical outcome."
                ),
            }
        )

    if overview["projectsAndCertifications"][0] == "Not detected":
        suggestions.append(
            {
                "id": "add-relevant-projects",
                "category": "Projects",
                "title": "Include specific academic or practical projects",
                "description": (
                    "Distinct project entries or certifications were not clearly detected. Adding a dedicated 'Projects' section "
                    "describing relevant coursework or mini-projects helps demonstrate hands-on capability."
                ),
            }
        )
    elif missing_skills:
        suggestions.append(
            {
                "id": "align-project-descriptions",
                "category": "Projects",
                "title": "Highlight target-role technologies in your existing projects",
                "description": (
                    f"You have {len(overview['projectsAndCertifications'])} detected project/certification line(s). "
                    "Review whether any of your completed projects utilized tools relevant to this target role and mention the specific libraries used."
                ),
            }
        )

    if top_missing_keywords:
        top_terms = ", ".join(top_missing_keywords[:4])
        suggestions.append(
            {
                "id": "keyword-alignment",
                "category": "Keywords",
                "title": "Improve visibility of job-relevant terminology",
                "description": (
                    f"Prominent terms from the job description such as '{top_terms}' do not appear in your resume. "
                    "Mirror the employer's phrasing where it accurately describes your background."
                ),
            }
        )

    return suggestions[:5]


def analyze_resume_and_job(resume_text: str, job_description: str, page_count: int = 1) -> Dict[str, Any]:
    tfidf_stats = compute_tfidf_similarity(resume_text, job_description)
    resume_skills = extract_skills_from_text(resume_text)
    job_skills = extract_skills_from_text(job_description)

    resume_skill_set = set(resume_skills)
    matching_skills = [s for s in job_skills if s in resume_skill_set]
    missing_skills = [s for s in job_skills if s not in resume_skill_set]

    overview = extract_resume_overview(resume_text, resume_skills, page_count)
    suggestions = generate_improvement_suggestions(
        tfidf_stats["similarityPercentage"],
        matching_skills,
        missing_skills,
        overview,
        tfidf_stats["topMissingJobKeywords"],
        resume_text,
    )

    return {
        "similarityPercentage": tfidf_stats["similarityPercentage"],
        "matchingSkills": matching_skills,
        "missingSkills": missing_skills,
        "resumeSkills": resume_skills,
        "jobSkills": job_skills,
        "totalMatchedSkills": len(matching_skills),
        "totalJobSkills": len(job_skills),
        "overview": overview,
        "suggestions": suggestions,
        "details": {
            "vocabularySize": tfidf_stats["vocabularySize"],
            "resumeTokenCount": tfidf_stats["resumeTokenCount"],
            "jobTokenCount": tfidf_stats["jobTokenCount"],
            "cosineSimilarityRaw": tfidf_stats["cosineSimilarityRaw"],
            "topOverlappingTerms": tfidf_stats["topOverlappingTerms"],
            "topMissingJobKeywords": tfidf_stats["topMissingJobKeywords"],
            "mlComponentsUsed": [
                "Scikit-learn TfidfVectorizer (Unigram feature representation with smoothed IDF & L2 normalization)",
                "Scikit-learn cosine_similarity (Vector space inner product measuring textual angle between Resume & Job Description)",
            ],
            "ruleBasedComponentsUsed": [
                "Token-Boundary Skill Extraction (Phrase-aware regex matching against configurable skill dictionary)",
                "Resume Entity Extraction (Privacy-masked email detection, education, action verbs, and project headers)",
                "Deterministic Improvement Heuristics (Data-driven recommendations based on missing skills and metric patterns)",
            ],
        },
    }
