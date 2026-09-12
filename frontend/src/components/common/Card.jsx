import { motion } from 'framer-motion';

export const Card = ({ children, className = '', onClick, noPad = false }) => {
  return (
    <motion.div
      whileHover={onClick ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      className={`glass-card rounded-xl ${noPad ? '' : 'p-4 sm:p-5'} border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
