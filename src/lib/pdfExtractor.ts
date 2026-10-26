import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts readable text from a PDF buffer across all pages using pdfjs-dist.
 * Handles multiple pages, normalizes whitespace, and detects image-only or empty PDFs.
 */
export async function extractTextFromPdfBuffer(buffer: Uint8Array): Promise<PdfExtractionResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('The uploaded PDF file is empty.');
  }

  // Verify %PDF- header signature
  const headerStr = new TextDecoder('ascii').decode(buffer.slice(0, 8));
  if (!headerStr.startsWith('%PDF-')) {
    throw new Error('Invalid file format. Please upload a valid PDF document.');
  }

  let pdfDoc: any;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
      verbosity: 0,
    });
    pdfDoc = await loadingTask.promise;
  } catch (err: any) {
    throw new Error('Could not read the PDF file. The file may be corrupted or password-protected.');
  }

  const numPages: number = pdfDoc.numPages || 0;
  if (numPages === 0) {
    throw new Error('The uploaded PDF contains no pages.');
  }

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const items = textContent.items as Array<{ str?: string; hasEOL?: boolean }>;

    let currentPageText = '';
    for (const item of items) {
      if (typeof item.str === 'string') {
        currentPageText += item.str + (item.hasEOL ? '\n' : ' ');
      }
    }

    const cleanedPage = currentPageText
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n+/g, '\n')
      .trim();

    if (cleanedPage) {
      pageTexts.push(cleanedPage);
    }
  }

  const combinedText = pageTexts.join('\n\n').trim();

  if (!combinedText || combinedText.replace(/\s+/g, '').length < 15) {
    throw new Error(
      'No readable text could be extracted from this PDF. It appears to be an empty or scanned image-only PDF (OCR is not enabled).'
    );
  }

  return {
    text: combinedText,
    pageCount: numPages,
  };
}
