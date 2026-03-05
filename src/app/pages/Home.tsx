import { useState, useEffect } from 'react';
import { SearchInterface } from '../components/SearchInterface';
import { PsychotypeSelector } from '../components/PsychotypeSelector';
import { HotelResults } from '../components/HotelResults';
import { FilterPanel } from '../components/FilterPanel';
import { Sparkles, Settings, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Home() {
  const navigate = useNavigate();
  const [psychotype, setPsychotype] = useState<string>('');
  const [showPsychotypeSelector, setShowPsychotypeSelector] = useState(true);
  const [hotels, setHotels] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    maxPrice: null as number | null,
    stars: [] as number[],
    amenities: [] as string[],
  });

  const claudeKeyConfigured = !!localStorage.getItem('claudeApiKey');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Подбор Туров
                </h1>
                <p className="text-sm text-gray-600">Умный поиск отелей с Ostrovok.ru</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Панель агентства</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Keys Warning */}
        {!claudeKeyConfigured && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                  Требуется настройка API ключей
                </h3>
                <p className="text-sm text-yellow-800 mb-2">
                  Для работы AI-помощника необходимо настроить Claude API ключ в Панели агентства.
                </p>
                <button
                  onClick={() => navigate('/admin')}
                  className="text-sm font-medium text-yellow-900 hover:text-yellow-950 underline"
                >
                  Перейти к настройкам →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Psychotype Selector */}
        {showPsychotypeSelector && !psychotype && (
          <div className="mb-8">
            <PsychotypeSelector
              onSelect={(type) => {
                setPsychotype(type);
                setShowPsychotypeSelector(false);
              }}
              onSkip={() => setShowPsychotypeSelector(false)}
            />
          </div>
        )}

        {/* Active Psychotype Badge */}
        {psychotype && (
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Психотип: {psychotype}
              </span>
            </div>
            <button
              onClick={() => setShowPsychotypeSelector(true)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Изменить
            </button>
          </div>
        )}

        {/* Search and Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters - Left Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Search and Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Interface */}
            <SearchInterface
              psychotype={psychotype}
              filters={filters}
              onHotelsFound={setHotels}
            />

            {/* Hotel Results */}
            {hotels.length > 0 && (
              <HotelResults hotels={hotels} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p className="text-sm">
            Powered by Claude AI • Ostrovok.ru через Travelpayouts API
          </p>
          <p className="text-xs mt-2 text-gray-500">
            Персонализированный AI-помощник для туристических агентств
          </p>
        </div>
      </footer>
    </div>
  );
}