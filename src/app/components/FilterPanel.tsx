import { useState } from 'react';
import { Sliders, Star, Wifi, Utensils, Car, Dumbbell, Wind, Waves } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    maxPrice: number | null;
    stars: number[];
    amenities: string[];
  };
  onFiltersChange: (filters: any) => void;
}

const amenitiesList = [
  { id: 'wifi', name: 'Wi-Fi', icon: Wifi },
  { id: 'breakfast', name: 'Завтрак', icon: Utensils },
  { id: 'parking', name: 'Парковка', icon: Car },
  { id: 'gym', name: 'Спортзал', icon: Dumbbell },
  { id: 'ac', name: 'Кондиционер', icon: Wind },
  { id: 'pool', name: 'Бассейн', icon: Waves },
];

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [priceRange, setPriceRange] = useState(filters.maxPrice || 20000);

  const toggleStar = (star: number) => {
    const newStars = filters.stars.includes(star)
      ? filters.stars.filter((s) => s !== star)
      : [...filters.stars, star];
    onFiltersChange({ ...filters, stars: newStars });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  const handlePriceChange = (value: number) => {
    setPriceRange(value);
    onFiltersChange({ ...filters, maxPrice: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Фильтры</h3>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Цена за ночь
        </label>
        <input
          type="range"
          min="1000"
          max="50000"
          step="1000"
          value={priceRange}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">1 000 ₽</span>
          <span className="text-sm font-semibold text-blue-600">
            до {priceRange.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      {/* Stars */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Звёздность отеля
        </label>
        <div className="flex gap-2">
          {[3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => toggleStar(star)}
              className={`
                flex items-center gap-1 px-3 py-2 rounded-lg border transition-all
                ${
                  filters.stars.includes(star)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-600'
                }
              `}
            >
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{star}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Удобства
        </label>
        <div className="space-y-2">
          {amenitiesList.map((amenity) => {
            const Icon = amenity.icon;
            const isSelected = filters.amenities.includes(amenity.id);
            
            return (
              <button
                key={amenity.id}
                onClick={() => toggleAmenity(amenity.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left
                  ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{amenity.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() => {
          setPriceRange(20000);
          onFiltersChange({ maxPrice: null, stars: [], amenities: [] });
        }}
        className="w-full mt-6 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Сбросить фильтры
      </button>
    </div>
  );
}
