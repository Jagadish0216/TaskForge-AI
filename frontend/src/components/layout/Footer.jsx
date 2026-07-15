export const Footer = () => {
  return (
    <footer className="mt-auto py-4 px-6 md:px-8 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p>© {new Date().getFullYear()} TaskForge AI. Enterprise SaaS Management Platform.</p>
        <p className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
          v2.5.0-prod • Spring Boot 3 & React 18
        </p>
      </div>
    </footer>
  );
};

export default Footer;
