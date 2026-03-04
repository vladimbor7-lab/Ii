import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import Anthropic from 'npm:@anthropic-ai/sdk';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Инициализация Claude AI
const getClaudeClient = (apiKey: string) => {
  return new Anthropic({ apiKey });
};

// Описание инструмента для Claude Tool Use
const searchHotelsTool = {
  name: 'search_hotels',
  description: 'Поиск отелей через Travelpayouts API (Ostrovok.ru). Возвращает реальные цены и доступность отелей в режиме реального времени.',
  input_schema: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'Город или локация для поиска отелей (например, "Санкт-Петербург", "Москва", "Сочи")',
      },
      checkIn: {
        type: 'string',
        description: 'Дата заезда в формате YYYY-MM-DD',
      },
      checkOut: {
        type: 'string',
        description: 'Дата выезда в формате YYYY-MM-DD',
      },
      adults: {
        type: 'number',
        description: 'Количество взрослых (по умолчанию 2)',
      },
      maxPrice: {
        type: 'number',
        description: 'Максимальная цена за ночь в рублях',
      },
      stars: {
        type: 'array',
        items: { type: 'number' },
        description: 'Количество звезд отеля (массив, например [4, 5])',
      },
    },
    required: ['location', 'checkIn', 'checkOut'],
  },
};

// Эндпоинт для поиска отелей через Travelpayouts
app.post('/make-server-c3625fc2/search-hotels', async (c) => {
  try {
    const { location, checkIn, checkOut, adults = 2, maxPrice, stars } = await c.req.json();
    const travelpayoutsToken = c.req.header('X-Travelpayouts-Token');

    if (!travelpayoutsToken) {
      return c.json({ error: 'Travelpayouts token is required' }, 400);
    }

    console.log(`Searching hotels in ${location} from ${checkIn} to ${checkOut}`);

    // Формируем запрос к Travelpayouts API
    // ВАЖНО: Travelpayouts использует ещё Location ID, который нужно получить через API геокодинга
    
    // Сначала получаем ID локации
    const locationResponse = await fetch(
      `https://api.travelpayouts.com/v1/city?term=${encodeURIComponent(location)}`,
      {
        headers: {
          'X-Access-Token': travelpayoutsToken,
        },
      }
    );

    if (!locationResponse.ok) {
      console.error(`Location API error: ${locationResponse.statusText}`);
      // Возвращаем демо-данные если API недоступен
      return c.json({ 
        hotels: generateDemoHotels(location, 5),
        demo: true,
        message: 'Using demo data - configure Travelpayouts token for real data'
      });
    }

    const locationData = await locationResponse.json();
    
    if (!locationData || locationData.length === 0) {
      return c.json({ 
        hotels: generateDemoHotels(location, 5),
        demo: true,
        message: 'Location not found, showing demo data'
      });
    }

    const cityCode = locationData[0].code;

    // Теперь ищем отели
    // Используем Hotels API от Travelpayouts
    const hotelsResponse = await fetch(
      `https://yasen.hotellook.com/api/v2/search/start?location=${cityCode}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&limit=20`,
      {
        headers: {
          'X-Access-Token': travelpayoutsToken,
        },
      }
    );

    if (!hotelsResponse.ok) {
      console.error(`Hotels API error: ${hotelsResponse.statusText}`);
      return c.json({ 
        hotels: generateDemoHotels(location, 5),
        demo: true,
        message: 'Hotels API error, showing demo data'
      });
    }

    const hotelsData = await hotelsResponse.json();
    
    // Фильтруем по цене и звёздам если указано
    let hotels = hotelsData.hotels || [];
    
    if (maxPrice) {
      hotels = hotels.filter((h: any) => h.priceAvg <= maxPrice);
    }
    
    if (stars && stars.length > 0) {
      hotels = hotels.filter((h: any) => stars.includes(h.stars));
    }

    return c.json({
      hotels: hotels.slice(0, 10),
      searchId: hotelsData.searchId,
      location: cityCode,
    });

  } catch (error: any) {
    console.error('Error searching hotels:', error);
    const { location } = await c.req.json();
    return c.json({ 
      hotels: generateDemoHotels(location || 'Город', 5),
      demo: true,
      error: error.message 
    });
  }
});

// Генерация демо-данных для отелей
function generateDemoHotels(location: string, count: number) {
  const hotelNames = [
    'Гранд Отель',
    'Ренессанс',
    'Меридиан',
    'Корона',
    'Империал',
    'Европа',
    'Метрополь',
    'Савой',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `demo-hotel-${i}`,
    name: `${hotelNames[i % hotelNames.length]} ${location}`,
    location: location,
    stars: 3 + Math.floor(Math.random() * 3),
    priceAvg: 3000 + Math.floor(Math.random() * 15000),
    rating: 4.0 + Math.random(),
    amenities: ['wifi', 'breakfast', 'parking'],
    distance: `${(Math.random() * 5).toFixed(1)} км от центра`,
    demo: true,
  }));
}

