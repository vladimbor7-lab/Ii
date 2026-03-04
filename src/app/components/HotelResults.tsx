import { Star, MapPin, Wifi, Utensils, Car, ExternalLink } from 'lucide-react';

interface Hotel {
  id?: string;
  name?: string;
  location?: string;
  stars?: number;
  priceAvg?: number;
  price?: number;
  rating?: number;
  photoUrl?: string;
  amenities?: string[];
  distance?: string;
}

interface HotelResultsProps {
  hotels: Hotel[];
}

export function HotelResults({ hotels }: HotelResultsProps) {
  if (hotels.length === 0) {
    return null;
  }

  // Fallback data for demo if API doesn't return complete data
  const getHotelData = (hotel: Hotel, index: number): Hotel => {
    return {
      id: hotel.id || `hotel-${index}`,
      name: hotel.name || `Отель ${index + 1}`,
      location: hotel.location || 'Город',
      stars: hotel.stars || 4,
      priceAvg: hotel.priceAvg || hotel.price || 5000 + Math.random() * 10000,
      rating: hotel.rating || 4.0 + Math.random(),
      photoUrl: hotel.photoUrl,
      amenities: hotel.amenities || ['wifi', 'breakfast', 'parking'],
      distance: hotel.distance || `${(Math.random() * 5).toFixed(1)} км от центра`,
    };
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, any> = {
      wifi: Wifi,
      breakfast: Utensils,
      parking: Car,
    };
    return icons[amenity] || Wifi;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Найдено отелей: {hotels.length}
        </h3>
        <span className="text-sm text-gray-600">
          Данные с Ostrovok.ru
        </span>
      </div>

      <div className="space-y-4">
        {hotels.map((hotelRaw, index) => {
          const hotel = getHotelData(hotelRaw, index);
          
          return (
            <div
              key={hotel.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Hotel Image */}
                <div className="md:w-1/3 bg-gray-200 relative h-48 md:h-auto">
                  {hotel.photoUrl ? (
                    <img
                      src={hotel.photoUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <span className="text-gray-400 text-sm">Фото недоступно</span>
                    </div>
                  )}
                  
                  {/* Stars Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Hotel Info */}
                <div className="md:w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{hotel.name}</h4>
                      {hotel.rating && (
                        <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                          <Star className="w-3 h-3 fill-white" />
                          {hotel.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.location} • {hotel.distance}</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {hotel.amenities?.slice(0, 3).map((amenity, i) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                          >
                            <Icon className="w-3 h-3" />
                            <span className="capitalize">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600">Средняя цена за ночь</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(hotel.priceAvg!).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                    <a
                      href={`https://ostrovok.ru/hotel/${hotel.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Забронировать
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hotels.length >= 10 && (
        <div className="mt-6 text-center">
          <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Загрузить ещё
          </button>
        </div>
      )}
    </div>
  );
}
