import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, MailCheck, RotateCcw, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const VerifyEmail = () => {
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      toast.success('Verification link resent to your email!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-white text-lg">TaskForge AI</span>
        </div>

        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto">
          <MailCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Verify Your Email Address</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            We sent a verification link to your registered email address. Click the button in that message to verify your identity.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Workspace Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resending ? 'Resending Link...' : 'Resend Email Link'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
