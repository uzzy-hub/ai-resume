export interface SkillEntry {
  name: string;
  category: 'Programming' | 'Machine Learning & Data' | 'Web & Frameworks' | 'Cloud & DevOps' | 'Professional';
  aliases: string[];
}

export const SKILL_DICTIONARY: SkillEntry[] = [
  // Programming Languages
  { name: 'Python', category: 'Programming', aliases: ['python', 'python3', 'py'] },
  { name: 'Java', category: 'Programming', aliases: ['java', 'jdk', 'jvm'] },
  { name: 'JavaScript', category: 'Programming', aliases: ['javascript', 'js', 'ecmascript', 'es6'] },
  { name: 'TypeScript', category: 'Programming', aliases: ['typescript', 'ts'] },
  { name: 'C++', category: 'Programming', aliases: ['c++', 'cpp'] },
  { name: 'C#', category: 'Programming', aliases: ['c#', 'csharp'] },
  { name: '.NET', category: 'Programming', aliases: ['.net', 'dotnet', 'asp.net'] },
  { name: 'SQL', category: 'Programming', aliases: ['sql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'tsql', 'pl/sql'] },
  { name: 'HTML', category: 'Programming', aliases: ['html', 'html5'] },
  { name: 'CSS', category: 'Programming', aliases: ['css', 'css3'] },
  { name: 'R', category: 'Programming', aliases: ['r programming', 'r language', 'rstudio'] },
  { name: 'Go', category: 'Programming', aliases: ['golang', 'go language'] },

  // Web & Frameworks
  { name: 'React', category: 'Web & Frameworks', aliases: ['react', 'reactjs', 'react.js'] },
  { name: 'Node.js', category: 'Web & Frameworks', aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'FastAPI', category: 'Web & Frameworks', aliases: ['fastapi', 'fast api'] },
  { name: 'Flask', category: 'Web & Frameworks', aliases: ['flask'] },
  { name: 'Django', category: 'Web & Frameworks', aliases: ['django'] },
  { name: 'Express', category: 'Web & Frameworks', aliases: ['express', 'expressjs', 'express.js'] },
  { name: 'Next.js', category: 'Web & Frameworks', aliases: ['next.js', 'nextjs'] },
  { name: 'Tailwind CSS', category: 'Web & Frameworks', aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
  { name: 'REST API', category: 'Web & Frameworks', aliases: ['rest api', 'restful api', 'rest apis', 'restful'] },
  { name: 'GraphQL', category: 'Web & Frameworks', aliases: ['graphql'] },

  // Machine Learning & Data
  { name: 'Machine Learning', category: 'Machine Learning & Data', aliases: ['machine learning', 'ml', 'supervised learning', 'unsupervised learning'] },
  { name: 'Deep Learning', category: 'Machine Learning & Data', aliases: ['deep learning', 'neural networks', 'cnn', 'rnn', 'transformers'] },
  { name: 'Data Analysis', category: 'Machine Learning & Data', aliases: ['data analysis', 'data analytics', 'exploratory data analysis', 'eda'] },
  { name: 'Pandas', category: 'Machine Learning & Data', aliases: ['pandas'] },
  { name: 'NumPy', category: 'Machine Learning & Data', aliases: ['numpy'] },
  { name: 'Scikit-learn', category: 'Machine Learning & Data', aliases: ['scikit-learn', 'sklearn', 'scikit learn'] },
  { name: 'TensorFlow', category: 'Machine Learning & Data', aliases: ['tensorflow', 'tf', 'keras'] },
  { name: 'PyTorch', category: 'Machine Learning & Data', aliases: ['pytorch', 'torch'] },
  { name: 'NLP', category: 'Machine Learning & Data', aliases: ['nlp', 'natural language processing', 'text mining', 'tf-idf', 'tokenization'] },
  { name: 'Computer Vision', category: 'Machine Learning & Data', aliases: ['computer vision', 'opencv', 'image processing'] },
  { name: 'Statistics', category: 'Machine Learning & Data', aliases: ['statistics', 'statistical modeling', 'hypothesis testing', 'probability'] },
  { name: 'Data Visualization', category: 'Machine Learning & Data', aliases: ['data visualization', 'matplotlib', 'seaborn', 'tableau', 'power bi'] },

  // Cloud & DevOps
  { name: 'Git', category: 'Cloud & DevOps', aliases: ['git', 'github', 'gitlab', 'version control'] },
  { name: 'Docker', category: 'Cloud & DevOps', aliases: ['docker', 'containerization', 'dockerfile'] },
  { name: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['kubernetes', 'k8s'] },
  { name: 'AWS', category: 'Cloud & DevOps', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { name: 'GCP', category: 'Cloud & DevOps', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { name: 'Azure', category: 'Cloud & DevOps', aliases: ['azure', 'microsoft azure'] },
  { name: 'Linux', category: 'Cloud & DevOps', aliases: ['linux', 'ubuntu', 'bash', 'unix'] },
  { name: 'CI/CD', category: 'Cloud & DevOps', aliases: ['ci/cd', 'continuous integration', 'github actions', 'jenkins'] },

  // Professional Skills
  { name: 'Communication', category: 'Professional', aliases: ['communication', 'written communication', 'verbal communication', 'presentation skills'] },
  { name: 'Problem Solving', category: 'Professional', aliases: ['problem solving', 'problem-solving', 'analytical thinking', 'troubleshooting'] },
  { name: 'Agile', category: 'Professional', aliases: ['agile', 'scrum', 'kanban'] },
  { name: 'Teamwork', category: 'Professional', aliases: ['teamwork', 'cross-functional collaboration', 'collaborative', 'team player'] },
  { name: 'Project Management', category: 'Professional', aliases: ['project management', 'stakeholder management', 'leadership'] },
];

/**
 * Escapes special regex characters in a skill alias while preserving exact matching
 * for symbols like C++, C#, .NET, Node.js, CI/CD.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a skill alias appears in normalized text using strict token boundaries
 * so "Java" never matches inside "JavaScript" and "C++" / ".NET" match accurately.
 */
export function containsSkillAlias(text: string, alias: string): boolean {
  const escaped = escapeRegex(alias.toLowerCase().trim());
  // Use negative lookbehind and lookahead for word characters, plus symbols that attach to technical tokens
  const pattern = new RegExp(`(?<![a-z0-9_.+#-])${escaped}(?![a-z0-9_+#-])`, 'i');
  return pattern.test(text);
}

/**
 * Extracts all canonical skill names detected in the provided text.
 */
export function extractSkillsFromText(text: string, customDictionary: SkillEntry[] = SKILL_DICTIONARY): string[] {
  if (!text || !text.trim()) return [];
  const normalized = text.toLowerCase();
  const detected: string[] = [];

  for (const skill of customDictionary) {
    const matched = skill.aliases.some((alias) => containsSkillAlias(normalized, alias));
    if (matched) {
      detected.push(skill.name);
    }
  }

  return detected;
}
