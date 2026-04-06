/**
 * Platform Classification and Structure
 * Comprehensive GPU earning platforms guide
 */

// ===== ОСНОВНЫЕ КАТЕГОРИИ =====

export const platformCategories = {
  // Для опытных майнеров (HiveOS, риги)
  forMiners: {
    name: "Для опытных майнеров (HiveOS/риги)",
    description: "Платформы с поддержкой старого оборудования и пулов",
    platforms: [
      {
        id: "clore",
        name: "Clore.ai",
        type: "AI Computing",
        earning: "Pay-per-task",
        requirements: "GPU/CPU задачи",
        minProfit: "низкий-средний",
        complexity: "средний",
        docs: "https://clore.ai"
      },
      {
        id: "octaspace",
        name: "OctaSpace",
        type: "Decentralized Computing",
        earning: "Proof-of-Work",
        requirements: "Any GPU",
        minProfit: "средний",
        complexity: "средний",
        docs: "https://octaspace.com"
      }
    ]
  },

  // Для владельцев мощных одиночных ПК
  forSinglePC: {
    name: "Для владельцев мощных одиночных ПК",
    description: "Простые в настройке, не требуют специальных знаний",
    platforms: [
      {
        id: "salad",
        name: "Salad",
        type: "P2P Network",
        earning: "Passive per hour",
        requirements: "Gaming PC",
        minProfit: "низкий",
        complexity: "очень легко",
        docs: "https://salad.com"
      },
      {
        id: "gamerhash",
        name: "GamerHash",
        type: "Distributed Computing",
        earning: "Per-task + passive",
        requirements: "Any GPU",
        minProfit: "низкий-средний",
        complexity: "легко",
        docs: "https://gamerhash.com"
      },
      {
        id: "nosana",
        name: "Nosana",
        type: "Decentralized Network",
        earning: "Crypto rewards",
        requirements: "Modern GPU",
        minProfit: "средний",
        complexity: "средний",
        setupGuide: "https://docs.nosana.io"
      }
    ]
  },

  // Для серьёзного бизнеса
  forBusiness: {
    name: "Для тех, кто хочет строить серьёзный бизнес",
    description: "Масштабируемые платформы с высоким доходом",
    platforms: [
      {
        id: "vastai",
        name: "Vast.ai",
        type: "Peer-to-Peer Rental",
        earning: "Hourly rental rate",
        requirements: "High-end GPU",
        minProfit: "высокий",
        complexity: "средний",
        docs: "https://vast.ai"
      },
      {
        id: "runpod",
        name: "RunPod",
        type: "Cloud Computing",
        earning: "Per-hour billing",
        requirements: "RTX 4090 / A100 preferred",
        minProfit: "высокий",
        complexity: "средний",
        docs: "https://runpod.io"
      },
      {
        id: "ionet",
        name: "io.net",
        type: "Decentralized GPU Network",
        earning: "Token rewards + fees",
        requirements: "Modern GPU",
        minProfit: "высокий",
        complexity: "средний",
        docs: "https://io.net"
      },
      {
        id: "primeintel",
        name: "Prime Intellect",
        type: "GPU Cloud Platform",
        earning: "Rental + compute share",
        requirements: "High-end GPU (A100/H100)",
        minProfit: "очень высокий",
        complexity: "высокий",
        setupGuide: "https://primeintellect.ai/docs"
      }
    ]
  }
};

// ===== ДОПОЛНИТЕЛЬНЫЕ ПЛАТФОРМЫ =====

export const additionalPlatforms = {
  "tensordock": {
    name: "TensorDock",
    type: "Cloud GPU Marketplace",
    earning: "Hourly rental",
    requirements: "GPU (RTX 4090+)",
    minProfit: "высокий",
    complexity: "средний",
    docs: "https://tensordock.ai"
  },
  "lambda": {
    name: "Lambda Labs",
    type: "Cloud Computing",
    earning: "Batch processing",
    requirements: "Enterprise setup",
    minProfit: "очень высокий",
    complexity: "высокий"
  },
  "akash": {
    name: "Akash Network",
    type: "Decentralized Cloud",
    earning: "Token rewards",
    requirements: "Any GPU",
    minProfit: "средний",
    complexity: "высокий"
  }
};

