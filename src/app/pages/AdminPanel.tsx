import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Key, Save, CheckCircle, TestTube2, Activity } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [claudeKey, setClaudeKey] = useState(localStorage.getItem('claudeApiKey') || '');
  const [travelpayoutsKey, setTravelpayoutsKey] = useState(localStorage.getItem('travelpayoutsToken') || '');
  const [agencyName, setAgencyName] = useState(localStorage.getItem('agencyName') || '');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = () => {
    localStorage.setItem('claudeApiKey', claudeKey);
    localStorage.setItem('travelpayoutsToken', travelpayoutsKey);
    localStorage.setItem('agencyName', agencyName);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestClaude = async () => {
    if (!claudeKey) {
      setTestResult({ success: false, message: 'Введите Claude API ключ' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c3625fc2/test-claude`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ claudeApiKey: claudeKey }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const model = data.model || 'неизвестно';
        setTestResult({ success: true, message: `✅ Claude API ключ работает! Модель: ${model}` });
      } else {
        setTestResult({ success: false, message: `❌ Ошибка: ${data.error}` });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: `❌ Ошибка: ${error.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад к поиску</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Панель агентства
            </h1>
            <p className="text-gray-600">
              Настройте API ключи для вашего туристического агентства
            </p>
          </div>

          <div className="space-y-6">
            {/* Agency Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название агентства
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Например: Твой Тур"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Claude API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Claude API Key
                </div>
              </label>
              <input
                type="password"
                value={claudeKey}
                onChange={(e) => setClaudeKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              />
              <p className="mt-2 text-sm text-gray-500">
                Получите ключ на{' '}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Anthropic Console
                </a>
              </p>
              <button
                onClick={handleTestClaude}
                disabled={testing || !claudeKey}
                className="mt-2 flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TestTube2 className="w-4 h-4" />
                {testing ? 'Проверка...' : 'Проверить ключ'}
              </button>
              {testResult && (
                <div className={`mt-2 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.message}
                </div>
              )}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2 font-medium">
                  Поддерживаемые модели (автоматический выбор):
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Claude 3 Haiku (быстрая, доступна для всех)</li>
                  <li>• Claude 3 Sonnet (баланс скорости и качества)</li>
                  <li>• Claude 3 Opus (самая мощная)</li>
                  <li>• Claude 3.5 Sonnet (если доступна)</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  Система автоматически выберет лучшую доступную модель для вашего API ключа.
                </p>
              </div>
            </div>

            {/* Travelpayouts Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Travelpayouts API Token
                </div>
              </label>
              <input
                type="password"
                value={travelpayoutsKey}
                onChange={(e) => setTravelpayoutsKey(e.target.value)}
                placeholder="Ваш токен Travelpayouts"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              />
              <p className="mt-2 text-sm text-gray-500">
                Зарегистрируйтесь на{' '}
                <a
                  href="https://www.travelpayouts.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Travelpayouts
                </a>
                {' '}для доступа к данным Ostrovok.ru
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Персонализация для каждого агентства
              </h3>
              <p className="text-sm text-blue-700">
                Каждое туристическое агентство использует свои API ключи. 
                Это позволяет отслеживать статистику и получать комиссию 
                от Travelpayouts индивидуально.
              </p>
            </div>

            {/* Telegram/VK Integration Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">
                Интеграция с мессенджерами (Coming Soon)
              </h3>
              <p className="text-sm text-purple-700 mb-2">
                В следующих версиях будет доступна интеграция с:
              </p>
              <ul className="text-sm text-purple-700 list-disc list-inside space-y-1">
                <li>Telegram Bot API</li>
                <li>VK Bot API</li>
                <li>WhatsApp Business API</li>
              </ul>
            </div>

            {/* Save Button */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Save className="w-5 h-5" />
                Сохранить настройки
              </button>

              <button
                onClick={() => navigate('/diagnostics')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                <Activity className="w-5 h-5" />
                Диагностика системы
              </button>

              {saved && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Сохранено!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>🔒 Безопасность:</strong> API ключи хранятся только в вашем браузере (localStorage). 
            Для продакшн-версии рекомендуется использовать защищённый backend с шифрованием.
          </p>
        </div>
      </main>
    </div>
  );
}