// Эндпоинт для AI-ассистента с Claude Tool Use
app.post('/make-server-c3625fc2/ai-chat', async (c) => {
  try {
    const { message, psychotype, conversationHistory, claudeApiKey, travelpayoutsToken } = await c.req.json();

    if (!claudeApiKey) {
      return c.json({ error: 'Claude API key is required' }, 400);
    }

    const claude = getClaudeClient(claudeApiKey);
    
    // Системный промпт с учётом психотипа
    const systemPrompt = `Ты — эксперт по подбору туров и отелей. Твоя задача — помочь клиенту найти идеальный отель на Ostrovok.ru.

ПСИХОТИП КЛИЕНТА: ${psychotype || 'Не определён'}

ИНСТРУКЦИИ ПО ПСИХОТИПАМ:
- "Экономный путешественник": Фокус на лучших ценах, акциях, промокодах. Показывай варианты 3-4 звезды с хорошими отзывами. Упоминай возможность сэкономить.
- "Любитель комфорта": Предлагай отели 4-5 звёзд с SPA, завтраками, хорошим сервисом. Подчеркивай премиум-удобства.
- "Семейный отдых": Отели с детскими клубами, бассейнами, семейными номерами, близко к пляжу/достопримечательностям. Упоминай безопасность для детей.
- "Романтический отдых": Уединённые места, отели с романтической атмосферой, видом на море/горы. Подчеркивай интимность и красоту.
- "Бизнес-путешественник": Центр города, быстрый интернет, конференц-залы, близость к деловым районам. Фокус на удобстве и эффективности.
- "Искатель приключений": Экзотические локации, активны�� отдых, экскурсии, необычные впечатления. Предлагай активности и уникальные места.

ВАЖНО: 
- Когда пользователь запрашивает отели, ОБЯЗАТЕЛЬНО используй инструмент search_hotels для получения реальных данных.
- Отвечай по-русски, дружелюбно и профессионально.
- После получения результатов, представь отели с учётом психотипа клиента.
- Выдели 2-3 лучших варианта с объяснением, почему они подходят этому клиенту.`;

    // Формируем историю чата для Claude
    const messages: any[] = [];
    
    // Добавляем историю
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        messages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      });
    }

    // Добавляем новое сообщение
    messages.push({
      role: 'user',
      content: message,
    });

    console.log('Sending request to Claude with tools...');

    // Отправляем запрос в Claude с инструментами
    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      tools: [searchHotelsTool],
      messages: messages,
    });

    console.log('Claude response:', JSON.stringify(response, null, 2));

    // Проверяем, использовал ли Claude инструмент
    const toolUseBlock = response.content.find((block: any) => block.type === 'tool_use');
    
    if (toolUseBlock) {
      console.log('Claude is using tool:', toolUseBlock.name);
      
      // Вызываем функцию поиска отелей
      const toolInput = toolUseBlock.input;
      
      const hotelsResponse = await fetch(`${c.req.url.split('/ai-chat')[0]}/search-hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Travelpayouts-Token': travelpayoutsToken || '',
        },
        body: JSON.stringify(toolInput),
      });

      const hotelsData = await hotelsResponse.json();
      console.log('Hotels data:', hotelsData);

      // Отправляем результат обратно в Claude
      const followUpResponse = await claude.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemPrompt,
        tools: [searchHotelsTool],
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: response.content,
          },
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolUseBlock.id,
                content: JSON.stringify(hotelsData),
              },
            ],
          },
        ],
      });

      // Извлекаем текстовый ответ
      const textBlock = followUpResponse.content.find((block: any) => block.type === 'text');
      const finalMessage = textBlock ? textBlock.text : 'Не удалось получить ответ от AI';

      return c.json({
        message: finalMessage,
        hotels: hotelsData.hotels || [],
        functionCalled: true,
        demo: hotelsData.demo || false,
      });
    }

    // Если инструмент не использовался, просто возвращаем текстовый ответ
    const textBlock = response.content.find((block: any) => block.type === 'text');
    const finalMessage = textBlock ? textBlock.text : 'Не удалось получить ответ от AI';

    return c.json({
      message: finalMessage,
      functionCalled: false,
    });

  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return c.json({ error: `AI chat error: ${error.message}` }, 500);
  }
});

// Эндпоинт для определения психотипа клиента
app.post('/make-server-c3625fc2/analyze-psychotype', async (c) => {
  try {
    const { answers, claudeApiKey } = await c.req.json();

    if (!claudeApiKey) {
      return c.json({ error: 'Claude API key is required' }, 400);
    }

    const claude = getClaudeClient(claudeApiKey);

    const prompt = `Проанализируй ответы клиента и определи его психотип путешественника.

ОТВЕТЫ КЛИЕНТА:
${JSON.stringify(answers, null, 2)}

ДОСТУПНЫЕ ПСИХОТИПЫ:
1. "Экономный путешественник" - ищет лучшие цены, акции
2. "Любитель комфорта" - ценит сервис, удобства, премиум
3. "Семейный отдых" - путешествует с детьми, нужна инфраструктура
4. "Романтический отдых" - пары, медовый месяц, уединение
5. "Бизнес-путешественник" - командировки, деловые встречи
6. "Искатель приключений" - активный отдых, новые впечатления

Верни ТОЛЬКО ОДИН психотип из списка выше (точное название).`;

    const response = await claude.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((block: any) => block.type === 'text');
    const psychotype = textBlock ? textBlock.text.trim() : 'Не определён';

    return c.json({ psychotype });

  } catch (error: any) {
    console.error('Error analyzing psychotype:', error);
    return c.json({ error: `Failed to analyze psychotype: ${error.message}` }, 500);
  }
});

// Health check
app.get('/make-server-c3625fc2/health', (c) => {
  return c.json({ status: 'ok', service: 'AI Travel Assistant (Claude)' });
});

Deno.serve(app.fetch);
