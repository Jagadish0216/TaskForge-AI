import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, X } from 'lucide-react';

export const GuidedTourModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (searchParams.get('tour') === 'true') {
      setIsOpen(true);
    }
  }, [searchParams]);

  const steps = [
    {
      title: 'Navigation Sidebar',
      desc: 'Access your Dashboard, Projects Directory, Tasks, Calendar, Reports, and System Settings anytime from the collapsible sidebar.',
      badge: 'Step 1 of 6',
    },
    {
      title: 'Executive Metric Cards',
      desc: 'View real-time project statistics, completed task metrics, and active backlog velocity cards at a glance.',
      badge: 'Step 2 of 6',
    },
    {
      title: 'Kanban Workflows',
      desc: 'Organize tasks into To Do, In Progress, In Review, and Done columns with instant inline status changers.',
      badge: 'Step 3 of 6',
    },
    {
      title: 'Calendar Milestone Schedules',
      desc: 'Visualize deliverable deadlines, milestone commitments, and team schedule grids across all projects.',
      badge: 'Step 4 of 6',
    },
    {
      title: 'AI Backlog Engine',
      desc: 'Use natural language inputs or automated scheduling to decompose complex project goals into balanced sprint tasks.',
      badge: 'Step 5 of 6',
    },
    {
      title: 'Universal Quick Search (⌘K)',
      desc: 'Query across thousands of tasks, comments, and team members instantly with zero network latency.',
      badge: 'Step 6 of 6',
    },
  ];

  const handleClose = () => {
    setIsOpen(false);
    searchParams.delete('tour');
    setSearchParams(searchParams);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-blue-400 uppercase">
                {steps[currentStep].badge}
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight">{steps[currentStep].title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{steps[currentStep].desc}</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-30 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
                {currentStep === steps.length - 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GuidedTourModal;
