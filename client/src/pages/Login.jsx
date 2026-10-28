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
  ArrowRight,
  Sparkles,
  Activity,
  Check,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a14] text-slate-100 flex items-center justify-center p-3 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* Ambient background glow nebulas */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Window Frame */}
      <div className="max-w-[1280px] w-full min-h-[680px] rounded-[36px] bg-[#090d18]/90 border border-white/10 shadow-[0_50px_120px_rgba(0,0,0,0.9)] relative overflow-hidden backdrop-blur-3xl flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10">

        {/* Floating 3D Glossy Capsules */}
        {/* Giant Top-Center Purple Capsule */}
        <div className="absolute -top-14 left-[44%] sm:left-[48%] -translate-x-1/2 z-30 pointer-events-none hidden md:block">
          <GlossyCapsule
            color="purple"
            size="hero"
            rotation="-38deg"
            animation="animate-float-slow"
          />
        </div>

        {/* Cyan/Mint Capsule over left headline */}
        <div className="absolute top-[28%] left-[22%] sm:left-[24%] z-20 pointer-events-none">
          <GlossyCapsule
            color="cyan"
            size="lg"
            rotation="-26deg"
            animation="animate-float-tilt"
          />
        </div>

        {/* Small Purple Capsule center-low */}
        <div className="absolute bottom-[34%] left-[41%] z-10 pointer-events-none hidden sm:block">
          <GlossyCapsule
            color="purple"
            size="sm"
            rotation="-34deg"
            animation="animate-float-small"
          />
        </div>

        {/* Medium Purple Capsule bottom-right */}
        <div className="absolute bottom-[4%] right-[38%] z-20 pointer-events-none hidden lg:block">
          <GlossyCapsule
            color="purple"
            size="md"
            rotation="-42deg"
            animation="animate-float-reverse"
          />
        </div>

        {/* Central Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-4 sm:py-8 relative z-20 flex-1">

          {/* Left Column: Headline & Value Props */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 pr-0 lg:pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autonomous Pharmaceutical Logistics</span>
            </div>

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

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit Encrypted JWT Auth</span>
            </div>

            {/* Compliance Badges */}
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

          {/* Right Column: Frosted Glass Login Form */}
          <div className="lg:col-span-5 relative">
            <div className="glass-card-dark rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">

              {/* Card Title */}
              <div className="pb-5 border-b border-white/10">
                <div className="flex items-center gap-3 mb-1">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 p-[1.5px] shadow-[0_0_16px_rgba(20,184,166,0.4)]">
                    <div className="h-full w-full bg-[#0a0e1a] rounded-[10px] flex items-center justify-center text-teal-400">
                      <Pill className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-base font-black tracking-tight text-white">
                      Drug<span className="text-teal-400">Track</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pharmaceutical Supply Chain Portal</p>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Account Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@drugtrack.com"
                      className="w-full pl-10 pr-4 py-3 text-xs glass-input-dark rounded-xl focus:outline-none transition-all placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] font-medium text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 text-xs glass-input-dark rounded-xl focus:outline-none transition-all placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to DrugTrack</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Card Footer */}
              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>Port 5000 · Local Express API</span>
                </span>
                <span>Encrypted · Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <footer className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 relative z-20 gap-3">
          <div className="flex items-center gap-4">
            <span>© 2026 DrugTrack Network</span>
            <span>·</span>
            <span>Production MERN Architecture</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            <span>Ready for local run &amp; Vercel deployment</span>
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
              Enter your authorized organization email. A cryptographic reset token will be dispatched by the administrative gateway.
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
