import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function Diagnostics() {
  const navigate = useNavigate();
  const [checks, setChecks] = useState({
    claudeKey: false,
    travelpayoutsToken: false,
    backendHealth: false,
    claudeApi: false,
  });
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [claudeModel, setClaudeModel] = useState<string>('');

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runDiagnostics = async () => {
    setTesting(true);
    setLogs([]);
    setClaudeModel('');
    setChecks({
      claudeKey: false,
      travelpayoutsToken: false,
      backendHealth: false,
      claudeApi: false,
    });

    // Check 1: localStorage keys
    addLog('Проверка локальных ключей...');
    const claudeKey = localStorage.getItem('claudeApiKey');
    const travelpayoutsToken = localStorage.getItem('travelpayoutsToken');
    
    setChecks((prev) => ({
      ...prev,
      claudeKey: !!claudeKey,
      travelpayoutsToken: !!travelpayoutsToken,
    }));

    if (claudeKey) {
      addLog('✓ Claude API ключ найден');
    } else {
      addLog('✗ Claude API ключ не найден');
    }

    if (travelpayoutsToken) {
      addLog('✓ Travelpayouts токен найден');
    } else {
      addLog('✗ Travelpayouts токен не найден');
    }

    // Check 2: Backend health
    addLog('Проверка backend...');
    try {
      const healthResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c3625fc2/health`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (healthResponse.ok) {
        const data = await healthResponse.json();
        addLog(`✓ Backend доступен: ${data.service}`);
        setChecks((prev) => ({ ...prev, backendHealth: true }));
      } else {
        addLog(`✗ Backend недоступен: ${healthResponse.status}`);
      }
    } catch (error: any) {
      addLog(`✗ Ошибка подключения к backend: ${error.message}`);
    }

    // Check 3: Claude API test
    if (claudeKey) {
      addLog('Тестирование Claude API...');
      try {
        const testResponse = await fetch(
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

        const testData = await testResponse.json();
        
        if (testData.success) {
          const model = testData.model || 'неизвестно';
          addLog(`✓ Claude API работает корректно (модель: ${model})`);
          setClaudeModel(model);
          setChecks((prev) => ({ ...prev, claudeApi: true }));
        } else {
          addLog(`✗ Claude API ошибка: ${testData.error}`);
          console.error('Claude API test failed:', testData);
        }
      } catch (error: any) {
        addLog(`✗ Ошибка при тестировании Claude API: ${error.message}`);
        console.error('Claude API test exception:', error);
      }
    }

    addLog('Диагностика завершена');
    setTesting(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Назад</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Диагностика системы
            </h1>
            <p className="text-gray-600">
              Проверка всех компонентов AI-платформы
            </p>
          </div>

          {/* Status Checks */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getIcon(checks.claudeKey)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Claude API Key</h3>
                <p className="text-sm text-gray-600">
                  {checks.claudeKey ? 'Ключ настроен' : 'Ключ не найден'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getIcon(checks.travelpayoutsToken)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Travelpayouts Token</h3>
                <p className="text-sm text-gray-600">
                  {checks.travelpayoutsToken ? 'Токен настроен' : 'Токен не найден'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getIcon(checks.backendHealth)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Backend Status</h3>
                <p className="text-sm text-gray-600">
                  {checks.backendHealth ? 'Сервер доступен' : 'Сервер недоступен'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getIcon(checks.claudeApi)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Claude API Connection</h3>
                <p className="text-sm text-gray-600">
                  {checks.claudeApi 
                    ? `API работает${claudeModel ? ` (модель: ${claudeModel})` : ''}` 
                    : 'API недоступен или неверный ключ'}
                </p>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Логи диагностики</h2>
            <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="text-sm text-gray-300 font-mono mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={runDiagnostics}
              disabled={testing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {testing ? 'Проверка...' : 'Повторить диагностику'}
            </button>

            {(!checks.claudeKey || !checks.claudeApi) && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Настроить API ключи
              </button>
            )}
          </div>

          {/* Summary */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Как исправить проблемы:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  {!checks.claudeKey && (
                    <li>Получите Claude API ключ на console.anthropic.com</li>
                  )}
                  {!checks.travelpayoutsToken && (
                    <li>Зарегистрируйтесь на travelpayouts.com и получите токен</li>
                  )}
                  {!checks.backendHealth && (
                    <li>Проверьте подключение к интернету и статус Supabase</li>
                  )}
                  {checks.claudeKey && !checks.claudeApi && (
                    <li>Проверьте правильность Claude API ключа (формат: sk-ant-...)</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
