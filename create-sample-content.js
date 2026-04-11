/**
 * Create sample content for Week 6
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { createSimplePDF } = require('./server/utils/pdfGenerator');

const DB_PATH = path.join(__dirname, 'server', 'db', 'gpu-earn.db');
const pdfDir = path.join(__dirname, 'server', 'uploads', 'guides', 'pdf');
const markdownDir = path.join(__dirname, 'server', 'uploads', 'guides', 'markdown');

if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
if (!fs.existsSync(markdownDir)) fs.mkdirSync(markdownDir, { recursive: true });

const db = new sqlite3.Database(DB_PATH);

const pdfGuides = [
  {
    title: 'Vast.ai Comprehensive Guide',
    slug: 'vast-ai-guide',
    content: `Vast.ai Comprehensive Guide

1. Getting Started
   - Create account
   - Set up wallet

2. Earning GPU
   - Rent your GPU
   - Monitor earnings

3. Tips & Tricks
   - Maximize uptime
   - Optimize pricing`,
    price: 9.99,
    filename: '1-vast-ai-guide.pdf'
  },
  {
    title: 'io.net Advanced Setup',
    slug: 'io-net-setup',
    content: `io.net Advanced Setup Guide

1. Installation
2. Configuration
3. Optimization
4. Troubleshooting`,
    price: 14.99,
    filename: '2-io-net-setup.pdf'
  }
];

const markdownGuides = [
  {
    title: 'Getting Started with GPU Earning',
    slug: 'getting-started-gpu',
    content: `# Getting Started with GPU Earning

## What is GPU Earning?
GPU earning is the process of renting out your graphics card to earn passive income.

## Requirements
- NVIDIA or AMD GPU with 3GB+ VRAM
- Stable internet connection
- Computer that can run 24/7 (optional but recommended)

## Popular Platforms
- Vast.ai
- RunPod
- io.net
- OctaSpace

## First Steps
1. Choose a platform
2. Create an account
3. Share your GPU
4. Start earning!`,
    category: 'beginner'
  },
  {
    title: 'Choosing Your GPU Platform',
    slug: 'choose-platform',
    content: `# Choosing Your GPU Platform

## Platform Comparison

### For Beginners
- **Salad**: Easiest setup, lowest earnings
- **GamerHash**: User-friendly interface

### For Serious Miners
- **Vast.ai**: Higher earnings, more complex
- **RunPod**: Professional tools
- **io.net**: DePIN rewards

## Factors to Consider
1. Earnings potential
2. Setup complexity
3. Withdrawal fees
4. Community support`,
    category: 'intermediate'
  }
];

const init = async () => {
  try {
    console.log('📁 Creating sample content...\n');

    console.log('📄 Generating PDF guides...');
    for (const guide of pdfGuides) {
      const pdfPath = path.join(pdfDir, guide.filename);
      await createSimplePDF(guide.title, guide.content, pdfPath);
      console.log(`  ✅ Created: ${guide.filename}`);

      const fileSize = fs.statSync(pdfPath).size;
      const filePath = path.relative(process.cwd(), pdfPath);
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO guides (title, slug, description, price_usd, file_path, file_size, category, is_free, content_type, is_published)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [guide.title, guide.slug, `Premium: ${guide.title}`, guide.price, filePath, fileSize, 'premium', 0, 'pdf', 1],
          (err) => err ? reject(err) : resolve()
        );
      });
    }

    console.log('\n📝 Adding Markdown guides...');
    for (const guide of markdownGuides) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO guides (title, slug, description, markdown_content, category, is_free, content_type, is_published)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [guide.title, guide.slug, `Free: ${guide.title}`, guide.content, guide.category, 1, 'markdown', 1],
          (err) => err ? reject(err) : resolve()
        );
      });
      console.log(`  ✅ Added: ${guide.slug}`);
    }

    console.log('\n✅ Sample content created!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

db.serialize(init);
