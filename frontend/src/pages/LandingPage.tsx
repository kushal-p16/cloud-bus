import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bus,
  ShieldCheck,
  User,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  Cpu,
  BarChart3,
  Globe2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Navigation,
  Lock,
  Mail,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';

export const LandingPage: React.FC = () => {
  const { login, register, quickDemoLogin, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Passenger Auth State
  const [passengerEmail, setPassengerEmail] = useState('');
  const [passengerPassword, setPassengerPassword] = useState('');
  const [passengerError, setPassengerError] = useState('');
  const [passengerLoading, setPassengerLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Authority Auth State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Handle Passenger Login
  const handlePassengerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassengerError('');
    setPassengerLoading(true);
    try {
      await login(passengerEmail, passengerPassword);
      navigate('/passenger');
    } catch (err: any) {
      setPassengerError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setPassengerLoading(false);
    }
  };

  // Handle Quick Passenger Demo Fill
  const handlePassengerDemoFill = () => {
    setPassengerEmail('passenger@smartbus.demo');
    setPassengerPassword('Passenger@123');
    setPassengerError('');
  };

  // Handle Authority Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);
    try {
      await login(adminEmail, adminPassword);
      navigate('/admin');
    } catch (err: any) {
      setAdminError(err.message || 'Authentication failed. Official credentials required.');
    } finally {
      setAdminLoading(false);
    }
  };

  // Handle Quick Authority Demo Fill
  const handleAdminDemoFill = () => {
    setAdminEmail('admin@smartbus.demo');
    setAdminPassword('Admin@123');
    setAdminError('');
  };

  // Handle Passenger Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegLoading(true);
    try {
      await register({
        full_name: regFullName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: 'passenger',
      });
      setShowRegisterModal(false);
      navigate('/passenger');
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-darkest text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-sky-500/15 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-20 right-10 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Project Author Watermark Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-950/90 via-slate-900 to-sky-950/90 border border-sky-400/50 text-xs font-bold text-sky-200 mb-4 shadow-lg shadow-sky-950/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Project by Kushal P</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-medium">Cloud Computing</span>
            </div>

            {/* SDG 11 Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-xs font-semibold text-sky-400 mb-6 shadow-sm">
              <Globe2 className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>United Nations SDG 11: Sustainable Cities & Communities</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>Target 11.2</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Smarter Journeys. <br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                Less Crowding.
              </span>{' '}
              Sustainable Cities.
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              SmartBus AI leverages machine learning to forecast public transit crowding before you
              travel. Empowering passengers with less crowded travel options while providing transport
              authorities with real-time fleet analytics for Mysuru city.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#auth-section"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-500/25 flex items-center gap-2 transform hover:-translate-y-0.5 transition-all"
              >
                <span>Launch Portals</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#features-section"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all flex items-center gap-2"
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
              <div className="glass-panel p-4 rounded-xl border border-slate-700/50">
                <div className="text-2xl font-black text-sky-400">96.5%</div>
                <div className="text-xs text-slate-400 mt-0.5">Model Accuracy (R² 0.965)</div>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-slate-700/50">
                <div className="text-2xl font-black text-emerald-400">2.10</div>
                <div className="text-xs text-slate-400 mt-0.5">Low MAE Error (Pass.)</div>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-slate-700/50">
                <div className="text-2xl font-black text-amber-400">10 Routes</div>
                <div className="text-xs text-slate-400 mt-0.5">Mysuru Urban Network</div>
              </div>
              <div className="glass-panel p-4 rounded-xl border border-slate-700/50">
                <div className="text-2xl font-black text-indigo-400">Zero Emiss.</div>
                <div className="text-xs text-slate-400 mt-0.5">Simulated Optimization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* MOST IMPORTANT SECTION: TWO DISTINCT SIDE-BY-SIDE LOGIN PANELS */}
      {/* ============================================================== */}
      <section id="auth-section" className="py-16 md:py-24 bg-brand-navy/60 relative border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white">Dual Access Portal</h2>
            <p className="text-sm text-slate-400 mt-2">
              Select your user category below to log in directly to your personalized workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 items-stretch max-w-5xl mx-auto">
            {/* PANEL 1: PASSENGER LOGIN */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-8 border border-sky-500/30 shadow-xl shadow-sky-950/20 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Passenger Portal</h3>
                    <p className="text-xs text-slate-400">Find buses and travel smarter.</p>
                  </div>
                </div>

                {passengerError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{passengerError}</span>
                  </div>
                )}

                <form onSubmit={handlePassengerLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Passenger Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={passengerEmail}
                        onChange={(e) => setPassengerEmail(e.target.value)}
                        placeholder="passenger@smartbus.demo"
                        required
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Demo account password: Passenger@123')}
                        className="text-[11px] text-sky-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={passengerPassword}
                        onChange={(e) => setPassengerPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passengerLoading}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {passengerLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Login as Passenger</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Demo Fill & Register Options */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <button
                  type="button"
                  onClick={handlePassengerDemoFill}
                  className="w-full py-2 px-3 text-xs font-semibold text-sky-300 bg-sky-950/40 hover:bg-sky-900/40 border border-sky-800/40 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Auto-Fill Passenger Demo Account</span>
                </button>

                <div className="text-center text-xs text-slate-400">
                  New to SmartBus?{' '}
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(true)}
                    className="text-sky-400 font-semibold hover:underline"
                  >
                    Register as Passenger
                  </button>
                </div>
              </div>
            </div>

            {/* ================= OR ================ DIVIDER */}
            <div className="lg:col-span-1 flex lg:flex-col items-center justify-center my-2 lg:my-0">
              <div className="hidden lg:block w-px h-full bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
              <div className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-bold text-slate-400 shadow-md">
                OR
              </div>
              <div className="hidden lg:block w-px h-full bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
            </div>

            {/* PANEL 2: TRANSPORT AUTHORITY LOGIN */}
            <div className="lg:col-span-5 glass-panel rounded-2xl p-6 sm:p-8 border border-amber-500/30 shadow-xl shadow-amber-950/20 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Transport Authority Portal</h3>
                    <p className="text-xs text-slate-400">Manage public transport & monitor fleet.</p>
                  </div>
                </div>

                {adminError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Official Authority Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@smartbus.demo"
                        required
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Admin Secret Key / Password
                      </label>
                      <span className="text-[11px] text-amber-400/80 font-mono">
                        Secured RBAC
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {adminLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Enter Authority Control Room</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Demo Fill & Security Note */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
                <button
                  type="button"
                  onClick={handleAdminDemoFill}
                  className="w-full py-2 px-3 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/40 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Fill Authority Demo Account</span>
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Protected operations area. Strictly reserved for fleet controllers & transit planners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features-section" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-400">
            Intelligent Transit Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            Why SmartBus AI Outperforms Conventional Transit
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 hover:border-sky-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-sky-400 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Random Forest Occupancy Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trained on multi-dimensional temporal transit features (lagged stop boardings, peak-hour
              indices, weather, and day variations) achieving 96.5% R² score and 2.1 passenger MAE.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 hover:border-sky-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Route Recommendations</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dynamically alerts passengers to less crowded buses traveling towards their identical
              destination, preventing crush load on lead buses and flattening peak congestion.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 hover:border-sky-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Operations Control Dashboard</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time fleet health, automated capacity threshold warnings, telemetry drift
              simulation, and instant CSV/PDF export for transit authorities.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Diagram Section */}
      <section className="py-16 bg-brand-navy/30 border-y border-brand-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-sky-400">
              End-to-End Pipeline
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">How Predictions Are Computed</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-5 glass-panel rounded-xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-full bg-blue-600/30 text-sky-400 font-bold mx-auto mb-3 flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-white text-sm">Telemetry Ingestion</h4>
              <p className="text-xs text-slate-400 mt-1">
                Vehicle GPS coordinates, stop arrivals, and boarding counts captured in real time.
              </p>
            </div>

            <div className="p-5 glass-panel rounded-xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-full bg-blue-600/30 text-sky-400 font-bold mx-auto mb-3 flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-white text-sm">Feature Engineering</h4>
              <p className="text-xs text-slate-400 mt-1">
                Lags, route demand coefficients, and morning/evening peak markers extracted.
              </p>
            </div>

            <div className="p-5 glass-panel rounded-xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-full bg-blue-600/30 text-sky-400 font-bold mx-auto mb-3 flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-white text-sm">ML Inference</h4>
              <p className="text-xs text-slate-400 mt-1">
                Random Forest model infers passenger count with bounded non-negativity constraint.
              </p>
            </div>

            <div className="p-5 glass-panel rounded-xl border border-slate-700/60">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 text-emerald-400 font-bold mx-auto mb-3 flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-white text-sm">Commuter Decision</h4>
              <p className="text-xs text-slate-400 mt-1">
                Passenger chooses less crowded bus alternative; authority redistributes fleet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About SDG 11 Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-brand-darkest to-brand-navy/60">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-500/30 mb-4">
              <Globe2 className="w-4 h-4" />
              <span>UN Sustainable Development Goal 11</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">
              Target 11.2: Sustainable & Accessible Transport For All
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
              "By 2030, provide access to safe, affordable, accessible and sustainable transport systems for
              all, improving road safety, notably by expanding public transport, with special attention to
              the needs of those in vulnerable situations, women, children, persons with disabilities and
              older persons."
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Flattens peak-hour congestion by up to 28%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Decreases per-capita urban transit carbon footprint</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Optimizes city fleet allocation and prevents empty deadheading</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Improves passenger safety, boarding ease, and transit equity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-brand-border/60 bg-brand-darkest py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-300">SmartBus AI</span> &copy; 2026. Academic Cloud
            Computing Project.
            <div className="text-xs font-bold text-sky-400 mt-0.5">
              Project by Kushal P
            </div>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              Designed for Mysuru City Transit Prototype (Simulated telemetry data).
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>FastAPI + PyTorch/Scikit-Learn</span>
            <span>&bull;</span>
            <span>React + Vite</span>
            <span>&bull;</span>
            <span>AWS Cloud Ready</span>
          </div>
        </div>
      </footer>

      {/* Registration Modal for Passengers */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-sky-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <User className="w-5 h-5 text-sky-400" />
                <span>Register as Passenger</span>
              </h3>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {regError && (
              <div className="mb-4 p-2.5 rounded bg-red-950/60 border border-red-500/40 text-xs text-red-300">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-2.5 rounded-lg font-bold text-sm bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-colors disabled:opacity-50 mt-2"
              >
                {regLoading ? 'Creating Account...' : 'Complete Passenger Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
