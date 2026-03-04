import { useState } from 'react';
import { Sparkles, DollarSign, Heart, Baby, Briefcase, Mountain, Home } from 'lucide-react';

interface PsychotypeSelectorProps {
  onSelect: (psychotype: string) => void;
  onSkip: () => void;
}

const psychotypes = [
  {
    id: 'economic',
    name: 'Экономный путешественник',
    icon: DollarSign,
    description: 'Ищете лучшие цены и специальные предложения',
    color: 'bg-green-100 text-green-700 border-green-300',
    hoverColor: 'hover:bg-green-200',
  },
  {
    id: 'comfort',
    name: 'Любитель комфорта',
    icon: Home,
    description: 'Цените высокий уровень сервиса и премиум удобства',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    hoverColor: 'hover:bg-purple-200',
  },
  {
    id: 'family',
    name: 'Семейный отдых',
    icon: Baby,
    description: 'Путешествуете с детьми, нужна семейная инфраструктура',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    hoverColor: 'hover:bg-blue-200',
  },
  {
    id: 'romantic',
    name: 'Романтический отдых',
    icon: Heart,
    description: 'Ищете уединённые места для пар',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
    hoverColor: 'hover:bg-pink-200',
  },
  {
    id: 'business',
    name: 'Бизнес-путешественник',
    icon: Briefcase,
    description: 'Командировки и деловые встречи',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    hoverColor: 'hover:bg-gray-200',
  },
  {
    id: 'adventure',
    name: 'Искатель приключений',
    icon: Mountain,
    description: 'Активный отдых и новые впечатления',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    hoverColor: 'hover:bg-orange-200',
  },
];

export function PsychotypeSelector({ onSelect, onSkip }: PsychotypeSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string, name: string) => {
    setSelectedId(id);
    setTimeout(() => {
      onSelect(name);
    }, 300);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Персонализация подбора
        </h2>
        <p className="text-gray-600">
          Выберите ваш психотип путешественника для более точных рекомендаций
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {psychotypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedId === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id, type.name)}
              className={`
                relative p-6 border-2 rounded-xl text-left transition-all
                ${type.color} ${type.hoverColor}
                ${isSelected ? 'ring-4 ring-blue-500 scale-105' : ''}
              `}
            >
              <Icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold mb-1 text-sm">
                {type.name}
              </h3>
              <p className="text-xs opacity-80">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>

      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Пропустить (подобрать без персонализации)
        </button>
      </div>
    </div>
  );
}
