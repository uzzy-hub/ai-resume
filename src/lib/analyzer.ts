import { extractSkillsFromText, SKILL_DICTIONARY } from './skillDictionary';

export interface TermContribution {
  term: string;
  resumeTfIdf: number;
  jobTfIdf: number;
  product: number;
}

export interface ResumeOverview {
  emailMasked: string;
  education: string[];
  relevantSkills: string[];
  experienceKeywords: string[];
  projectsAndCertifications: string[];
  wordCount: number;
  pageCount: number;
}

export interface SuggestionItem {
  id: string;
  title: string;
  description: string;
  category: 'Skills' | 'Projects' | 'Experience' | 'Keywords' | 'Impact';
}

export interface AnalysisDetails {
  vocabularySize: number;
  resumeTokenCount: number;
  jobTokenCount: number;
  cosineSimilarityRaw: number;
  topOverlappingTerms: TermContribution[];
  topMissingJobKeywords: string[];
  mlComponentsUsed: string[];
  ruleBasedComponentsUsed: string[];
}

export interface AnalysisResult {
  similarityPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  resumeSkills: string[];
  jobSkills: string[];
  totalMatchedSkills: number;
  totalJobSkills: number;
  overview: ResumeOverview;
  suggestions: SuggestionItem[];
  details: AnalysisDetails;
}

const ENGLISH_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for',
  'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just',
  'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
  'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which',
  'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'looking', 'seeking', 'join', 'team', 'role', 'position', 'candidate',
  'work', 'working', 'must', 'able', 'including', 'within', 'across', 'using', 'used'
]);

/**
 * Normalizes whitespace and preserves technical terms like C++, C#, .NET, Node.js, Scikit-learn, CI/CD.
 */
export function preprocessAndTokenize(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  const lower = rawText
    .toLowerCase()
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  // Match technical tokens (.net, c++, c#, node.js, scikit-learn, ci/cd) or standard alphanumeric words
  const tokenRegex = /(?:\.net|c\+\+|c#|ci\/cd|[a-z0-9]+(?:[._-][a-z0-9]+)*)/g;
  const rawMatches = lower.match(tokenRegex) || [];

  const cleanedTokens: string[] = [];
  for (const token of rawMatches) {
    const trimmed = token === '.net' ? '.net' : token.replace(/^[._-]+|[._-]+$/g, '');
    if (!trimmed) continue;
    // Keep technical short tokens like 'c#', 'r', 'go', 'ml', 'ai', 'js', 'ts', but skip single pure digits
    if (trimmed.length === 1 && !['r', 'c'].includes(trimmed)) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (ENGLISH_STOPWORDS.has(trimmed)) continue;
    cleanedTokens.push(trimmed);
  }

  return cleanedTokens;
}

/**
 * Computes TF-IDF vectors using Scikit-learn's smoothed IDF formula:
 * idf(t) = ln((1 + n) / (1 + df(t))) + 1
 * with L2 normalization (matching Scikit-learn's default TfidfVectorizer(stop_words='english')),
 * then computes cosine similarity.
 */
export function computeTfIdfAndSimilarity(resumeText: string, jobText: string): {
  similarityPercentage: number;
  cosineSimilarityRaw: number;
  vocabularySize: number;
  resumeTokenCount: number;
  jobTokenCount: number;
  topOverlappingTerms: TermContribution[];
  topMissingJobKeywords: string[];
} {
  const resumeTokens = preprocessAndTokenize(resumeText);
  const jobTokens = preprocessAndTokenize(jobText);

  if (resumeTokens.length === 0 || jobTokens.length === 0) {
    return {
      similarityPercentage: 0,
      cosineSimilarityRaw: 0,
      vocabularySize: 0,
      resumeTokenCount: resumeTokens.length,
      jobTokenCount: jobTokens.length,
      topOverlappingTerms: [],
      topMissingJobKeywords: [],
    };
  }

  const countTerms = (items: string[]): Map<string, number> => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return counts;
  };

  const resumeCounts = countTerms(resumeTokens);
  const jobCounts = countTerms(jobTokens);

  const vocabulary = new Set<string>([...resumeCounts.keys(), ...jobCounts.keys()]);
  const nDocs = 2; // Resume document and Job Description document

  const resumeRawVec = new Map<string, number>();
  const jobRawVec = new Map<string, number>();

  for (const term of vocabulary) {
    const rCount = resumeCounts.get(term) || 0;
    const jCount = jobCounts.get(term) || 0;
    const df = (rCount > 0 ? 1 : 0) + (jCount > 0 ? 1 : 0);

    // Scikit-learn smooth_idf=True formula: log((1 + n) / (1 + df)) + 1
    const idf = Math.log((1 + nDocs) / (1 + df)) + 1;

    if (rCount > 0) {
      const tf = 1 + Math.log(rCount);
      resumeRawVec.set(term, tf * idf);
    }
    if (jCount > 0) {
      const tf = 1 + Math.log(jCount);
      jobRawVec.set(term, tf * idf);
    }
  }

  // L2 Normalization
  const computeL2Norm = (vec: Map<string, number>): number => {
    let sumSq = 0;
    for (const val of vec.values()) {
      sumSq += val * val;
    }
    return Math.sqrt(sumSq) || 1;
  };

  const rNorm = computeL2Norm(resumeRawVec);
  const jNorm = computeL2Norm(jobRawVec);

  let dotProduct = 0;
  const overlapping: TermContribution[] = [];
  const missingJobTerms: { term: string; weight: number }[] = [];

  for (const term of vocabulary) {
    const rVal = (resumeRawVec.get(term) || 0) / rNorm;
    const jVal = (jobRawVec.get(term) || 0) / jNorm;

    if (rVal > 0 && jVal > 0) {
      const prod = rVal * jVal;
      dotProduct += prod;
      overlapping.push({
        term,
        resumeTfIdf: Number(rVal.toFixed(4)),
        jobTfIdf: Number(jVal.toFixed(4)),
        product: Number(prod.toFixed(4)),
      });
    } else if (jVal > 0 && rVal === 0 && !term.includes(' ')) {
      missingJobTerms.push({ term, weight: jVal });
    }
  }

  overlapping.sort((a, b) => b.product - a.product);
  missingJobTerms.sort((a, b) => b.weight - a.weight);

  const clampedCosine = Math.max(0, Math.min(1, dotProduct));
  const similarityPercentage = Math.round(clampedCosine * 1000) / 10;

  return {
    similarityPercentage,
    cosineSimilarityRaw: Number(clampedCosine.toFixed(4)),
    vocabularySize: vocabulary.size,
    resumeTokenCount: resumeTokens.length,
    jobTokenCount: jobTokens.length,
    topOverlappingTerms: overlapping.slice(0, 10),
    topMissingJobKeywords: missingJobTerms.slice(0, 8).map((m) => m.term),
  };
}

