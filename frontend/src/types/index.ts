export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'passenger' | 'admin';
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: 'passenger' | 'admin';
  user_id: number;
  email: string;
  full_name: string;
}

export interface BusStop {
  id: number;
  stop_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
}

export interface RouteStop {
  id: number;
  stop_sequence: number;
  distance_from_source_km: number;
  estimated_time_mins: number;
  stop: BusStop;
}

export interface Route {
  id: number;
  route_number: string;
  route_name: string;
  source: string;
  destination: string;
  total_distance_km: number;
  estimated_duration_mins: number;
  base_demand: number;
  is_active: boolean;
  route_stops?: RouteStop[];
}

export interface Bus {
  id: number;
  bus_number: string;
  registration_number: string;
  capacity: number;
  bus_type: string;
  status: 'active' | 'inactive' | 'maintenance';
  current_route_id: number | null;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  updated_at: string;
  route?: Route;
}

export interface LiveBusLocation {
  bus_id: number;
  bus_number: string;
  registration_number: string;
  capacity: number;
  bus_type: string;
  status: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  route_id: number;
  route_name: string;
  route_number: string;
  current_passengers: number;
  occupancy_percentage: number;
  occupancy_category: 'LOW' | 'MODERATE' | 'HIGH' | 'NEAR_FULL' | 'OVERCROWDED';
  is_simulated: boolean;
  updated_at: string;
}

export interface BusSearchResult {
  bus_id: number;
  bus_number: string;
  registration_number: string;
  route_id: number;
  route_number: string;
  route_name: string;
  source: string;
  destination: string;
  bus_capacity: number;
  bus_type: string;
  estimated_arrival_mins: number;
  predicted_passenger_count: number;
  occupancy_percentage: number;
  occupancy_category: 'LOW' | 'MODERATE' | 'HIGH' | 'NEAR_FULL' | 'OVERCROWDED';
  badge_color: 'green' | 'blue' | 'orange' | 'red' | 'dark_red';
  crowd_level_text: string;
  is_recommended: boolean;
  last_updated: string;
}

export interface ModelMetrics {
  model_name: string;
  algorithm: string;
  trained_at: string;
  train_samples: number;
  test_samples: number;
  mae: number;
  rmse: number;
  r2_score: number;
  feature_importances: Array<{ feature: string; importance: number }>;
  features: string[];
}

export interface DashboardKPIs {
  total_buses: number;
  active_buses: number;
  total_routes: number;
  total_passengers_today: number;
  average_occupancy_percentage: number;
  overcrowded_buses_count: number;
  underutilized_buses_count: number;
}

export interface HourlyDemand {
  hour: string;
  passengers: number;
  occupancy: number;
  isPeak: boolean;
}

export interface RouteCrowding {
  route_id: number;
  route_number: string;
  route_name: string;
  source: string;
  destination: string;
  average_occupancy: number;
  total_passengers: number;
  status: string;
  demand_index: number;
}
