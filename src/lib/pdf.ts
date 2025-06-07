import pdfParse from "pdf-parse";

/**
 * Fetches a PDF from the given URL, parses it, and returns the extracted text.
 * @param fileUrl - URL to download the PDF from
 * @returns The extracted text content of the PDF
 */
export async function fetchPdfText(fileUrl: string): Promise<string> {
    const response = await fetch(fileUrl);
    if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { text } = await pdfParse(buffer);
    return text;
}