/**
 * Create sample PDF guides for demonstration
 * Run once to populate /server/uploads/guides/ with examples
 * Usage: node create-sample-pdfs.js
 */

const path = require('path');
const fs = require('fs');
const { createSamplePDF } = require('./server/utils/pdfGenerator');

const guides = [
  {
    id: 1,
    title: 'Vast.ai: Полная инструкция для новичка',
    content: `я Vast.ai - одна из самых популярных платформ для заработка на GPU.

Что вы узнаете в этом гайде:
1. Как зарегистрироваться и настроить аккаунт
2. Как выбрать оптимальную видеокарту для работы
3. Как запустить первую задачу всего за 5 минут
4. Как избежать распространенных ошибок новичков
5. Как зарабатывать от $5 до $90 в месяц

Vast.ai идеален для:
- Абсолютных новичков (легкая настройка)
- Тестирования перед масштабированием
- Любых видеокарт от GTX 1070

Оборудование:
- Минимум: GTX 1070 6GB
- Рекомендуемо: RTX 2080+ для лучшего заработка

Заработок:
- $10-20 в день при среднем использовании
- До $90 в месяц при активной работе
- Выплаты мгновенные в Crypto`,
  },
  {
    id: 2,
    title: 'RunPod для AI разработчиков',
    content: `RunPod - платформа для тех, кто хочет максимизировать прибыль с мощной GPU.

Особенности RunPod:
1. Прямая аренда GPU мощным компаниям
2. Поддержка самых новых видеокарт (RTX 4090, H100)
3. Высокая доходность для мощного оборудования
4. Гибкая система ценообразования

Как начать:
• Зарегистрироваться на RunPod.io
• Указать характеристики вашей GPU
• Установить желаемую цену за час
• Ждать заказов от компаний

Средний заработок:
- $50-150+ в месяц для RTX 2080
- $200-500+ в месяц для RTX 3080
- Выше для более мощных карт

Требования:
- Минимум RTX 2080
- Стабильное интернет-соединение
- Linux система (рекомендуется)

Про совет:
Начните с конкурентной цены, потом повышайте по мере спроса.`,
  },
  {
    id: 3,
    title: 'io.net DePIN: Децентрализованная революция',
    content: `io.net - децентрализованная сеть для AI вычислений. Самая современная платформа.

Что такое DePIN?
DePIN (Decentralized Physical Infrastructure) - новое направление в крипто,
где люди сдают реальное оборудование (GPU, CPU, память) в сеть.

Правила io.net:
1. Требуется мощная GPU (RTX 3080+)
2. Требуются технические знания
3. Высокие заработки ($100-300+ в месяц)
4. Токен $IO - может расти в цене

Почему io.net особенный:
• Децентрализованная система - нет единого сервера
• Токен - вы владеете частью сети
• Прозрачность - все операции в блокчейне
• Будущее - DePIN это тренд на 2025-2026

Как начать:
1. Получить RTX 3080+ или лучше RTX 3090/4090
2. Установить ПО io.net воркера
3. Запустить и получать задачи
4. Приносить параллельно токены $IO

Доход:
- $150-300 в месяц реальных денег
- Плюс токены $IO (могут стоить $100-500 в месяц дополнительно)

Будущее:
io.net - инвестиция в будущее децентрального AI.`,
  },
];

async function createSampleGuides() {
  const uploadsDir = path.join(__dirname, 'server', 'uploads', 'guides');

  // Ensure directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`✅ Created directory: ${uploadsDir}`);
  }

  console.log('\n📄 Creating sample PDF guides...\n');

  for (const guide of guides) {
    const filePath = path.join(uploadsDir, `${guide.id}.pdf`);

    try {
      await createSamplePDF(filePath, guide.title, guide.content);
      console.log(`✅ Created: ${guide.title} (ID: ${guide.id})`);
    } catch (error) {
      console.error(`❌ Error creating ${guide.title}:`, error.message);
    }
  }

  console.log('\n✅ Sample PDFs created successfully!\n');
  console.log(`Location: ${uploadsDir}`);
  console.log('\nThese PDFs are ready for users to download after purchase.');
}

// Run if executed directly
if (require.main === module) {
  createSampleGuides().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { createSampleGuides };
