import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Mail, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Password recovery email dispatched!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-blue-500/30 selection:text-blue-400">
      {/* Left Marketing Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-12 flex-col justify-between overflow-hidden border-r border-slate-800">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-white text-xl tracking-tight">TaskForge AI</span>
            <span className="text-[10px] text-blue-400 font-mono block">ENTERPRISE SECURITY SUITE</span>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-lg">
          <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl w-fit">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-snug">
            Secure, instant account recovery whenever you need it.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter your registered enterprise work email address and we will dispatch a secure time-limited password reset magic link.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-mono">
          TaskForge AI 2.5 Security Framework • 256-Bit SSL Encryption
        </div>
      </div>

      {/* Right Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>

          {!submitted ? (
            <>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-white">Reset Account Password</h2>
                <p className="text-xs text-slate-400">
                  Enter your registered work email address to receive password recovery instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Registered Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Dispatching Link...' : 'Send Recovery Instructions'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-center py-6">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Check Your Inbox</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                We sent a password reset link to <span className="font-semibold text-white">{email}</span>. Click the link in the email to set your new password.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/reset-password')}
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-xs font-semibold text-white rounded-xl hover:bg-slate-800 transition-all"
                >
                  Simulate Opening Magic Reset Link
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
