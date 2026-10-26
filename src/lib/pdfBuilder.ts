/**
 * Lightweight, standards-compliant PDF 1.4 generator for creating real downloadable
 * and testable PDF documents (multi-page text resumes or empty image-only PDFs).
 */
function escapePdfText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' ');
}

export function createRealPdfBytes(pagesText: string[]): Uint8Array {
  const objects: string[] = [];
  const addObject = (body: string): number => {
    objects.push(body);
    return objects.length;
  };

  // 1: Catalog (placeholder updated after pages tree)
  const catalogId = addObject('');
  // 2: Pages root (placeholder updated after pages)
  const pagesRootId = addObject('');
  // 3: Helvetica Font
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const pageIds: number[] = [];

  const effectivePages = pagesText.length > 0 ? pagesText : [''];

  for (const pageContent of effectivePages) {
    const rawLines = pageContent.split(/\r?\n/);
    const streamLines: string[] = ['BT', '/F1 10 Tf', '50 750 Td', '14 TL'];

    for (const line of rawLines) {
      if (line.trim().length === 0) {
        streamLines.push('T*');
        continue;
      }
      // Wrap lines around 85 chars to fit neatly on page
      const words = line.split(/\s+/);
      let current = '';
      for (const word of words) {
        if ((current + ' ' + word).trim().length > 85) {
          streamLines.push(`(${escapePdfText(current.trim())}) Tj T*`);
          current = word;
        } else {
          current = (current + ' ' + word).trim();
        }
      }
      if (current.trim().length > 0) {
        streamLines.push(`(${escapePdfText(current.trim())}) Tj T*`);
      }
    }
    streamLines.push('ET');

    const streamData = pageContent.trim().length === 0 ? '' : streamLines.join('\n');
    const contentId = addObject(
      `<< /Length ${streamData.length} >>\nstream\n${streamData}\nendstream`
    );

    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesRootId} 0 R >>`;
  objects[pagesRootId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    const offsetStr = String(offsets[i]).padStart(10, '0');
    pdf += `${offsetStr} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const encoder = new TextEncoder();
  return encoder.encode(pdf);
}
