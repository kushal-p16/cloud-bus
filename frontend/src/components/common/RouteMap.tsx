import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, MapPin, Gauge, Users, Activity, Sparkles } from 'lucide-react';
import { LiveBusLocation, BusStop } from '../../types';
import { stopApi, busApi } from '../../services/api';

// Create custom SVG DivIcons for Leaflet
const createBusIcon = (occupancyPct: number, busNum: string) => {
  let color = '#10B981'; // Green
  if (occupancyPct > 100) color = '#991B1B';
  else if (occupancyPct > 90) color = '#EF4444';
  else if (occupancyPct > 70) color = '#F59E0B';
  else if (occupancyPct > 40) color = '#0284C7';

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transform: translate(-50%, -50%);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.6 19.1 6 18 6H4C2.9 6 1.9 6.6 1.6 7.8L.2 12.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path><circle cx="7" cy="18" r="2"></circle><circle cx="15" cy="18" r="2"></circle>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
};

const createStopIcon = (isHighlight: boolean = false) => {
  const bg = isHighlight ? '#2563EB' : '#475569';
  const size = isHighlight ? 26 : 18;
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="background-color: ${bg}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.4); transform: translate(-50%, -50%);">
        <div style="background: white; width: 6px; height: 6px; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

interface RouteMapProps {
  selectedSource?: string;
  selectedDestination?: string;
  highlightRouteCoordinates?: [number, number][];
  onStopSelect?: (stopName: string) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  selectedSource,
  selectedDestination,
  highlightRouteCoordinates,
  onStopSelect,
}) => {
  const [buses, setBuses] = useState<LiveBusLocation[]>([]);
  const [stops, setStops] = useState<BusStop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mysuru City Center default view
  const defaultCenter: [number, number] = [12.3100, 76.6450];

  const fetchLiveFleet = async () => {
    try {
      const busLocations = await busApi.getLiveLocations();
      setBuses(busLocations);
    } catch (e) {
      console.error('Failed to fetch live locations:', e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [stopsData, busLocations] = await Promise.all([
          stopApi.getAll(),
          busApi.getLiveLocations(),
        ]);
        setStops(stopsData);
        setBuses(busLocations);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();

    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchLiveFleet, 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute polyline coordinates connecting stops if not explicitly supplied
  const polylinePositions: [number, number][] =
    highlightRouteCoordinates && highlightRouteCoordinates.length > 0
      ? highlightRouteCoordinates
      : stops.map((s) => [s.latitude, s.longitude]);

  return (
    <div className="relative w-full h-[450px] sm:h-[500px] rounded-2xl overflow-hidden border border-brand-border/70 shadow-2xl">
      {/* Map Legend Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-brand-darkest/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-xs shadow-xl max-w-[260px]">
        <div className="flex items-center gap-1.5 font-bold text-sky-400 mb-2">
          <Activity className="w-3.5 h-3.5" />
          <span>Mysuru Smart Transit Grid</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Low (&lt;40%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>High (71-90%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Near Full / Full</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700/60 text-[10px] text-amber-300/90 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Simulated GPS bus telemetry</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Transit Corridors Polylines */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            color="#2563EB"
            weight={3}
            opacity={0.65}
            dashArray="6, 8"
          />
        )}

        {/* Bus Stops */}
        {stops.map((stop) => {
          const isSelected =
            selectedSource?.toLowerCase() === stop.stop_name.toLowerCase() ||
            selectedDestination?.toLowerCase() === stop.stop_name.toLowerCase();

          return (
            <Marker
              key={`stop-${stop.id}`}
              position={[stop.latitude, stop.longitude]}
              icon={createStopIcon(isSelected)}
              eventHandlers={{
                click: () => onStopSelect && onStopSelect(stop.stop_name),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 text-slate-900">
                  <div className="font-bold text-xs text-blue-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    {stop.stop_name}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{stop.location_name}</div>
                  {onStopSelect && (
                    <button
                      onClick={() => onStopSelect(stop.stop_name)}
                      className="mt-2 text-[10px] font-semibold text-blue-600 hover:underline"
                    >
                      Set as Departure/Destination
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Live / Simulated Buses */}
        {buses.map((bus) => (
          <Marker
            key={`bus-${bus.bus_id}`}
            position={[bus.latitude, bus.longitude]}
            icon={createBusIcon(bus.occupancy_percentage, bus.bus_number)}
          >
            <Popup className="custom-popup">
              <div className="p-2 text-slate-900 min-w-[190px]">
                <div className="flex items-center justify-between border-b pb-1 mb-1.5">
                  <span className="font-bold text-xs text-slate-900">{bus.bus_number}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    {bus.route_number}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mb-1">
                  {bus.route_name}
                </div>
                <div className="space-y-1 text-[11px] text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="w-3 h-3" /> Occupancy:
                    </span>
                    <span className="font-bold text-slate-900">
                      {bus.occupancy_percentage}% ({bus.occupancy_category})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Gauge className="w-3 h-3" /> Speed:
                    </span>
                    <span>{bus.speed_kmh} km/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Capacity:</span>
                    <span>{bus.current_passengers} / {bus.capacity}</span>
                  </div>
                </div>
                <div className="mt-2 pt-1 border-t text-[10px] text-amber-700 italic">
                  * Position simulated for Mysuru transit demo
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
