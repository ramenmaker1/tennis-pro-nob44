import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Brain,
  Upload,
  Shield,
  FileText,
  HelpCircle,
  CalendarClock,
  Radio,
  Trophy,
  Activity,
  LineChart,
  Menu,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import { DataSourceSelector } from '@/components/DataSourceSelector';
import ThemeToggle from './components/ThemeToggle';
import ApiUsageStats from './components/ApiUsageStats';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: 'Dashboard', group: 'navigation' },
  { name: 'Live Games', icon: Radio, path: 'LiveGames', group: 'navigation' },
  { name: 'Top Players', icon: Trophy, path: 'TopPlayers', group: 'navigation' },
  { name: 'Tournaments', icon: Trophy, path: 'Tournaments', group: 'navigation' },
  { name: 'Live Players', icon: Activity, path: 'LivePlayers', group: 'navigation' },
  { name: 'Data Analysis', icon: LineChart, path: 'DataAnalysis', group: 'navigation' },
  { name: 'Players', icon: Users, path: 'Players', group: 'navigation' },
  { name: 'Match Analysis', icon: TrendingUp, path: 'MatchAnalysis', group: 'navigation' },
  { name: 'Predictions', icon: Target, path: 'Predictions', group: 'navigation' },
  { name: 'Analytics', icon: BarChart3, path: 'Analytics', group: 'navigation' },
  { name: 'Match History', icon: CalendarClock, path: 'MatchHistory', group: 'navigation' },
  { name: 'ML Dashboard', icon: Brain, path: 'MLDashboard', group: 'navigation' },
  { name: 'Bulk Import', icon: Upload, path: 'BulkImport', group: 'admin' },
  { name: 'Data Quality', icon: Shield, path: 'DataQuality', group: 'admin' },
  { name: 'Compliance', icon: FileText, path: 'Compliance', group: 'admin' },
  { name: 'Help', icon: HelpCircle, path: 'Help', group: 'admin' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigationGroupItems = navItems.filter((item) => item.group === 'navigation');
  const adminGroupItems = navItems.filter((item) => item.group === 'admin');

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        {/* TOP HEADER NAVIGATION - Desktop */}
        <header className="hidden md:block bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {/* Logo */}
                <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-slate-100 text-lg">TennisPro</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Match Analytics</p>
                  </div>
                </Link>

                {/* Main Navigation */}
                <nav className="flex items-center gap-1">
                  {navigationGroupItems.map((item) => {
                    const itemUrl = createPageUrl(item.path);
                    const isActive = location.pathname === itemUrl;
                    return (
                      <Link
                        key={item.name}
                        to={itemUrl}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="hidden lg:inline">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Right side: Data Source + Theme Toggle */}
              <div className="flex items-center gap-3">
                <DataSourceSelector />
                <ThemeToggle />
              </div>
            </div>

            {/* Admin Tools - Secondary Row */}
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-3">
                Admin
              </span>
              {adminGroupItems.map((item) => {
                const itemUrl = createPageUrl(item.path);
                const isActive = location.pathname === itemUrl;
                return (
                  <Link
                    key={item.name}
                    to={itemUrl}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <item.icon className="w-3 h-3" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100">TennisPro</h2>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="mt-3 pb-2 space-y-1">
                <DataSourceSelector />
                <div className="mt-2 space-y-1">
                  {navigationGroupItems.map((item) => {
                    const itemUrl = createPageUrl(item.path);
                    const isActive = location.pathname === itemUrl;
                    return (
                      <Link
                        key={item.name}
                        to={itemUrl}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase px-3">
                    Admin Tools
                  </span>
                  <div className="mt-2 space-y-1">
                    {adminGroupItems.map((item) => {
                      const itemUrl = createPageUrl(item.path);
                      const isActive = location.pathname === itemUrl;
                      return (
                        <Link
                          key={item.name}
                          to={itemUrl}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                            isActive
                              ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* API Usage Stats Widget */}
        <ApiUsageStats />
      </div>
    </ErrorBoundary>
  );
}