/**
 * Masks an email address for privacy while confirming detection (e.g. "alex.rivera@stanford.edu" -> "al***a@stanford.edu").
 */
export function maskEmailAddress(email: string): string {
  const parts = email.trim().split('@');
  if (parts.length !== 2) return 'Not detected';
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0] || '*'}***@${domain}`;
  }
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

/**
 * Extracts structured overview fields from resume text using rule-based NLP patterns.
 */
export function extractResumeOverview(resumeText: string, resumeSkills: string[], pageCount = 1): ResumeOverview {
  const lines = resumeText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Email detection with privacy masking
  const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const emailMasked = emailMatch ? maskEmailAddress(emailMatch[0]) : 'Not detected';

  // 2. Education detection
  const eduRegex = /\b(b\.?tech|m\.?tech|b\.?s\.?|m\.?s\.?|b\.?e\.?|b\.?sc|m\.?sc|ph\.?d|bachelor|master|university|institute of technology|college|computer science|artificial intelligence|data science|engineering|gpa|cgpa)\b/i;
  const educationMatches: string[] = [];
  for (const line of lines) {
    if (eduRegex.test(line) && line.length <= 140) {
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
      if (!educationMatches.includes(cleaned)) {
        educationMatches.push(cleaned);
      }
    }
    if (educationMatches.length >= 3) break;
  }

  // 3. Experience-related keywords
  const expTerms = [
    'Intern', 'Internship', 'Software Engineer', 'Machine Learning Engineer', 'Data Analyst',
    'Research Assistant', 'Developer', 'Full Stack', 'Backend', 'Frontend', 'Developed',
    'Engineered', 'Implemented', 'Deployed', 'Optimized', 'Built', 'Automated', 'Collaborated',
    'Production', 'Pipeline', 'Architecture'
  ];
  const experienceKeywords: string[] = [];
  for (const term of expTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(resumeText)) {
      experienceKeywords.push(term);
    }
  }

  // 4. Projects or Certifications
  const projCertRegex = /\b(project|certified|certification|certificate|capstone|aws certified|coursera|udemy|stanford|deeplearning\.ai|hackathon|winner|published|publication|system|analyzer|classifier|dashboard|platform)\b/i;
  const projectsAndCertifications: string[] = [];
  for (const line of lines) {
    if (projCertRegex.test(line) && line.length >= 12 && line.length <= 130) {
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
      if (
        ! /^(projects|certifications|academic projects|personal projects|experience|work experience)$/i.test(cleaned) &&
        !projectsAndCertifications.includes(cleaned)
      ) {
        projectsAndCertifications.push(cleaned);
      }
    }
    if (projectsAndCertifications.length >= 4) break;
  }

  const wordCount = resumeText.trim() ? resumeText.trim().split(/\s+/).length : 0;

  return {
    emailMasked,
    education: educationMatches.length > 0 ? educationMatches : ['Not detected'],
    relevantSkills: resumeSkills.length > 0 ? resumeSkills : ['Not detected'],
    experienceKeywords: experienceKeywords.length > 0 ? experienceKeywords.slice(0, 10) : ['Not detected'],
    projectsAndCertifications: projectsAndCertifications.length > 0 ? projectsAndCertifications : ['Not detected'],
    wordCount,
    pageCount,
  };
}

/**
 * Generates 3 to 5 practical, honest improvement suggestions grounded strictly in the analysis findings.
 */
export function generateImprovementSuggestions(params: {
  similarityPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  overview: ResumeOverview;
  topMissingJobKeywords: string[];
  resumeText: string;
}): SuggestionItem[] {
  const { similarityPercentage, matchingSkills, missingSkills, overview, topMissingJobKeywords, resumeText } = params;
  const suggestions: SuggestionItem[] = [];

  // 1. Missing skills suggestion
  if (missingSkills.length > 0) {
    const sampleMissing = missingSkills.slice(0, 4).join(', ');
    suggestions.push({
      id: 'missing-skills',
      category: 'Skills',
      title: 'Review potentially missing job skills',
      description: `The job description mentions ${sampleMissing}${missingSkills.length > 4 ? ` (and ${missingSkills.length - 4} more)` : ''}, which were not detected in your resume. If you genuinely possess experience with any of these tools, list them explicitly in your Skills or Projects section.`,
    });
  } else if (matchingSkills.length > 0) {
    suggestions.push({
      id: 'strong-skill-coverage',
      category: 'Skills',
      title: 'Contextualize matched technical skills in bullet points',
      description: `Your resume matches all ${matchingSkills.length} detected skills from the job description (${matchingSkills.slice(0, 4).join(', ')}). Strengthen this further by demonstrating how you applied each skill inside project or internship outcomes.`,
    });
  }

  // 2. Quantifiable impact check
  const hasMetrics = /\b(\d+%|\d+x|\d+\+|\bms\b|accuracy|latency|f1-score|precision|recall|reduced|improved|increased)\b/i.test(resumeText);
  if (!hasMetrics) {
    suggestions.push({
      id: 'measurable-achievements',
      category: 'Impact',
      title: 'Add measurable outcomes to project descriptions',
      description: 'No quantitative metrics (such as percentage improvements, dataset sizes, model accuracy, or response times) were detected. Where accurate, add concrete figures to illustrate the scale and outcome of your work.',
    });
  } else {
    suggestions.push({
      id: 'expand-metrics',
      category: 'Impact',
      title: 'Ensure every major project includes a clear outcome metric',
      description: 'Your resume already includes quantitative indicators. Verify that each technical project and role pairs the action taken with a measurable engineering or analytical outcome.',
    });
  }

  // 3. Projects or Certifications check
  if (overview.projectsAndCertifications[0] === 'Not detected') {
    suggestions.push({
      id: 'add-relevant-projects',
      category: 'Projects',
      title: 'Include specific academic or practical projects',
      description: 'Distinct project entries or certifications were not clearly detected. Adding a dedicated "Projects" section describing relevant coursework, mini-projects, or repositories helps demonstrate hands-on capability.',
    });
  } else if (missingSkills.length > 0) {
    suggestions.push({
      id: 'align-project-descriptions',
      category: 'Projects',
      title: 'Highlight target-role technologies in your existing projects',
      description: `You have ${overview.projectsAndCertifications.length} detected project/certification line(s). Review whether any of your completed projects utilized tools relevant to this target role and mention the specific libraries or workflows used.`,
    });
  }

  // 4. Keyword alignment based on TF-IDF
  if (similarityPercentage < 35 && topMissingJobKeywords.length > 0) {
    const topTerms = topMissingJobKeywords.slice(0, 4).join(', ');
    suggestions.push({
      id: 'keyword-alignment',
      category: 'Keywords',
      title: 'Improve visibility of job-relevant terminology',
      description: `The overall text similarity is ${similarityPercentage.toFixed(1)}%. Prominent terms from the job description such as "${topTerms}" do not appear in your resume. Mirror the employer's phrasing where it accurately describes your background.`,
    });
  } else if (topMissingJobKeywords.length > 0) {
    const topTerms = topMissingJobKeywords.slice(0, 3).join(', ');
    suggestions.push({
      id: 'terminology-refinement',
      category: 'Keywords',
      title: 'Refine domain phrasing for stronger text overlap',
      description: `Consider incorporating relevant domain terms from the job posting (such as "${topTerms}") into your summary or experience bullets if they accurately reflect your work.`,
    });
  }

  // 5. Experience / action verbs check
  if (overview.experienceKeywords[0] === 'Not detected' || overview.experienceKeywords.length < 3) {
    suggestions.push({
      id: 'action-verbs',
      category: 'Experience',
      title: 'Lead bullet points with strong technical action verbs',
      description: 'Few standard engineering action verbs (e.g., Developed, Engineered, Implemented, Optimized, Deployed) were detected. Starting bullet points with clear action verbs improves readability for both recruiters and automated parsers.',
    });
  }

  return suggestions.slice(0, 5);
}

