#!/usr/bin/env node

/**
 * Database initialization script
 * Creates SQLite database and tables from schema.sql
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'server', 'db', 'gpu-earn.db');
const schemaPath = path.join(__dirname, 'server', 'db', 'schema.sql');

// Create db directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`✅ Created directory: ${dbDir}`);
}

// Create uploads directories
const uploadsDirs = [
  path.join(__dirname, 'server', 'uploads'),
  path.join(__dirname, 'server', 'uploads', 'guides'),
  path.join(__dirname, 'server', 'uploads', 'reports'),
];

uploadsDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log(`✅ Connected to SQLite database at ${dbPath}`);
});

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Error executing schema:', err.message);
    db.close();
    process.exit(1);
  }
  console.log('✅ Database schema created successfully');

  // Insert sample guides (optional)
  const sampleGuides = [
    {
      title: 'Vast.ai Starter Guide',
      slug: 'vast-ai-starter',
      description: 'Полное руководство по запуску GPU на Vast.ai',
      price_usd: 7.00,
      category: 'beginner'
    },
    {
      title: 'io.net Advanced Guide',
      slug: 'io-net-advanced',
      description: 'Продвинутые техники оптимизации на io.net',
      price_usd: 9.00,
      category: 'advanced'
    },
    {
      title: 'GPU Mega Pack',
      slug: 'gpu-mega-pack',
      description: 'Мегапак со всеми гайдами и инструментами',
      price_usd: 24.00,
      category: 'all_platforms'
    }
  ];

  let insertCount = 0;
  sampleGuides.forEach((guide) => {
    const sql = `INSERT OR IGNORE INTO guides (title, slug, description, price_usd, category)
                 VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [guide.title, guide.slug, guide.description, guide.price_usd, guide.category], function(err) {
      if (err) {
        console.error(`❌ Error inserting guide "${guide.title}":`, err.message);
      } else {
        console.log(`✅ Inserted guide: ${guide.title}`);
        insertCount++;
      }
    });
  });

  // Close database
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
        process.exit(1);
      }
      console.log('✅ Database initialization completed successfully!');
      console.log(`✅ Sample guides inserted: ${insertCount}/${sampleGuides.length}`);
      process.exit(0);
    });
  }, 500);
});
