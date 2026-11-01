import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Heart,
  TrendingDown,
  Navigation,
  Info,
  CheckCircle,
  Share2,
  Bookmark,
  Bus as BusIcon,
  Zap,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { OccupancyBadge } from '../../components/common/OccupancyBadge';
import { OccupancyProgressBar } from '../../components/common/OccupancyProgressBar';
import { RouteMap } from '../../components/common/RouteMap';
import { BusSearchResult, Route, BusStop } from '../../types';
import { predictionApi, stopApi, userApi } from '../../services/api';

const MYSURU_LOCATIONS = [
  'Mysuru City Bus Stand (CBS)',
  'Suburban Bus Stand',
  'Vijayanagar 1st Stage',
  'Kuvempunagar Complex',
  'Hebbal Industrial Area',
  'Jayalakshmipuram',
  'Infosys Mysuru Campus',
  'Chamundi Hill Temple',
  'Mysuru Palace (Amba Vilas)',
  'University of Mysore',
];

export const PassengerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Search State
  const [source, setSource] = useState('Mysuru City Bus Stand (CBS)');
  const [destination, setDestination] = useState('Infosys Mysuru Campus');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [travelHour, setTravelHour] = useState(() => new Date().getHours());
  const [isSearching, setIsSearching] = useState(false);

  // Results State
  const [searchResults, setSearchResults] = useState<BusSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBusForModal, setSelectedBusForModal] = useState<BusSearchResult | null>(null);

  // Favorites & History
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  // Active view tab: 'results' | 'map'
  const [activeTab, setActiveTab] = useState<'results' | 'map'>('results');

  // Load initial favorites and recent searches
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [favRoutes, searchHist] = await Promise.all([
          userApi.getFavorites(),
          userApi.getSearches(),
        ]);
        setFavorites(favRoutes.map((r) => r.id));
        setRecentSearches(searchHist);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    loadUserData();

    // Auto trigger initial search so the dashboard has rich data on first load
    executeSearch('Mysuru City Bus Stand (CBS)', 'Infosys Mysuru Campus', travelDate, travelHour);
  }, []);

  const executeSearch = async (src: string, dst: string, date: string, hour: number) => {
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await predictionApi.searchBuses({
        source: src,
        destination: dst,
        travel_date: date,
        travel_hour: hour,
      });
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(source, destination, travelDate, travelHour);
  };

  const handleSwapLocations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const toggleFavorite = async (routeId: number) => {
    if (favorites.includes(routeId)) {
      await userApi.removeFavorite(routeId);
      setFavorites(favorites.filter((id) => id !== routeId));
    } else {
      await userApi.addFavorite(routeId);
      setFavorites([...favorites, routeId]);
    }
  };

  // Recommended bus is the first one marked by backend ML algorithm
  const recommendedBus = searchResults.find((b) => b.is_recommended);
  const otherBuses = searchResults.filter((b) => !b.is_recommended);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-brand-darkest text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Welcome Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/20 relative overflow-hidden bg-gradient-to-r from-brand-navy via-brand-darkest to-brand-midnight">
          <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Mysuru City Transit</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-950/80 text-sky-300 border border-sky-400/40 text-[11px] font-bold">
                  Project by Kushal P
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Welcome back, {user?.full_name || 'Passenger'}!
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Check AI predicted bus occupancy, discover less crowded alternatives, and travel with
                maximum comfort.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab(activeTab === 'results' ? 'map' : 'results')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30 flex items-center gap-2 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>{activeTab === 'results' ? 'View Live Route Map' : 'View Bus Results'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Buses Section */}
        <section className="glass-panel p-6 rounded-2xl border border-brand-border/70 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Source Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Departure Stop</span>
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                >
                  {MYSURU_LOCATIONS.map((loc) => (
                    <option key={`src-${loc}`} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Destination Stop</span>
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition-colors"
                >
                  {MYSURU_LOCATIONS.map((loc) => (
                    <option key={`dst-${loc}`} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>Travel Date</span>
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Time of Day */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Departure Hour</span>
                </label>
                <select
                  value={travelHour}
                  onChange={(e) => setTravelHour(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => (
                    <option key={`hour-${h}`} value={h}>
                      {h}:00 {h >= 12 ? 'PM' : 'AM'} {(h >= 8 && h <= 10) || (h >= 17 && h <= 20) ? '🔥 Peak' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>⇄ Swap Departure & Destination</span>
              </button>

              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSearching ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Buses & Forecast Crowding</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* View Switch: Results or Map */}
        {activeTab === 'map' ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-sky-400" />
                  <span>Interactive Mysuru Transit Map</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time telemetry simulation along urban transit corridors.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('results')}
                className="text-xs font-semibold text-sky-400 hover:underline"
              >
                Back to Bus List
              </button>
            </div>
            <RouteMap selectedSource={source} selectedDestination={destination} />
          </section>
        ) : (
          <div className="space-y-8">
            {/* AI Recommendation Highlight Card */}
            {recommendedBus && (
              <section className="glass-panel p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-brand-darkest to-brand-card shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl bg-emerald-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SMART RECOMMENDED FOR YOUR JOURNEY</span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-white">{recommendedBus.bus_number}</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">
                        {recommendedBus.route_number}
                      </span>
                      <OccupancyBadge
                        percentage={recommendedBus.occupancy_percentage}
                        category={recommendedBus.occupancy_category}
                        size="md"
                      />
                    </div>

                    <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <span>{recommendedBus.source}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-sky-400">{recommendedBus.destination}</span>
                    </div>

                    <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>
                        AI Predicted: <strong>{recommendedBus.occupancy_percentage}% occupancy</strong> (
                        {recommendedBus.predicted_passenger_count} passengers out of {recommendedBus.bus_capacity} capacity).
                        Lowest crowding choice on this route!
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:w-80">
                    <div className="flex-1 w-full">
                      <OccupancyProgressBar
                        percentage={recommendedBus.occupancy_percentage}
                        passengerCount={recommendedBus.predicted_passenger_count}
                        capacity={recommendedBus.bus_capacity}
                        showText={true}
                      />
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>ETA: ~{recommendedBus.estimated_arrival_mins} mins</span>
                        <span>Type: {recommendedBus.bus_type}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBusForModal(recommendedBus)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Bus Search Results Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BusIcon className="w-5 h-5 text-sky-400" />
                  <span>Available Buses Serving Your Route ({searchResults.length})</span>
                </h2>
                <span className="text-xs text-slate-400">
                  Sorted by lowest predicted crowding
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
                  <BusIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-300">No buses found for this search</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try choosing a major transit hub such as Mysuru City Bus Stand or Suburban Bus Stand.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {searchResults.map((bus) => (
                    <div
                      key={`bus-card-${bus.bus_id}`}
                      className={`glass-panel p-5 rounded-2xl border transition-all hover:border-sky-500/40 relative flex flex-col justify-between ${
                        bus.is_recommended
                          ? 'border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                          : 'border-brand-border/60'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-base text-white">{bus.bus_number}</span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-950 text-sky-300 border border-blue-800/40">
                                {bus.route_number}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{bus.bus_type}</div>
                          </div>

                          <button
                            onClick={() => toggleFavorite(bus.route_id)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              favorites.includes(bus.route_id)
                                ? 'bg-rose-950/50 text-rose-400 border-rose-800/50'
                                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                            title="Save route to favorites"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        {/* Route Name */}
                        <div className="text-xs text-slate-300 font-medium mb-3 line-clamp-1">
                          {bus.route_name}
                        </div>

                        {/* Occupancy Badge & Prediction */}
                        <div className="mb-3">
                          <OccupancyBadge
                            percentage={bus.occupancy_percentage}
                            category={bus.occupancy_category}
                            size="md"
                          />
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <OccupancyProgressBar
                            percentage={bus.occupancy_percentage}
                            passengerCount={bus.predicted_passenger_count}
                            capacity={bus.bus_capacity}
                            showText={true}
                          />
                        </div>
                      </div>

                      {/* Footer Info & Action */}
                      <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs">
                        <div className="text-slate-400">
                          ETA: <strong className="text-slate-200">{bus.estimated_arrival_mins} mins</strong>
                        </div>

                        <button
                          onClick={() => setSelectedBusForModal(bus)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-950 text-sky-300 hover:bg-sky-900 border border-sky-800/40 transition-colors"
                        >
                          Details & Map
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Embedded Interactive Map if on results tab */}
        {activeTab === 'results' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Transit Route Corridor & Live Stops</span>
              </h3>
              <span className="text-xs text-slate-400">Interactive OpenStreetMap</span>
            </div>
            <RouteMap selectedSource={source} selectedDestination={destination} />
          </section>
        )}
      </main>

      {/* Bus Details Modal */}
      {selectedBusForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-sky-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  {selectedBusForModal.bus_number} Details
                </h3>
                <span className="text-xs text-sky-400 font-semibold">
                  {selectedBusForModal.route_name}
                </span>
              </div>
              <button
                onClick={() => setSelectedBusForModal(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500">Predicted Load</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {selectedBusForModal.predicted_passenger_count} Passengers
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500">Bus Seating Capacity</div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {selectedBusForModal.bus_capacity} Seats
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500">Fleet Type</div>
                  <div className="text-base font-bold text-sky-300 mt-0.5">
                    {selectedBusForModal.bus_type}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-500">Estimated Arrival</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {selectedBusForModal.estimated_arrival_mins} mins
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1">Occupancy Forecast</div>
                <OccupancyProgressBar
                  percentage={selectedBusForModal.occupancy_percentage}
                  passengerCount={selectedBusForModal.predicted_passenger_count}
                  capacity={selectedBusForModal.bus_capacity}
                  showText={true}
                  height="h-3"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>AI Smart Travel Advice</span>
                </div>
                {selectedBusForModal.occupancy_percentage <= 40 ? (
                  <p>
                    Excellent choice! High seat availability predicted. Minimal wait and comfortable boarding.
                  </p>
                ) : selectedBusForModal.occupancy_percentage <= 70 ? (
                  <p>
                    Moderate crowding anticipated. Few seats available with comfortable standing room.
                  </p>
                ) : (
                  <p>
                    Heavy crowding forecasted during this departure window. We recommend checking the
                    alternative buses scheduled 10-15 minutes earlier or later.
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedBusForModal(null)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
