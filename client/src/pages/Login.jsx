import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GlossyCapsule from '../components/GlossyCapsule';
import {
  Pill,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  Boxes,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Check,
} from 'lucide-react';

const demoAccounts = [
  {
    role: 'ADMIN',
    title: 'Admin Executive',
    email: 'admin@drugtrack.com',
    desc: 'Full supply chain control & audit logs',
    icon: ShieldCheck,
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    colorKey: 'emerald',
  },
  {
    role: 'SUPPLIER',
    title: 'Pharma Supplier',
    email: 'supplier@drugtrack.com',
    desc: 'Product catalog & dispatch orders',
    icon: Building2,
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    colorKey: 'cyan',
  },
  {
    role: 'WAREHOUSE_MANAGER',
    title: 'Warehouse Manager',
    email: 'warehouse@drugtrack.com',
    desc: 'Storage hubs & batch inventory',
    icon: Boxes,
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    colorKey: 'amber',
  },
  {
    role: 'PHARMACY_MANAGER',
    title: 'Pharmacy Director',
    email: 'pharmacy@drugtrack.com',
    desc: 'Hospital stock & order dispensaries',
    icon: Pill,
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    colorKey: 'purple',
  },
];

const Login = () => {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'credentials'
  const [email, setEmail] = useState('admin@drugtrack.com');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, getRoleDashboardRoute } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please provide an authorized account email');
      return;
    }
    if (!password) {
      setError('Please provide your account password');
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      const targetRoute =
        location.state?.from?.pathname || getRoleDashboardRoute(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(
        err.message ||
          'Authentication failed. Please check credentials or MongoDB connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (account) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword('password123');
    setError('');
  };

  const handleExecuteDemoLogin = async (account) => {
    setSelectedRole(account.role);
    setEmail(account.email);
    setPassword('password123');
    setError('');

    try {
      setLoading(true);
      const user = await login(account.email, 'password123');
      const targetRoute = getRoleDashboardRoute(user.role);
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a14] text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* Ambient background glow nebulas matching reference image */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Showcase Window Frame */}
      <div className="max-w-[1280px] w-full min-h-[740px] rounded-[36px] bg-[#090d18]/90 border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.9)] relative overflow-hidden backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10">
        
        {/* Floating 3D Glossy Gelatin Capsules matching the user's reference image */}
        {/* Giant Top-Center Translucent Purple Capsule */}
        <div className="absolute -top-14 left-[44%] sm:left-[48%] -translate-x-1/2 z-30 pointer-events-none hidden md:block">
          <GlossyCapsule
            color="purple"
            size="hero"
            rotation="-38deg"
            animation="animate-float-slow"
          />
        </div>

        {/* Medium-Large Cyan/Mint Capsule floating over the left headline */}
        <div className="absolute top-[28%] left-[22%] sm:left-[24%] z-20 pointer-events-none">
          <GlossyCapsule
            color="cyan"
            size="lg"
            rotation="-26deg"
            animation="animate-float-tilt"
          />
        </div>

        {/* Small Purple Capsule floating center-low */}
        <div className="absolute bottom-[34%] left-[41%] z-10 pointer-events-none hidden sm:block">
          <GlossyCapsule
            color="purple"
            size="sm"
            rotation="-34deg"
            animation="animate-float-small"
          />
        </div>

        {/* Medium Purple Capsule floating bottom-right under cards */}
        <div className="absolute bottom-[4%] right-[38%] z-20 pointer-events-none hidden lg:block">
          <GlossyCapsule
            color="purple"
            size="md"
            rotation="-42deg"
            animation="animate-float-reverse"
          />
        </div>

        {/* Top App Header inside Frame */}
        <header className="flex items-center justify-between relative z-20 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 p-[1.5px] shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              <div className="h-full w-full bg-[#0a0e1a] rounded-[14px] flex items-center justify-center text-teal-400">
                <Pill className="h-5 w-5" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Drug<span className="text-teal-400">Track</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold tracking-wide">
                  v1.0 PROD
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <span className="text-white border-b-2 border-teal-400 pb-1 cursor-pointer">
              Supply Chain
            </span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">
              Drug Catalog
            </span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">
              Dispatches
            </span>
            <span className="hover:text-slate-200 transition-colors cursor-pointer">
              Cold Chain
            </span>
          </nav>

          {/* Top Right System Status & Quick Auth Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Online</span>
            </div>
            <button
              onClick={() => setActiveTab(activeTab === 'demo' ? 'credentials' : 'demo')}
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-md hover:shadow-white/20"
            >
              {activeTab === 'demo' ? 'Custom Login' : 'Demo Roles'}
            </button>
          </div>
        </header>

        {/* Central Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-6 sm:py-10 relative z-20">
          
          {/* Left Column: Futuristic Headline & Value Props */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 pr-0 lg:pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autonomous Pharmaceutical Logistics</span>
            </div>

            {/* Giant Modern Typography matching the reference image layout */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              Intelligent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-cyan-300 to-purple-300">
                pharmaceutical
              </span> <br />
              supply chain <span className="inline-block text-white/80 font-light">⇄</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed font-normal">
              Automated batch tracking, real-time warehouse inventory, and FDA-compliant dispensary distribution. Zero delay. 100% verified integrity.
            </p>

            {/* Action Buttons & Quick Highlights */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleExecuteDemoLogin(demoAccounts[0])}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold backdrop-blur-lg transition-all hover:border-teal-400/50 group"
              >
                <span>Launch Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-teal-400" />
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit Encrypted JWT Auth</span>
              </div>
            </div>

            {/* Partner & Compliance Badges matching bottom left of reference */}
            <div className="pt-6 sm:pt-10 border-t border-white/5 flex flex-wrap items-center gap-6 sm:gap-8 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Check className="w-3.5 h-3.5 text-teal-400" /> FDA 21 CFR Part 11
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Check className="w-3.5 h-3.5 text-teal-400" /> WHO-GMP Standard
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Check className="w-3.5 h-3.5 text-teal-400" /> Vercel Serverless Ready
              </span>
            </div>
          </div>

          {/* Right Column: Sleek Frosted Glass Login & 1-Click Role Access Card */}
          <div className="lg:col-span-5 relative">
            <div className="glass-card-dark rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
              
              {/* Card Header & Tab Switcher matching the reference image's 'Exchange Crypto / Buy Crypto' tabs */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setActiveTab('demo')}
                    className={`text-xs font-bold tracking-wide transition-all relative pb-2 ${
                      activeTab === 'demo'
                        ? 'text-white border-b-2 border-teal-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1-Click Demo Roles
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('credentials')}
                    className={`text-xs font-bold tracking-wide transition-all relative pb-2 ${
                      activeTab === 'credentials'
                        ? 'text-white border-b-2 border-teal-400'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Account Credentials
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* TAB 1: 1-Click Role Switcher */}
              {activeTab === 'demo' ? (
                <div className="mt-5 space-y-4">
                  <p className="text-[11px] text-slate-400 font-medium">
                    Select any role to test instant authorization & dynamic dashboards:
                  </p>

                  <div className="space-y-2.5">
                    {demoAccounts.map((account) => {
                      const Icon = account.icon;
                      const isSelected = selectedRole === account.role;
                      return (
                        <div
                          key={account.role}
                          onClick={() => handleQuickDemoSelect(account)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-white/10 border-teal-400/50 shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                              : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2.5 rounded-xl border ${account.badgeColor}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">
                                  {account.title}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 uppercase font-mono">
                                  {account.role}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {account.desc}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExecuteDemoLogin(account);
                            }}
                            disabled={loading}
                            className="ml-3 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white/10 hover:bg-white hover:text-slate-950 text-white transition-all whitespace-nowrap flex items-center gap-1"
                          >
                            <span>Launch</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="button"
                    onClick={handleLoginSubmit}
                    disabled={loading}
                    className="w-full mt-4 py-3.5 px-4 rounded-2xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating {selectedRole}...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In as {selectedRole.replace('_', ' ')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* TAB 2: Custom Credentials Form */
                <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@drugtrack.com"
                        className="w-full pl-10 pr-4 py-2.5 text-xs glass-input-dark rounded-xl focus:outline-none transition-all placeholder-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-[11px] font-medium text-teal-400 hover:text-teal-300"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 text-xs glass-input-dark rounded-xl focus:outline-none transition-all placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded bg-slate-800 border-white/20 text-teal-500 focus:ring-teal-500/20"
                      />
                      <span className="text-[11px] text-slate-400">
                        Remember session (30 days)
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Authorize Access</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Card Footer Status matching the screenshot's 'Estimated rate: 1 BTC = 16.21 ETH' */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Port 5000 · Local Express API</span>
                </span>
                <span className="text-slate-500">Zero latency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar inside Frame */}
        <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 relative z-20 gap-3">
          <div className="flex items-center gap-4">
            <span>© 2026 DrugTrack Network</span>
            <span>·</span>
            <span>Production MERN Architecture</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Ready for local run & Vercel deployment</span>
          </div>
        </footer>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card-dark rounded-3xl p-6 sm:p-7 max-w-md w-full border border-white/15 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" /> Reset Security Credentials
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your authorized organization email address. A cryptographic reset token will be dispatched by the administrative gateway.
            </p>

            {forgotSuccess ? (
              <div className="p-4 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                Reset instructions dispatched if registered in clinical directory.
              </div>
            ) : (
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="registered@drugtrack.com"
                className="w-full px-3.5 py-2.5 text-xs glass-input-dark rounded-xl focus:outline-none placeholder-slate-500"
              />
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSuccess(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
              >
                Close
              </button>
              {!forgotSuccess && (
                <button
                  type="button"
                  onClick={() => setForgotSuccess(true)}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all"
                >
                  Send Recovery Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
