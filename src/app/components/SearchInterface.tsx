import { useState, useRef, useEffect } from 'react';
import { Search, Send, Loader2, Calendar, MapPin, Users } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface SearchInterfaceProps {
  psychotype: string;
  filters: {
    maxPrice: number | null;
    stars: number[];
    amenities: string[];
  };
  onHotelsFound: (hotels: any[]) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function SearchInterface({ psychotype, filters, onHotelsFound }: SearchInterfaceProps) {
  const [quickSearch, setQuickSearch] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick search - structured form
  const handleQuickSearch = async () => {
    if (!quickSearch.location || !quickSearch.checkIn || !quickSearch.checkOut) {
      alert('Пожалуйста, заполните все поля поиска');
      return;
    }

    const searchQuery = `Найди отель в ${quickSearch.location} с ${quickSearch.checkIn} по ${quickSearch.checkOut} для ${quickSearch.adults} взрослых`;
    
    if (filters.maxPrice) {
      searchQuery + ` с ценой до ${filters.maxPrice} рублей`;
    }
    
    await sendMessage(searchQuery);
  };

  // AI Chat search
  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const claudeApiKey = localStorage.getItem('claudeApiKey');
    const travelpayoutsToken = localStorage.getItem('travelpayoutsToken');

    console.log('Claude API Key present:', !!claudeApiKey);
    console.log('Travelpayouts Token present:', !!travelpayoutsToken);

    if (!claudeApiKey) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '⚠️ Claude API ключ не настроен. Пожалуйста, перейдите в Панель агентства и настройте API ключи.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);

    try {
      console.log('Sending request to AI chat endpoint...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c3625fc2/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            message: textToSend,
            psychotype,
            conversationHistory: messages,
            claudeApiKey,
            travelpayoutsToken: travelpayoutsToken || '',
          }),
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to get AI response`);
      }

      const data = await response.json();
      console.log('AI Response data:', data);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);

      // If hotels were found, update the results
      if (data.hotels && data.hotels.length > 0) {
        onHotelsFound(data.hotels);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Извините, произошла ошибка: ${error.message}. Пожалуйста, проверьте настройки API ключей.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Quick Search Form */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Быстрый поиск</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Город"
              value={quickSearch.location}
              onChange={(e) => setQuickSearch({ ...quickSearch, location: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Check-in */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={quickSearch.checkIn}
              onChange={(e) => setQuickSearch({ ...quickSearch, checkIn: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Check-out */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={quickSearch.checkOut}
              onChange={(e) => setQuickSearch({ ...quickSearch, checkOut: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Adults */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={quickSearch.adults}
              onChange={(e) => setQuickSearch({ ...quickSearch, adults: Number(e.target.value) })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'взрослый' : 'взрослых'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleQuickSearch}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Ищу лучшие варианты...
            </span>
          ) : (
            'Найти отели'
          )}
        </button>
      </div>

      {/* AI Chat Interface */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
            <Send className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI-ассистент</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Powered by Claude
          </span>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="mb-4 space-y-3 max-h-96 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
            placeholder="Например: Найди ром��нтический отель в Сочи на выходные"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Example queries */}
        {messages.length === 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-600 mb-2">Примеры запросов:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Найди отель в Москве на завтра',
                'Покажи романтические отели в Питере',
                'Бюджетный отель у моря',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setInput(example)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}