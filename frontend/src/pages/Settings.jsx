import { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Server, Info, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';

export const Settings = () => {
  const [appConfig] = useState({
    version: 'v1.4.2-stable',
    environment: 'Production',
    apiRoot: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    websocketStatus: 'Connected',
    uptime: '14d 6h 32m',
    databaseConnection: 'Connected (MySQL)'
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Platform Settings & Specifications
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor application diagnostics, environment details, and global integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Short Navigation/Status */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              Account Control Link
            </h3>
            <p className="text-xs text-slate-500 leading-normal">
              All profile preferences, notification triggers, theme options, security, and AI preferences have been unified under the main Profile page.
            </p>
            <Link
              to="/profile"
              className="w-full py-2.5 px-4 bg-blue-600 text-white font-semibold text-xs rounded-xl flex items-center justify-between shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-all group"
            >
              <span>Go to Profile Setup</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
        </div>

        {/* Right Side: Diagnostics */}
        <div className="md:col-span-2 space-y-6">
          {/* General Platform Details */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">Application Specifications</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1">
                <span className="text-slate-400 block">Version Release</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{appConfig.version}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Environment Target</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{appConfig.environment}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">API Base Path</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">{appConfig.apiRoot}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Platform Uptime</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{appConfig.uptime}</span>
              </div>
            </div>
          </Card>

          {/* Database & Diagnostics */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">Infrastructure & Databases</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1">
                <span className="text-slate-400 block">MySQL Database</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-450">{appConfig.databaseConnection}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">Active Websockets</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-450">{appConfig.websocketStatus}</span>
              </div>
            </div>
          </Card>

          {/* Security Compliance */}
          <Card className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">Security & Encryption</h3>
            </div>

            <div className="text-xs pt-2 leading-relaxed text-slate-650 dark:text-slate-350">
              <p>
                All data in transit is encrypted using TLS protocol. Session tokens are protected using secure HTTP Session contexts on the platform servers.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