/**
 * Full end-to-end deterministic analyzer combining TF-IDF Cosine Similarity and Rule-Based Skill Extraction.
 */
export function analyzeResumeAndJob(resumeText: string, jobDescription: string, pageCount = 1): AnalysisResult {
  const tfidfStats = computeTfIdfAndSimilarity(resumeText, jobDescription);

  const resumeSkills = extractSkillsFromText(resumeText, SKILL_DICTIONARY);
  const jobSkills = extractSkillsFromText(jobDescription, SKILL_DICTIONARY);

  const resumeSkillSet = new Set(resumeSkills);
  const matchingSkills = jobSkills.filter((skill) => resumeSkillSet.has(skill));
  const missingSkills = jobSkills.filter((skill) => !resumeSkillSet.has(skill));

  const overview = extractResumeOverview(resumeText, resumeSkills, pageCount);

  const suggestions = generateImprovementSuggestions({
    similarityPercentage: tfidfStats.similarityPercentage,
    matchingSkills,
    missingSkills,
    overview,
    topMissingJobKeywords: tfidfStats.topMissingJobKeywords,
    resumeText,
  });

  return {
    similarityPercentage: tfidfStats.similarityPercentage,
    matchingSkills,
    missingSkills,
    resumeSkills,
    jobSkills,
    totalMatchedSkills: matchingSkills.length,
    totalJobSkills: jobSkills.length,
    overview,
    suggestions,
    details: {
      vocabularySize: tfidfStats.vocabularySize,
      resumeTokenCount: tfidfStats.resumeTokenCount,
      jobTokenCount: tfidfStats.jobTokenCount,
      cosineSimilarityRaw: tfidfStats.cosineSimilarityRaw,
      topOverlappingTerms: tfidfStats.topOverlappingTerms,
      topMissingJobKeywords: tfidfStats.topMissingJobKeywords,
      mlComponentsUsed: [
        'TF-IDF Vectorization (Unigram feature representation with smoothed IDF & L2 normalization)',
        'Cosine Similarity (Vector space inner product measuring textual angle between Resume & Job Description)',
      ],
      ruleBasedComponentsUsed: [
        'Token-Boundary Skill Extraction (Phrase-aware regex matching against configurable 40+ skill dictionary)',
        'Resume Entity Extraction (Privacy-masked email detection, education, action verbs, and project headers)',
        'Deterministic Improvement Heuristics (Data-driven recommendations based on missing skills and metric patterns)',
      ],
    },
  };
}
