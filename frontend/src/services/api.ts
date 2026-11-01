import {
  AuthResponse,
  Bus,
  BusSearchResult,
  Route,
  BusStop,
  LiveBusLocation,
  ModelMetrics,
  DashboardKPIs,
  HourlyDemand,
  RouteCrowding,
} from '../types';

const API_BASE = 'http://localhost:8000/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('smartbus_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      errorDetail = `Error ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  // Handle empty responses (like 204 No Content)
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: { email: string; password: string; full_name: string; phone?: string; role?: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request<any>('/auth/me'),
};

export const busApi = {
  getAll: (params?: { route_id?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.route_id) q.set('route_id', params.route_id.toString());
    if (params?.status) q.set('status', params.status);
    return request<Bus[]>(`/buses?${q.toString()}`);
  },

  getLiveLocations: () => request<LiveBusLocation[]>('/buses/live-locations'),

  create: (busData: Partial<Bus>) =>
    request<Bus>('/buses', {
      method: 'POST',
      body: JSON.stringify(busData),
    }),

  update: (id: number, busData: Partial<Bus>) =>
    request<Bus>(`/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(busData),
    }),

  delete: (id: number) =>
    request<void>(`/buses/${id}`, {
      method: 'DELETE',
    }),
};

export const routeApi = {
  getAll: () => request<Route[]>('/routes'),
  getById: (id: number) => request<Route>(`/routes/${id}`),
  create: (routeData: Partial<Route>) =>
    request<Route>('/routes', {
      method: 'POST',
      body: JSON.stringify(routeData),
    }),
  update: (id: number, routeData: Partial<Route>) =>
    request<Route>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(routeData),
    }),
  delete: (id: number) =>
    request<void>(`/routes/${id}`, {
      method: 'DELETE',
    }),
};

export const stopApi = {
  getAll: () => request<BusStop[]>('/stops'),
};

export const occupancyApi = {
  getCurrent: (params?: { route_id?: number; occupancy_level?: string }) => {
    const q = new URLSearchParams();
    if (params?.route_id) q.set('route_id', params.route_id.toString());
    if (params?.occupancy_level) q.set('occupancy_level', params.occupancy_level);
    return request<any[]>(`/occupancy/current?${q.toString()}`);
  },

  triggerTelemetryTick: () =>
    request<{ status: string; buses_updated: number; timestamp: string }>('/occupancy/telemetry-tick', {
      method: 'POST',
    }),
};

export const predictionApi = {
  searchBuses: (searchQuery: { source: string; destination: string; travel_date?: string; travel_hour?: number }) =>
    request<BusSearchResult[]>('/predictions/search', {
      method: 'POST',
      body: JSON.stringify(searchQuery),
    }),

  getModelMetrics: () => request<ModelMetrics>('/predictions/model-metrics'),

  getAnalytics: () => request<{ actual_vs_predicted: any[]; total_evaluated_samples: number }>('/predictions/analytics'),

  triggerRetrain: () =>
    request<{ status: string; message: string; metrics: ModelMetrics }>('/predictions/train', {
      method: 'POST',
    }),
};

export const analyticsApi = {
  getKPIs: () => request<DashboardKPIs>('/analytics/kpis'),
  getHourlyDemand: () => request<HourlyDemand[]>('/analytics/hourly-demand'),
  getRouteCrowding: () => request<RouteCrowding[]>('/analytics/route-crowding'),
  getWeeklyPattern: () => request<any[]>('/analytics/weekly-pattern'),
};

export const reportApi = {
  getSummary: () => request<any>('/reports/summary'),
  getDownloadUrl: (reportType: string) => `${API_BASE}/reports/download/${reportType}`,
};

export const userApi = {
  getSearches: () => request<any[]>('/users/searches'),
  getFavorites: () => request<Route[]>('/users/favorites'),
  addFavorite: (routeId: number) =>
    request<{ status: string; route_id: number }>(`/users/favorites/${routeId}`, {
      method: 'POST',
    }),
  removeFavorite: (routeId: number) =>
    request<{ status: string; route_id: number }>(`/users/favorites/${routeId}`, {
      method: 'DELETE',
    }),
};
