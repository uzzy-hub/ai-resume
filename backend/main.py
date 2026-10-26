"""
FastAPI Backend for ResumeIQ — AI Resume Analyzer.
Exposes POST /api/analyze for PDF resume text extraction, TF-IDF vectorization,
cosine similarity scoring, skill gap analysis, and actionable suggestions.
"""

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from resume_analyzer import extract_text_from_pdf_bytes, analyze_resume_and_job

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB limit

app = FastAPI(
    title="ResumeIQ API",
    description="Educational AIML Resume Analyzer API using PyMuPDF and Scikit-learn TF-IDF Cosine Similarity",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "engine": "Python FastAPI + Scikit-learn + PyMuPDF"}


@app.post("/api/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    jobDescription: str = Form(...),
):
    if not jobDescription or not jobDescription.strip():
        raise HTTPException(status_code=400, detail="Please enter a non-empty job description.")

    if len(jobDescription.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description is too short. Please provide at least a few sentences of job requirements.",
        )

    filename = (resume.filename or "").lower()
    content_type = (resume.content_type or "").lower()
    if not filename.endswith(".pdf") and content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF (.pdf) files are supported.")

    pdf_bytes = await resume.read()
    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File size exceeds the 5 MB limit. Please upload a smaller PDF.")

    try:
        resume_text, page_count = extract_text_from_pdf_bytes(pdf_bytes)
    except ValueError as err:
        raise HTTPException(status_code=422, detail=str(err)) from err

    analysis_result = analyze_resume_and_job(
        resume_text=resume_text,
        job_description=jobDescription.strip(),
        page_count=page_count,
    )
    return analysis_result


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
