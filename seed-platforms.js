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
    description: 'AI Computing платформа для старого оборудования (HiveOS/риги) с автоматическим майнингом в простое',
    earning_type: 'Pay-per-Hour',
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
    description: 'Децентрализованная сеть вычислений с поддержкой старого оборудования, как HiveOS для AI',
    earning_type: 'DePIN',
    min_gpu: 'Любые',
    profit_level: 'средняя',
    setup_complexity: 'средний',
    commission: '2-5%',
    legacy_support: 1,
    scalability: 'да',
    website_url: 'https://octa.space',
    api_available: 1,
    hourly_rate_usd: 0.8,
  },

  // Single PC Category
  {
    name: 'Salad',
    slug: 'salad',
    category: 'single_pc',
    description: 'Пассивный заработок - включи и забудь на своём ПК, идеально для геймеров с ненужной мощностью',
    earning_type: 'Pay-per-Hour',
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
    description: 'Комбинированный заработок: пассивный + AI задачи для простых ПК, отличная отправная точка',
    earning_type: 'Pay-per-Hour',
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
    description: 'Децентрализованная сеть AI Inference на Solana - выполнение запросов к нейросетям со своего GPU',
    earning_type: 'Inference',
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
    description: 'Рынок GPU мощностей - сдавай свой GPU и зарабатывай за каждый час использования, №1 рынок в своей сегменте',
    earning_type: 'Pay-per-Hour',
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
    description: 'Облачная платформа для рендеринга и AI задач с Community Cloud опцией',
    earning_type: 'Pay-per-Hour',
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
    description: 'Децентрализованная сеть GPU с токеном IO для обучения моделей',
    earning_type: 'DePIN',
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
    description: 'Премиум платформа для серьезного бизнеса с A100/H100 для обучения больших моделей',
    earning_type: 'Pay-per-Hour',
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
    description: 'Облачный рынок GPU мощностей с простой интеграцией для профифессионалов',
    earning_type: 'Pay-per-Hour',
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
    description: 'Полностью децентрализованная облачная сеть (Cosmos) с высокими требованиями к аптайму',
    earning_type: 'DePIN',
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
