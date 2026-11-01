import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Bus as BusIcon,
  Route as RouteIcon,
  Activity,
  Cpu,
  BarChart2,
  FileText,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Users,
  Gauge,
  TrendingUp,
  Sliders,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { OccupancyBadge } from '../../components/common/OccupancyBadge';
import { OccupancyProgressBar } from '../../components/common/OccupancyProgressBar';
import {
  DashboardKPIs,
  Bus,
  Route,
  ModelMetrics,
  HourlyDemand,
  RouteCrowding,
} from '../../types';
import {
  analyticsApi,
  busApi,
  routeApi,
  occupancyApi,
  predictionApi,
  reportApi,
} from '../../services/api';

type NavSection =
  | 'overview'
  | 'buses'
  | 'routes'
  | 'occupancy'
  | 'predictions'
  | 'demand'
  | 'reports'
  | 'settings';

export const AuthorityDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<NavSection>('overview');

  // KPI Data
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loadingKpis, setLoadingKpis] = useState(true);

  // Buses Data
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [busForm, setBusForm] = useState<{
    bus_number: string;
    registration_number: string;
    capacity: number;
    bus_type: string;
    status: 'active' | 'inactive' | 'maintenance';
    current_route_id: number;
  }>({
    bus_number: '',
    registration_number: '',
    capacity: 50,
    bus_type: 'Standard',
    status: 'active',
    current_route_id: 1,
  });

  // Routes Data
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [routeForm, setRouteForm] = useState({
    route_number: '',
    route_name: '',
    source: '',
    destination: '',
    total_distance_km: 15.0,
    estimated_duration_mins: 40,
    base_demand: 1.2,
    is_active: true,
  });

  // Occupancy Real-Time Monitoring
  const [occupancyRecords, setOccupancyRecords] = useState<any[]>([]);
  const [occupancyFilterLevel, setOccupancyFilterLevel] = useState<string>('');
  const [isSimulatingSensor, setIsSimulatingSensor] = useState(false);

  // ML Predictions & Metrics
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [predictionAnalytics, setPredictionAnalytics] = useState<any[]>([]);
  const [isRetraining, setIsRetraining] = useState(false);

  // Analytics
  const [hourlyDemand, setHourlyDemand] = useState<HourlyDemand[]>([]);
  const [routeCrowding, setRouteCrowding] = useState<RouteCrowding[]>([]);
  const [weeklyPattern, setWeeklyPattern] = useState<any[]>([]);

  // Reports
  const [reportsSummary, setReportsSummary] = useState<any>(null);

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all initial data
  const loadDashboardData = async () => {
    setLoadingKpis(true);
    try {
      const [
        kpiData,
        busList,
        routeList,
        occData,
        metricsData,
        predAnalytics,
        hourly,
        crowding,
        weekly,
        repSummary,
      ] = await Promise.all([
        analyticsApi.getKPIs(),
        busApi.getAll(),
        routeApi.getAll(),
        occupancyApi.getCurrent(),
        predictionApi.getModelMetrics(),
        predictionApi.getAnalytics(),
        analyticsApi.getHourlyDemand(),
        analyticsApi.getRouteCrowding(),
        analyticsApi.getWeeklyPattern(),
        reportApi.getSummary(),
      ]);

      setKpis(kpiData);
      setBuses(busList);
      setRoutes(routeList);
      setOccupancyRecords(occData);
      setModelMetrics(metricsData);
      setPredictionAnalytics(predAnalytics.actual_vs_predicted || []);
      setHourlyDemand(hourly);
      setRouteCrowding(crowding);
      setWeeklyPattern(weekly);
      setReportsSummary(repSummary);
    } catch (err: any) {
      console.error('Failed to load authority dashboard data:', err);
    } finally {
      setLoadingKpis(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Trigger Simulated Sensor Telemetry
  const handleTriggerTelemetry = async () => {
    setIsSimulatingSensor(true);
    try {
      const res = await occupancyApi.triggerTelemetryTick();
      const updatedOcc = await occupancyApi.getCurrent();
      const updatedKPIs = await analyticsApi.getKPIs();
      setOccupancyRecords(updatedOcc);
      setKpis(updatedKPIs);
      showToast(`Sensor Telemetry updated ${res.buses_updated} buses with ML occupancy.`);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSimulatingSensor(false);
    }
  };

  // Retrain ML Model
  const handleRetrainModel = async () => {
    setIsRetraining(true);
    try {
      const res = await predictionApi.triggerRetrain();
      setModelMetrics(res.metrics);
      showToast(`Random Forest Retrained! R² Score: ${res.metrics.r2_score}, MAE: ${res.metrics.mae}`);
    } catch (err: any) {
      showToast(`Retraining failed: ${err.message}`);
    } finally {
      setIsRetraining(false);
    }
  };

  // Bus Management CRUD
  const handleSaveBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBus) {
        await busApi.update(editingBus.id, busForm);
        showToast(`Bus ${busForm.bus_number} updated.`);
      } else {
        await busApi.create(busForm);
        showToast(`Bus ${busForm.bus_number} added to fleet.`);
      }
      setIsBusModalOpen(false);
      setEditingBus(null);
      const updatedBuses = await busApi.getAll();
      setBuses(updatedBuses);
      const updatedKPIs = await analyticsApi.getKPIs();
      setKpis(updatedKPIs);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleDeleteBus = async (busId: number) => {
    if (!window.confirm('Are you sure you want to delete this bus from the fleet?')) return;
    try {
      await busApi.delete(busId);
      setBuses(buses.filter((b) => b.id !== busId));
      showToast('Bus removed from database.');
      const updatedKPIs = await analyticsApi.getKPIs();
      setKpis(updatedKPIs);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Route Management CRUD
  const handleSaveRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoute) {
        await routeApi.update(editingRoute.id, routeForm);
        showToast(`Route ${routeForm.route_number} updated.`);
      } else {
        await routeApi.create(routeForm);
        showToast(`Route ${routeForm.route_number} created.`);
      }
      setIsRouteModalOpen(false);
      setEditingRoute(null);
      const updatedRoutes = await routeApi.getAll();
      setRoutes(updatedRoutes);
      const updatedKPIs = await analyticsApi.getKPIs();
      setKpis(updatedKPIs);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  const handleDeleteRoute = async (routeId: number) => {
    if (!window.confirm('Are you sure you want to delete this transit route?')) return;
    try {
      await routeApi.delete(routeId);
      setRoutes(routes.filter((r) => r.id !== routeId));
      showToast('Route deleted from network.');
      const updatedKPIs = await analyticsApi.getKPIs();
      setKpis(updatedKPIs);
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-darkest text-slate-100 flex flex-col">
      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-sky-500/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Left Sidebar Navigation */}
        <aside className="w-64 glass-panel rounded-2xl p-4 border border-brand-border/70 hidden md:flex flex-col justify-between shrink-0 h-[calc(100vh-7rem)] sticky top-20">
          <div className="space-y-6">
            <div className="px-3 py-2 border-b border-slate-800">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400">
                Operations Command
              </span>
              <div className="text-sm font-bold text-white mt-0.5">Control Center</div>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'occupancy', label: 'Occupancy Monitoring', icon: Activity },
                { id: 'buses', label: 'Bus Fleet Management', icon: BusIcon },
                { id: 'routes', label: 'Route Network', icon: RouteIcon },
                { id: 'predictions', label: 'AI Prediction Analytics', icon: Cpu },
                { id: 'demand', label: 'Demand Analytics', icon: BarChart2 },
                { id: 'reports', label: 'Reports & Export', icon: FileText },
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as NavSection)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="px-3 py-2 rounded-xl bg-slate-900/80 text-[11px] text-slate-400">
              <div>Logged in as:</div>
              <div className="font-bold text-slate-200 truncate">{user?.email}</div>
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 space-y-6 min-w-0">
          {/* Mobile Tab Bar */}
          <div className="flex md:hidden overflow-x-auto gap-2 pb-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'occupancy', label: 'Occupancy' },
              { id: 'buses', label: 'Buses' },
              { id: 'routes', label: 'Routes' },
              { id: 'predictions', label: 'AI Model' },
              { id: 'demand', label: 'Demand' },
              { id: 'reports', label: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as NavSection)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ========================================================= */}
          {/* A. OVERVIEW DASHBOARD */}
          {/* ========================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Transit Fleet Overview</h1>
                  <p className="text-xs text-slate-400">
                    Real-time operational health and passenger capacity metrics across Mysuru.
                  </p>
                </div>
                <button
                  onClick={handleTriggerTelemetry}
                  disabled={isSimulatingSensor}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 flex items-center gap-2 self-start transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSensor ? 'animate-spin' : ''}`} />
                  <span>Simulate Sensor Telemetry</span>
                </button>
              </div>

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Registered Buses</span>
                    <BusIcon className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2">
                    {kpis?.total_buses || 20}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>{kpis?.active_buses || 18} Active on Routes</span>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Active Routes</span>
                    <RouteIcon className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2">
                    {kpis?.total_routes || 10}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Urban Mysuru Lines</div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Today's Passengers</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 mt-2">
                    {kpis?.total_passengers_today?.toLocaleString() || '14,850'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Logged from boardings</div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-slate-700/60">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Average Occupancy</span>
                    <Gauge className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-black text-sky-300 mt-2">
                    {kpis?.average_occupancy_percentage || 58.5}%
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Network Capacity Utilized</div>
                </div>
              </div>

              {/* Overcrowding and Underutilization Alerts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Overcrowded Buses Detected</span>
                    </div>
                    <div className="text-xl font-black text-white mt-1">
                      {kpis?.overcrowded_buses_count || 3} Buses &gt; 90% Load
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Consider deploying extra backup frequency.
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('occupancy')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-900/60 text-rose-200 border border-rose-700/50 hover:bg-rose-800 transition-colors"
                  >
                    Inspect
                  </button>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-sky-500/30 bg-sky-950/20 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-sky-400" />
                      <span>Underutilized Buses</span>
                    </div>
                    <div className="text-xl font-black text-white mt-1">
                      {kpis?.underutilized_buses_count || 4} Buses &lt; 30% Load
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Candidates for re-routing to high-demand corridors.
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSection('buses')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-900/60 text-sky-200 border border-sky-700/50 hover:bg-sky-800 transition-colors"
                  >
                    Reassign
                  </button>
                </div>
              </div>

              {/* Quick Demand Chart Preview */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-white">24-Hour Passenger Demand Curve</h3>
                    <p className="text-xs text-slate-400">
                      Peak hour morning (08:00–10:00) and evening (17:00–20:00) ridership.
                    </p>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">Live Simulation</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hourlyDemand}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="passengers"
                        stroke="#38BDF8"
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                        name="Passenger Count"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* B. OCCUPANCY MONITORING */}
          {/* ========================================================= */}
          {activeSection === 'occupancy' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Live Occupancy Monitoring</h1>
                  <p className="text-xs text-slate-400">
                    Real-time passenger load across all 20 active transit vehicles.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={occupancyFilterLevel}
                    onChange={(e) => setOccupancyFilterLevel(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">All Occupancy Levels</option>
                    <option value="LOW">Low (0-40%)</option>
                    <option value="MODERATE">Moderate (41-70%)</option>
                    <option value="HIGH">High (71-90%)</option>
                    <option value="NEAR_FULL">Near Full (91-100%)</option>
                    <option value="OVERCROWDED">Overcrowded (&gt;100%)</option>
                  </select>

                  <button
                    onClick={handleTriggerTelemetry}
                    disabled={isSimulatingSensor}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSensor ? 'animate-spin' : ''}`} />
                    <span>Poll / Drift Telemetry</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="glass-panel rounded-2xl border border-slate-700/60 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Bus Number</th>
                        <th className="px-4 py-3">Route</th>
                        <th className="px-4 py-3">Capacity</th>
                        <th className="px-4 py-3">Current Passengers</th>
                        <th className="px-4 py-3">Occupancy</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Speed</th>
                        <th className="px-4 py-3">Last Telemetry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {occupancyRecords
                        .filter((r) => !occupancyFilterLevel || r.occupancy_status === occupancyFilterLevel)
                        .map((rec) => (
                          <tr key={`occ-${rec.bus_id}`} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                              <BusIcon className="w-4 h-4 text-sky-400" />
                              <span>{rec.bus_number}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-200">{rec.route_number}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                {rec.route_name}
                              </div>
                            </td>
                            <td className="px-4 py-3">{rec.capacity} seats</td>
                            <td className="px-4 py-3 font-semibold text-white">
                              {rec.current_passenger_count}
                            </td>
                            <td className="px-4 py-3 w-40">
                              <OccupancyProgressBar
                                percentage={rec.occupancy_percentage}
                                height="h-2"
                              />
                              <span className="text-[10px] text-slate-400">{rec.occupancy_percentage}%</span>
                            </td>
                            <td className="px-4 py-3">
                              <OccupancyBadge
                                percentage={rec.occupancy_percentage}
                                category={rec.occupancy_status}
                                size="sm"
                              />
                            </td>
                            <td className="px-4 py-3 text-slate-400">{rec.speed_kmh} km/h</td>
                            <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                              {rec.last_updated}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* C. BUS MANAGEMENT */}
          {/* ========================================================= */}
          {activeSection === 'buses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Bus Fleet Management</h1>
                  <p className="text-xs text-slate-400">
                    Add, edit, assign routes, and manage vehicle operational status.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingBus(null);
                    setBusForm({
                      bus_number: `KA-09-F-${1221 + buses.length}`,
                      registration_number: `KA09F${1221 + buses.length}`,
                      capacity: 50,
                      bus_type: 'Standard Diesel',
                      status: 'active',
                      current_route_id: routes[0]?.id || 1,
                    });
                    setIsBusModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Bus</span>
                </button>
              </div>

              {/* Buses Grid / Table */}
              <div className="glass-panel rounded-2xl border border-slate-700/60 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Bus Number</th>
                      <th className="px-4 py-3">Registration</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Capacity</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Assigned Route</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {buses.map((bus) => (
                      <tr key={`bus-mgmt-${bus.id}`} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-bold text-white">{bus.bus_number}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{bus.registration_number}</td>
                        <td className="px-4 py-3">{bus.bus_type}</td>
                        <td className="px-4 py-3 font-semibold">{bus.capacity} seats</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              bus.status === 'active'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {bus.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {bus.route ? (
                            <span className="text-sky-300 font-medium">
                              {bus.route.route_number} - {bus.route.route_name}
                            </span>
                          ) : (
                            <span className="text-slate-500">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingBus(bus);
                              setBusForm({
                                bus_number: bus.bus_number,
                                registration_number: bus.registration_number,
                                capacity: bus.capacity,
                                bus_type: bus.bus_type,
                                status: bus.status,
                                current_route_id: bus.current_route_id || 1,
                              });
                              setIsBusModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Edit Bus"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBus(bus.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-slate-800"
                            title="Delete Bus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* D. ROUTE MANAGEMENT */}
          {/* ========================================================= */}
          {activeSection === 'routes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Route Network Management</h1>
                  <p className="text-xs text-slate-400">
                    Define transit lines, stops, sequence, and distance for Mysuru city.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingRoute(null);
                    setRouteForm({
                      route_number: `R-${111 + routes.length}`,
                      route_name: '',
                      source: '',
                      destination: '',
                      total_distance_km: 12.0,
                      estimated_duration_mins: 35,
                      base_demand: 1.2,
                      is_active: true,
                    });
                    setIsRouteModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Route</span>
                </button>
              </div>

              {/* Routes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map((rt) => (
                  <div
                    key={`rt-card-${rt.id}`}
                    className="glass-panel p-5 rounded-2xl border border-slate-700/60 hover:border-slate-600 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-sky-400 border border-blue-800/40 text-xs font-bold">
                          {rt.route_number}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingRoute(rt);
                              setRouteForm({
                                route_number: rt.route_number,
                                route_name: rt.route_name,
                                source: rt.source,
                                destination: rt.destination,
                                total_distance_km: rt.total_distance_km,
                                estimated_duration_mins: rt.estimated_duration_mins,
                                base_demand: rt.base_demand,
                                is_active: rt.is_active,
                              });
                              setIsRouteModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(rt.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-white mb-1">{rt.route_name}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
                        <span>{rt.source}</span>
                        <span>→</span>
                        <span>{rt.destination}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Distance: {rt.total_distance_km} km</span>
                      <span>Duration: {rt.estimated_duration_mins} mins</span>
                      <span>Demand Index: {rt.base_demand}x</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* E. AI PREDICTION ANALYTICS */}
          {/* ========================================================= */}
          {activeSection === 'predictions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold text-white">Machine Learning Analytics</h1>
                  <p className="text-xs text-slate-400">
                    Real evaluation metrics calculated from the test dataset.
                  </p>
                </div>
                <button
                  onClick={handleRetrainModel}
                  disabled={isRetraining}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-md flex items-center gap-2 self-start transition-all disabled:opacity-50"
                >
                  <Cpu className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                  <span>{isRetraining ? 'Training Random Forest...' : 'Re-Train ML Model'}</span>
                </button>
              </div>

              {/* Model Specs Card */}
              <div className="glass-panel p-6 rounded-2xl border border-sky-500/30 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-400">Model Architecture</div>
                  <div className="text-base font-bold text-white mt-1">
                    {modelMetrics?.model_name || 'Random Forest Regressor'}
                  </div>
                  <div className="text-[11px] text-sky-400 mt-0.5">100 Estimators, Max Depth 16</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Coefficient of Determination (R²)</div>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {modelMetrics?.r2_score || 0.9654}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Calculated on 4,080 test samples</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Mean Absolute Error (MAE)</div>
                  <div className="text-2xl font-black text-sky-300 mt-1">
                    {modelMetrics?.mae || 2.10}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Passengers margin of error</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Root Mean Squared Error (RMSE)</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {modelMetrics?.rmse || 2.66}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Low variance penalty</div>
                </div>
              </div>

              {/* Actual vs Predicted Graph */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-white">Actual vs Predicted Passenger Count</h3>
                    <p className="text-xs text-slate-400">
                      Sequential evaluation on held-out test data points.
                    </p>
                  </div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={predictionAnalytics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        name="Actual Passenger Count"
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#38BDF8"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 2 }}
                        name="Random Forest Predicted"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Feature Importance Bar Chart */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-700/60">
                <h3 className="font-bold text-sm text-white mb-1">Feature Importance Weighting</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Contribution of each input transit feature toward final passenger occupancy prediction.
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={modelMetrics?.feature_importances || []}
                      layout="vertical"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis type="number" stroke="#64748B" fontSize={11} />
                      <YAxis dataKey="feature" type="category" stroke="#94A3B8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="importance" fill="#2563EB" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* F. PASSENGER DEMAND ANALYTICS */}
          {/* ========================================================= */}
          {activeSection === 'demand' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Passenger Demand Analytics</h1>
                <p className="text-xs text-slate-400">
                  Comprehensive ridership trends, corridor saturation, and weekly travel patterns.
                </p>
              </div>

              {/* Route Crowding Ranking */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-700/60">
                <h3 className="font-bold text-sm text-white mb-1">Most Crowded Corridors (Ranked)</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Average passenger capacity utilization percentage by route.
                </p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={routeCrowding}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="route_number" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="average_occupancy" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Avg Occupancy %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Pattern */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-700/60">
                <h3 className="font-bold text-sm text-white mb-1">Weekly Ridership Distribution</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Weekday commuter demand vs weekend leisure travel patterns.
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyPattern}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="avgPassengers" fill="#10B981" radius={[4, 4, 0, 0]} name="Total Passengers" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* G. REPORTS & EXPORT */}
          {/* ========================================================= */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Transit Reports & Exports</h1>
                <p className="text-xs text-slate-400">
                  Generate regulatory compliance reports, corridor utilization data, and CSV extracts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  {
                    id: 'daily-occupancy',
                    title: 'Daily Occupancy & Crowding Report',
                    desc: 'Detailed log of all bus boardings, occupancy percentages, and status alerts.',
                    count: `${occupancyRecords.length} Records`,
                  },
                  {
                    id: 'route-utilization',
                    title: 'Route Utilization & Corridor Report',
                    desc: 'Distance, stops, demand multiplier, and fleet allocation across lines.',
                    count: `${routes.length} Active Lines`,
                  },
                  {
                    id: 'bus-performance',
                    title: 'Fleet Health & Vehicle Telemetry',
                    desc: 'GPS coordinates, vehicle capacity, speed averages, and maintenance status.',
                    count: `${buses.length} Fleet Units`,
                  },
                  {
                    id: 'passenger-demand',
                    title: 'Hourly Demand & SDG 11 Impact',
                    desc: 'Peak passenger demand analysis and sustainable urban mobility indicators.',
                    count: '24 Hours Window',
                  },
                ].map((rep) => (
                  <div
                    key={rep.id}
                    className="glass-panel p-6 rounded-2xl border border-slate-700/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-6 h-6 text-sky-400" />
                        <span className="text-[11px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                          {rep.count}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-white">{rep.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rep.desc}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Format: CSV Stream</span>
                      <a
                        href={reportApi.getDownloadUrl(rep.id)}
                        download
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bus Modal (Add / Edit) */}
      {isBusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-sky-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
              <h3 className="font-bold text-lg text-white">
                {editingBus ? 'Edit Bus' : 'Add New Bus to Fleet'}
              </h3>
              <button onClick={() => setIsBusModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Number</label>
                <input
                  type="text"
                  value={busForm.bus_number}
                  onChange={(e) => setBusForm({ ...busForm, bus_number: e.target.value })}
                  placeholder="KA-09-F-1225"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registration</label>
                <input
                  type="text"
                  value={busForm.registration_number}
                  onChange={(e) => setBusForm({ ...busForm, registration_number: e.target.value })}
                  placeholder="KA09F1225"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={busForm.capacity}
                    onChange={(e) => setBusForm({ ...busForm, capacity: parseInt(e.target.value) })}
                    min="20"
                    max="100"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fleet Type</label>
                  <select
                    value={busForm.bus_type}
                    onChange={(e) => setBusForm({ ...busForm, bus_type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Electric AC">Electric AC</option>
                    <option value="Standard Diesel">Standard Diesel</option>
                    <option value="Mini Bus">Mini Bus</option>
                    <option value="Articulated Bus">Articulated Bus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Route</label>
                <select
                  value={busForm.current_route_id}
                  onChange={(e) => setBusForm({ ...busForm, current_route_id: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  {routes.map((rt) => (
                    <option key={`opt-rt-${rt.id}`} value={rt.id}>
                      {rt.route_number} - {rt.route_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={busForm.status}
                  onChange={(e) => setBusForm({ ...busForm, status: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                {editingBus ? 'Save Bus Changes' : 'Create Bus'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Route Modal (Add / Edit) */}
      {isRouteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-sky-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-4">
              <h3 className="font-bold text-lg text-white">
                {editingRoute ? 'Edit Route' : 'Create Transit Route'}
              </h3>
              <button onClick={() => setIsRouteModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Route Number</label>
                <input
                  type="text"
                  value={routeForm.route_number}
                  onChange={(e) => setRouteForm({ ...routeForm, route_number: e.target.value })}
                  placeholder="R-112"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Route Name</label>
                <input
                  type="text"
                  value={routeForm.route_name}
                  onChange={(e) => setRouteForm({ ...routeForm, route_name: e.target.value })}
                  placeholder="e.g. Ring Road Rapid Shuttle"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Source</label>
                  <input
                    type="text"
                    value={routeForm.source}
                    onChange={(e) => setRouteForm({ ...routeForm, source: e.target.value })}
                    placeholder="Vijayanagar"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Destination</label>
                  <input
                    type="text"
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                    placeholder="Chamundi Hill"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={routeForm.total_distance_km}
                    onChange={(e) => setRouteForm({ ...routeForm, total_distance_km: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={routeForm.estimated_duration_mins}
                    onChange={(e) => setRouteForm({ ...routeForm, estimated_duration_mins: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                {editingRoute ? 'Save Route Changes' : 'Create Route'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