// ===== СРАВНИТЕЛЬНАЯ ТАБЛИЦА =====

export const comparisonTable = {
  criteria: [
    "Тип заработка",
    "Требования к GPU",
    "Минимальная прибыль",
    "Сложность настройки",
    "Стабильность",
    "Комиссия платформы",
    "Поддержка старого оборудования",
    "Масштабируемость"
  ],
  platforms: {
    "clore": {
      earning: "Pay-per-task",
      gpu: "Любые",
      profit: "Низкая",
      setup: "Средняя",
      stability: "Хорошая",
      fee: "15-25%",
      legacy: "✅ Да",
      scalable: "Средне"
    },
    "octaspace": {
      earning: "PoW rewards",
      gpu: "Любые",
      profit: "Средняя",
      setup: "Средняя",
      stability: "Хорошая",
      fee: "2-5%",
      legacy: "✅ Да",
      scalable: "Да"
    },
    "salad": {
      earning: "Passive per hour",
      gpu: "Gaming GPU",
      profit: "Низкая",
      setup: "Очень легко",
      stability: "Хорошая",
      fee: "25%",
      legacy: "✅ Да",
      scalable: "Нет"
    },
    "gamerhash": {
      earning: "Per-task + passive",
      gpu: "Любые",
      profit: "Низко-средняя",
      setup: "Легко",
      stability: "Хорошая",
      fee: "20%",
      legacy: "✅ Да",
      scalable: "Средне"
    },
    "nosana": {
      earning: "Crypto rewards",
      gpu: "RTX 3080+",
      profit: "Средняя",
      setup: "Средняя",
      stability: "Очень хорошая",
      fee: "5-10%",
      legacy: "❌ Нет",
      scalable: "Да"
    },
    "vastai": {
      earning: "Hourly rental",
      gpu: "RTX 4090+",
      profit: "Высокая",
      setup: "Средняя",
      stability: "Отличная",
      fee: "30%",
      legacy: "❌ Нет",
      scalable: "Да"
    },
    "runpod": {
      earning: "Per-hour billing",
      gpu: "RTX 4090/A100",
      profit: "Высокая",
      setup: "Средняя",
      stability: "Отличная",
      fee: "25-30%",
      legacy: "❌ Нет",
      scalable: "Да"
    },
    "ionet": {
      earning: "Token + fees",
      gpu: "RTX 4070+",
      profit: "Высокая",
      setup: "Средняя",
      stability: "Хорошая",
      fee: "5-15%",
      legacy: "❌ Нет",
      scalable: "Да"
    },
    "primeintel": {
      earning: "Rental + compute",
      gpu: "A100/H100",
      profit: "Очень высокая",
      setup: "Высокая",
      stability: "Отличная",
      fee: "20%",
      legacy: "❌ Нет",
      scalable: "Да"
    }
  }
};

// ===== РЕКОМЕНДАЦИИ ПО ВЫБОРУ =====

export const recommendations = {
  "Я начинающий майнер с Nvidia GPU": [
    "Salad (самый простой способ)",
    "GamerHash (есть опции для заработка)",
    "Clore.ai (если есть более мощный GPU)"
  ],

  "У меня есть RTX 4090/A100 и я хочу максимума": [
    "Vast.ai (самый популярный и стабильный)",
    "Prime Intellect (если нужна максимальная прибыль)",
    "RunPod (промежуточный вариант)"
  ],

  "Я верю в децентрализацию и крипто": [
    "io.net (баланс заработка и будущего)",
    "Akash Network (долгосрочная ставка)",
    "Nosana (для серьёзных операторов)"
  ],

  "Я опытный майнер с HiveOS/риг": [
    "Clore.ai (поддержка старого оборудования)",
    "OctaSpace (децентрализованный PoW)",
    "GamerHash (простота + гибкость)"
  ],

  "Я хочу пассивный заработок без забот": [
    "Salad (включить и забыть)",
    "GamerHash (минимум настроек)"
  ],

  "Я строю серьёзный бизнес": [
    "Vast.ai (экосистема для провайдеров)",
    "io.net (будущее децентрализации)",
    "Prime Intellect (максимум функций)"
  ]
};

export default {
  platformCategories,
  additionalPlatforms,
  comparisonTable,
  recommendations
};
