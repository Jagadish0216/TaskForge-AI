import { motion } from 'framer-motion';

export const Card = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      whileHover={onClick ? { y: -2, transition: { duration: 0.15 } } : undefined}
      onClick={onClick}
      className={`glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-sm dark:shadow-slate-950/40 ${
        onClick ? 'cursor-pointer hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
