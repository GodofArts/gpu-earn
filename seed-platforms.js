#!/usr/bin/env node

/**
 * Seed platforms data into database
 */

const db = require('./server/config/database');

const platformsData = [
  // Miners Category
  {
    name: 'Clore.ai',
    slug: 'clore-ai',
    category: 'miners',
    description: 'AI Computing платформа для старого оборудования (HiveOS/риги)',
    earning_type: 'Pay-per-task',
    min_gpu: 'Любые',
    profit_level: 'низко-средняя',
    setup_complexity: 'средний',
    commission: '15-25%',
    legacy_support: 1,
    scalability: 'средне',
    website_url: 'https://clore.ai',
    hourly_rate_usd: 0.5,
  },
  {
    name: 'OctaSpace',
    slug: 'octaspace',
    category: 'miners',
    description: 'Децентрализованная сеть вычислений с поддержкой старого оборудования',
    earning_type: 'Proof-of-Work',
    min_gpu: 'Любые',
    profit_level: 'средняя',
    setup_complexity: 'средний',
    commission: '2-5%',
    legacy_support: 1,
    scalability: 'да',
    website_url: 'https://octaspace.com',
    api_available: 1,
    hourly_rate_usd: 0.8,
  },

  // Single PC Category
  {
    name: 'Salad',
    slug: 'salad',
    category: 'single_pc',
    description: 'Пассивный заработок - включи и забудь на своём ПК',
    earning_type: 'Passive per hour',
    min_gpu: 'Gaming GPU',
    profit_level: 'низкая',
    setup_complexity: 'очень легко',
    commission: '25%',
    legacy_support: 1,
    scalability: 'нет',
    website_url: 'https://salad.com',
    hourly_rate_usd: 0.2,
  },
  {
    name: 'GamerHash',
    slug: 'gamerhash',
    category: 'single_pc',
    description: 'Комбинированный заработок: пассивный + задачи для простых ПК',
    earning_type: 'Per-task + passive',
    min_gpu: 'Любые',
    profit_level: 'низко-средняя',
    setup_complexity: 'легко',
    commission: '20%',
    legacy_support: 1,
    scalability: 'средне',
    website_url: 'https://gamerhash.com',
    hourly_rate_usd: 0.4,
  },
  {
    name: 'Nosana',
    slug: 'nosana',
    category: 'single_pc',
    description: 'Децентрализованная сеть для рендеринга и вычислений',
    earning_type: 'Crypto rewards',
    min_gpu: 'RTX 3080+',
    profit_level: 'средняя',
    setup_complexity: 'средний',
    commission: '5-10%',
    legacy_support: 0,
    scalability: 'да',
    website_url: 'https://nosana.io',
    docs_url: 'https://docs.nosana.io',
    api_available: 1,
    hourly_rate_usd: 0.9,
  },

  // Business Category
  {
    name: 'Vast.ai',
    slug: 'vast-ai',
    category: 'business',
    description: 'Рынок GPU мощностей - сдавай свой GPU и зарабатывай',
    earning_type: 'Hourly rental',
    min_gpu: 'RTX 4090+',
    profit_level: 'высокая',
    setup_complexity: 'средний',
    commission: '30%',
    legacy_support: 0,
    scalability: 'да',
    website_url: 'https://vast.ai',
    docs_url: 'https://vast.ai/docs',
    api_available: 1,
    hourly_rate_usd: 2.5,
  },
  {
    name: 'RunPod',
    slug: 'runpod',
    category: 'business',
    description: 'Облачная платформа для рендеринга и AI задач',
    earning_type: 'Per-hour billing',
    min_gpu: 'RTX 4090 / A100',
    profit_level: 'высокая',
    setup_complexity: 'средний',
    commission: '25-30%',
    legacy_support: 0,
    scalability: 'да',
    website_url: 'https://runpod.io',
    docs_url: 'https://docs.runpod.io',
    api_available: 1,
    hourly_rate_usd: 2.2,
  },
  {
    name: 'io.net',
    slug: 'io-net',
    category: 'business',
    description: 'Децентрализованная сеть GPU с токеном IO',
    earning_type: 'Token rewards + fees',
    min_gpu: 'RTX 4070+',
    profit_level: 'высокая',
    setup_complexity: 'средний',
    commission: '5-15%',
    legacy_support: 0,
    scalability: 'да',
    website_url: 'https://io.net',
    docs_url: 'https://docs.io.net',
    api_available: 1,
    hourly_rate_usd: 2.0,
  },
  {
    name: 'Prime Intellect',
    slug: 'prime-intellect',
    category: 'business',
    description: 'Премиум платформа для серьезного бизнеса с A100/H100',
    earning_type: 'Rental + compute share',
    min_gpu: 'A100 / H100',
    profit_level: 'очень высокая',
    setup_complexity: 'высокий',
    commission: '20%',
    legacy_support: 0,
    scalability: 'да',
    website_url: 'https://primeintellect.ai',
    docs_url: 'https://docs.primeintellect.ai',
    api_available: 1,
    hourly_rate_usd: 4.5,
  },
  {
    name: 'TensorDock',
    slug: 'tensordock',
    category: 'business',
    description: 'Облачный рынок GPU мощностей с простой интеграцией',
    earning_type: 'Hourly rental',
    min_gpu: 'RTX 4090+',
    profit_level: 'высокая',
    setup_complexity: 'средний',
    commission: '25%',
    legacy_support: 0,
    scalability: 'да',
    website_url: 'https://tensordock.ai',
    api_available: 1,
    hourly_rate_usd: 1.8,
  },

  // Decentralized Category
  {
    name: 'Akash Network',
    slug: 'akash-network',
    category: 'decentralized',
    description: 'Полностью децентрализованная облачная сеть (Cosmos)',
    earning_type: 'Token rewards',
    min_gpu: 'Любые',
    profit_level: 'средняя',
    setup_complexity: 'высокий',
    commission: '2-5%',
    legacy_support: 1,
    scalability: 'да',
    website_url: 'https://akash.network',
    docs_url: 'https://docs.akash.network',
    github_url: 'https://github.com/akash-network',
    api_available: 1,
    hourly_rate_usd: 0.7,
  },
];

const seedPlatforms = async () => {
  try {
    await db.initDatabase();
    console.log('✅ Database connected');

    let insertedCount = 0;

    for (const platform of platformsData) {
      try {
        const result = await db.run(
          `INSERT OR REPLACE INTO platforms
           (name, slug, category, description, earning_type, min_gpu, profit_level, setup_complexity,
            commission, legacy_support, scalability, website_url, docs_url, github_url, api_available, hourly_rate_usd)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            platform.name,
            platform.slug,
            platform.category,
            platform.description,
            platform.earning_type,
            platform.min_gpu,
            platform.profit_level,
            platform.setup_complexity,
            platform.commission,
            platform.legacy_support || 0,
            platform.scalability,
            platform.website_url,
            platform.docs_url || null,
            platform.github_url || null,
            platform.api_available || 0,
            platform.hourly_rate_usd,
          ]
        );

        console.log(`✅ Added/Updated: ${platform.name}`);
        insertedCount++;
      } catch (err) {
        console.error(`❌ Error inserting ${platform.name}:`, err.message);
      }
    }

    console.log(`\n✅ Platform seeding completed: ${insertedCount}/${platformsData.length}`);
    await db.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedPlatforms();
