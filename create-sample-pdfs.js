#!/usr/bin/env node

/**
 * Create Sample PDF Guides
 * Generates example PDF files for demonstration and testing
 * Run: node create-sample-pdfs.js
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'server', 'uploads', 'guides');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created directory: ${uploadsDir}`);
}

/**
 * Create a sample guide and save it as PDF file
 */
const createSampleGuide = (guideId, title, content) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const filePath = path.join(uploadsDir, `${guideId}.pdf`);
      const stream = fs.createWriteStream(filePath);

      doc.on('error', (err) => {
        stream.destroy();
        reject(err);
      });
      stream.on('error', reject);
      stream.on('finish', () => resolve(filePath));

      doc.pipe(stream);

      // Title
      doc.fontSize(28).font('Helvetica-Bold').fillColor('#1f2937')
        .text(title, { align: 'center' });

      doc.moveDown(0.5);

      // Subtitle
      doc.fontSize(14).font('Helvetica').fillColor('#6b7280')
        .text('Complete GPU Earning Guide', { align: 'center' });

      doc.moveDown();

      // Content
      doc.fontSize(11).font('Helvetica').fillColor('#374151')
        .text(content, { align: 'justify' });

      doc.moveDown();

      doc.fontSize(10).fillColor('#9ca3af')
        .text('Generated: ' + new Date().toISOString().split('T')[0], { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const main = async () => {
  console.log('\n🚀 Creating sample PDF guides...\n');

  const samples = [
    {
      id: 1,
      title: 'Vast.ai GPU Earning Guide',
      content: 'Vast.ai is one of the most popular platforms for GPU rental and earning. With competitive rates and flexible terms, it\'s perfect for both beginners and experienced GPU owners. This comprehensive guide covers everything you need to know to maximize your earnings on Vast.ai.'
    },
    {
      id: 2,
      title: 'RunPod Advanced Tutorial',
      content: 'RunPod offers serverless GPU computing with excellent performance. This advanced guide is designed for users who want to optimize their setup for maximum profitability. Learn about GPU selection, pricing strategies, and advanced configuration options.'
    },
    {
      id: 3,
      title: 'io.net DePIN Network Guide',
      content: 'io.net is a decentralized GPU network that rewards you for sharing your computing resources. Joining the DePIN revolution has never been easier. This guide walks you through connecting to the network and earning passive income from your GPU.'
    },
  ];

  try {
    for (const sample of samples) {
      const filePath = await createSampleGuide(sample.id, sample.title, sample.content);
      const fileSize = fs.statSync(filePath).size;
      console.log(`✅ ${sample.title}`);
      console.log(`   📄 ${path.basename(filePath)} (${(fileSize / 1024).toFixed(2)} KB)\n`);
    }

    console.log('🎉 All sample guides created successfully!');
    console.log(`📁 Location: ${uploadsDir}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

main();
