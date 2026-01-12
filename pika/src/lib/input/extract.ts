import mammoth from 'mammoth'

export type ExtractedText = {
  fileName: string
  fileType: 'pdf' | 'docx'
  text: string
}

function ext(name: string) {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ''
}

export async function extractTextFromFile(file: File): Promise<ExtractedText> {
  const e = ext(file.name)
  if (e === 'pdf') return extractPdf(file)
  if (e === 'docx') return extractDocx(file)
  throw new Error('Unsupported file type. Please upload a PDF or DOCX.')
}

async function extractPdf(file: File): Promise<ExtractedText> {
  // Dynamically import heavy PDF.js only when needed (reduces initial bundle size).
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min?url')).default as string
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

  const data = new Uint8Array(await file.arrayBuffer())
  const doc = await pdfjs.getDocument({ data }).promise

  const chunks: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((it) => ('str' in it ? String(it.str) : ''))
      .filter(Boolean)
      .join(' ')
    chunks.push(pageText)
  }

  return {
    fileName: file.name,
    fileType: 'pdf',
    text: chunks.join('\n\n'),
  }
}

async function extractDocx(file: File): Promise<ExtractedText> {
  const arrayBuffer = await file.arrayBuffer()
  const res = await mammoth.extractRawText({ arrayBuffer })
  return {
    fileName: file.name,
    fileType: 'docx',
    text: res.value ?? '',
  }
}

