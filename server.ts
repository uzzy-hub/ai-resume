import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { extractTextFromPdfBuffer } from './src/lib/pdfExtractor';
import { analyzeResumeAndJob } from './src/lib/analyzer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// In-memory storage ensures uploaded resumes are never persisted to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      runtime: 'AI Studio Node/Express + TF-IDF Cosine Similarity Engine (FastAPI backend source included in /backend)',
    });
  });

  // Main Resume Analysis REST API Endpoint
  app.post('/api/analyze', (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File size exceeds the 5 MB limit. Please upload a smaller PDF file.',
          });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: 'Failed to process uploaded file.' });
      }
      next();
    });
  }, async (req, res) => {
    try {
      const file = req.file;
      const jobDescription = typeof req.body?.jobDescription === 'string' ? req.body.jobDescription.trim() : '';

      if (!file) {
        return res.status(400).json({ error: 'Please upload a PDF resume file before analyzing.' });
      }

      const fileNameLower = (file.originalname || '').toLowerCase();
      const mimeLower = (file.mimetype || '').toLowerCase();
      if (!fileNameLower.endsWith('.pdf') && mimeLower !== 'application/pdf') {
        return res.status(400).json({ error: 'Invalid file type. Only PDF (.pdf) files are accepted.' });
      }

      if (!jobDescription) {
        return res.status(400).json({ error: 'Please provide a target job description to compare against.' });
      }

      if (jobDescription.length < 20) {
        return res.status(400).json({
          error: 'The job description is too short. Please paste the responsibilities, required skills, and qualifications.',
        });
      }

      const pdfBytes = new Uint8Array(file.buffer);
      let extracted;
      try {
        extracted = await extractTextFromPdfBuffer(pdfBytes);
      } catch (extractErr: any) {
        return res.status(422).json({
          error: extractErr?.message || 'Unable to extract readable text from this PDF file.',
        });
      }

      const result = analyzeResumeAndJob(extracted.text, jobDescription, extracted.pageCount);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({
        error: error?.message || 'An unexpected error occurred during resume analysis.',
      });
    }
  });

  // Optional user-consented Gemini natural-language suggestion refinement
  app.post('/api/refine-suggestions', async (req, res) => {
    try {
      const { matchingSkills, missingSkills, similarityPercentage, currentSuggestions, userConsented } = req.body || {};

      if (!userConsented) {
        return res.status(400).json({
          error: 'Explicit user consent is required before sending analysis metadata to the Gemini API.',
        });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured in this environment. Using standard deterministic suggestions.',
        });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are an academic career advisor assisting a student with their resume.
Based strictly on these deterministic NLP analysis metrics (do NOT invent any qualifications, companies, degrees, or achievements):
- Resume-Job Text Similarity: ${similarityPercentage}%
- Matched Skills: ${(matchingSkills || []).join(', ') || 'None detected'}
- Potentially Missing Job Skills: ${(missingSkills || []).join(', ') || 'None'}
- Current Baseline Suggestions: ${JSON.stringify(currentSuggestions || [])}

Rewrite the 3 to 5 suggestions so they are clear, encouraging, concise, and actionable. Never advise the candidate to claim skills they do not actually possess.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['id', 'category', 'title', 'description'],
            },
          },
        },
      });

      const parsed = JSON.parse((response.text || '[]').trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({ suggestions: parsed.slice(0, 5) });
      }
      return res.json({ suggestions: currentSuggestions });
    } catch (err: any) {
      return res.status(500).json({
        error: 'Gemini refinement is temporarily unavailable. Keeping deterministic NLP suggestions.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ResumeIQ server running on http://localhost:${PORT}`);
  });
}

startServer();
