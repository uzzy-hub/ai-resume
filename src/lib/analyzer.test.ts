import test from 'node:test';
import assert from 'node:assert/strict';
import {
  preprocessAndTokenize,
  computeTfIdfAndSimilarity,
  analyzeResumeAndJob,
  maskEmailAddress,
} from './analyzer';
import { extractSkillsFromText } from './skillDictionary';
import { createRealPdfBytes } from './pdfBuilder';
import { extractTextFromPdfBuffer } from './pdfExtractor';

test('preserves technical terms (C++, C#, .NET, Node.js, Scikit-learn) and prevents Java/JavaScript false positives', () => {
  const sample = 'Experienced in JavaScript, C++, C#, .NET, Node.js, and Scikit-learn for Machine Learning.';
  const skills = extractSkillsFromText(sample);

  assert.equal(skills.includes('JavaScript'), true);
  assert.equal(skills.includes('Java'), false, 'Java should not match inside JavaScript');
  assert.equal(skills.includes('C++'), true);
  assert.equal(skills.includes('C#'), true);
  assert.equal(skills.includes('.NET'), true);
  assert.equal(skills.includes('Node.js'), true);
  assert.equal(skills.includes('Scikit-learn'), true);
  assert.equal(skills.includes('Machine Learning'), true);

  const tokens = preprocessAndTokenize(sample);
  assert.equal(tokens.includes('c++'), true);
  assert.equal(tokens.includes('c#'), true);
  assert.equal(tokens.includes('.net'), true);
  assert.equal(tokens.includes('node.js'), true);
  assert.equal(tokens.includes('scikit-learn'), true);
});

test('Scenario 1: Valid resume with a matching job description yields higher similarity and matched skills', () => {
  const resume = `
    Aarav Sharma
    aarav.sharma@iitb.ac.in
    B.Tech in Computer Science and Engineering, Indian Institute of Technology (CGPA: 8.9/10)
    Skills: Python, Machine Learning, Deep Learning, Scikit-learn, Pandas, NumPy, SQL, FastAPI, Git, Docker, NLP
    Experience: Machine Learning Intern — Engineered an NLP text classification pipeline using Python, Scikit-learn, and TF-IDF vectorization, improving F1-score by 18%.
    Projects: ResumeIQ Automated Resume Analyzer Project using FastAPI, React, and Cosine Similarity.
  `;
  const jd = `
    Machine Learning Engineer (NLP)
    We are looking for a Machine Learning Engineer skilled in Python, Scikit-learn, Pandas, NumPy, NLP, Deep Learning, FastAPI, Docker, SQL, and AWS.
    Responsibilities include building text similarity pipelines, TF-IDF vectorization models, and deploying REST APIs.
  `;

  const result = analyzeResumeAndJob(resume, jd, 1);
  assert.equal(result.similarityPercentage > 35, true, `Expected similarity > 35%, got ${result.similarityPercentage}`);
  assert.equal(result.matchingSkills.includes('Python'), true);
  assert.equal(result.matchingSkills.includes('Machine Learning'), true);
  assert.equal(result.matchingSkills.includes('Scikit-learn'), true);
  assert.equal(result.matchingSkills.includes('NLP'), true);
  assert.equal(result.missingSkills.includes('AWS'), true);
  assert.equal(result.overview.emailMasked, 'aa***a@iitb.ac.in');
  assert.equal(result.suggestions.length >= 3 && result.suggestions.length <= 5, true);
});

test('Scenario 2: Resume with only a few relevant skills yields partial match and identifies missing skills', () => {
  const resume = `
    Priya Patel
    priya.patel@university.edu
    Bachelor of Science in Information Technology
    Skills: HTML, CSS, JavaScript, React, Git, Communication
    Built responsive web pages and student portfolio projects.
  `;
  const jd = `
    Full Stack AI Engineer
    Required Skills: Python, React, TypeScript, Node.js, FastAPI, SQL, Machine Learning, Docker, AWS, Git.
  `;

  const result = analyzeResumeAndJob(resume, jd, 1);
  assert.deepEqual(result.matchingSkills.sort(), ['Git', 'React'].sort());
  assert.equal(result.missingSkills.includes('Python'), true);
  assert.equal(result.missingSkills.includes('TypeScript'), true);
  assert.equal(result.missingSkills.includes('Docker'), true);
  assert.equal(result.totalMatchedSkills, 2);
  assert.equal(result.totalJobSkills, 10);
});

test('Scenario 3: Resume and job description with no meaningful overlap yields near-zero similarity and 0 matched skills', () => {
  const resume = `
    Culinary Chef & Bakery Specialist
    Prepared artisan sourdough pastries, seasonal menus, kitchen inventory management, and banquet catering for 200 guests daily.
  `;
  const jd = `
    Senior Embedded Systems & Deep Learning Architect
    Requires C++, Python, PyTorch, TensorFlow, Kubernetes, Linux kernel drivers, and neural network quantization.
  `;

  const result = analyzeResumeAndJob(resume, jd, 1);
  assert.equal(result.similarityPercentage < 5, true);
  assert.equal(result.totalMatchedSkills, 0);
  assert.equal(result.missingSkills.length >= 5, true);
});

test('Scenario 4: Empty job description returns 0% similarity safely', () => {
  const sim = computeTfIdfAndSimilarity('Python Machine Learning Engineer', '   ');
  assert.equal(sim.similarityPercentage, 0);
  assert.equal(sim.cosineSimilarityRaw, 0);
});

test('Scenarios 5, 6 & Multi-page PDF: Real PDF extraction works on multi-page PDFs and rejects invalid or image-only PDFs', async () => {
  // Valid 2-page PDF
  const validPdfBytes = createRealPdfBytes([
    'Page 1: Maya Lin - maya.lin@mit.edu - B.S. Computer Science MIT. Skills: Python, PyTorch, SQL.',
    'Page 2: Experience: Developed deep learning models and NLP pipelines with Scikit-learn and Docker.',
  ]);
  const extracted = await extractTextFromPdfBuffer(validPdfBytes);
  assert.equal(extracted.pageCount, 2);
  assert.equal(extracted.text.includes('maya.lin@mit.edu'), true);
  assert.equal(extracted.text.includes('Scikit-learn'), true);

  // Scenario 5: Invalid non-PDF file bytes
  const invalidBytes = new TextEncoder().encode('This is a plain text file, not a PDF');
  await assert.rejects(
    async () => extractTextFromPdfBuffer(invalidBytes),
    /Invalid file format/
  );

  // Scenario 6: Empty / Image-only PDF with no extractable text
  const emptyPdfBytes = createRealPdfBytes(['']);
  await assert.rejects(
    async () => extractTextFromPdfBuffer(emptyPdfBytes),
    /No readable text could be extracted/
  );
});

test('Privacy email masking masks local identifier properly', () => {
  assert.equal(maskEmailAddress('student.name@college.edu'), 'st***e@college.edu');
  assert.equal(maskEmailAddress('ab@mit.edu'), 'a***@mit.edu');
});
