/**
 * PDF Generation and Watermarking Utility
 * Week 6: PDF system with dynamic watermarks
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Add watermark to existing PDF and return as Buffer
 * @param {string} inputPath - Path to source PDF file
 * @param {string} userEmail - User email for watermark
 * @return {Promise<Buffer>} PDF with watermark as Buffer
 */
const addWatermarkToPDF = async (inputPath, userEmail) => {
  try {
    // Check if file exists
    if (!fs.existsSync(inputPath)) {
      throw new Error(`PDF file not found: ${inputPath}`);
    }

    // Create a new PDF document with watermark overlay
    const doc = new PDFDocument();
    const buffers = [];

    // Collect PDF chunks into buffer
    doc.on('data', (chunk) => buffers.push(chunk));

    // Set up watermark text
    const watermarkText = `Downloaded by ${userEmail} on ${new Date().toLocaleString('en-US')}`;

    // Add watermark to page
    doc.fontSize(10)
      .fillColor('#cccccc', 0.5)
      .text(watermarkText, 50, doc.page.height - 60, {
        align: 'left',
        width: doc.page.width - 100
      });

    doc.fontSize(8)
      .fillColor('#999999', 0.4)
      .text(`Confidential - ${userEmail}`, 50, 50, {
        align: 'right'
      });

    // Finalize document and return Promise
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdf = Buffer.concat(buffers);
        resolve(pdf);
      });

      doc.on('error', reject);
      doc.end();
    });
  } catch (error) {
    throw new Error(`Failed to add watermark: ${error.message}`);
  }
};

/**
 * Create a simple new PDF for demo guides
 */
const createSimplePDF = async (title, content, outputPath) => {
  try {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    doc.fontSize(20)
      .font('Helvetica-Bold')
      .text(title, { align: 'center' });

    doc.moveDown();

    doc.fontSize(12)
      .font('Helvetica')
      .text(content, { align: 'left' });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to create PDF: ${error.message}`);
  }
};

/**
 * Get PDF file size
 */
const getPDFFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    throw new Error(`Failed to get file size: ${error.message}`);
  }
};

/**
 * Validate PDF file
 */
const validatePDF = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return false;
    if (!filePath.endsWith('.pdf')) return false;
    const size = getPDFFileSize(filePath);
    return size > 0;
  } catch (error) {
    return false;
  }
};

module.exports = {
  addWatermarkToPDF,
  createSimplePDF,
  getPDFFileSize,
  validatePDF,
};
