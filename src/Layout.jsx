import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Target,
  Radio,
  Settings,
  TrendingUp,
  Menu,
  X,
  HelpCircle,
  FileText,
} from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { DataSourceSelector } from '@/components/DataSourceSelector';
import ThemeToggle from './components/ThemeToggle';
import ApiUsageStats from './components/ApiUsageStats';

// Simplified 3-tab navigation structure
const mainTabs = [
  { 
    name: 'SIMULATOR', 
    icon: Target, 
    path: 'Simulator', 
    emoji: '🎾',
    description: 'Core prediction engine'
  },
  { 
    name: 'LIVE & ANALYSIS', 
    icon: Radio, 
    path: 'LiveAnalysis', 
    emoji: '📡',
    description: 'Real-time tracking & learning'
  },
  { 
    name: 'SETTINGS', 
    icon: Settings, 
    path: 'Settings', 
    emoji: '⚙️',
    description: 'Players, models & data sources'
  },
];

// Quick access links (footer)
const footerLinks = [
  { name: 'Help', icon: HelpCircle, path: 'Help' },
  { name: 'Compliance', icon: FileText, path: 'Compliance' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const currentPath = location.pathname.split('/').pop() || 'Simulator';

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gray-950">
        
        {/* TOP NAVIGATION BAR */}
        <header className="bg-gray-900 border-b-2 border-yellow-400 border-opacity-30 sticky top-0 z-50">
          <div className="px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              
              {/* Logo */}
              <Link to={createPageUrl('Simulator')} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <TrendingUp className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h1 className="font-black text-yellow-400 text-xl tracking-tight">TennisPro</h1>
                  <p className="text-xs text-gray-400">AI Prediction Engine</p>
                </div>
              </Link>

              {/* Desktop Navigation - 3 Main Tabs */}
              <nav className="hidden lg:flex items-center gap-2">
                {mainTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentPath === tab.path;
                  
                  return (
                    <Link
                      key={tab.path}
                      to={createPageUrl(tab.path)}
                      className={`
                        flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all
                        ${isActive 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/50' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-yellow-400 border-2 border-gray-700'
                        }
                      `}
                    >
                      <span className="text-xl">{tab.emoji}</span>
                      <span>{tab.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Right Side Actions */}
              <div className="hidden lg:flex items-center gap-4">
                <DataSourceSelector />
                <ThemeToggle />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-yellow-400 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="lg:hidden mt-4 pb-4 space-y-2 border-t border-gray-800 pt-4">
                {mainTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentPath === tab.path;
                  
                  return (
                    <Link
                      key={tab.path}
                      to={createPageUrl(tab.path)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                        ${isActive 
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }
                      `}
                    >
                      <span className="text-xl">{tab.emoji}</span>
                      <div>
                        <div>{tab.name}</div>
                        <div className="text-xs opacity-70">{tab.description}</div>
                      </div>
                    </Link>
                  );
                })}
                
                <div className="pt-4 space-y-3 border-t border-gray-800 mt-4">
                  <DataSourceSelector />
                  <div className="flex items-center justify-between">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-gray-900 border-t-2 border-yellow-400 border-opacity-30 py-6">
          <div className="px-4 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
              <div>
                © 2025 TennisPro AI • Powered by Machine Learning
              </div>
              <div className="flex items-center gap-6">
                {footerLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={createPageUrl(link.path)} 
                    className="hover:text-yellow-400 transition-colors flex items-center gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* API Usage Stats Widget */}
        <ApiUsageStats />
      </div>
    </ErrorBoundary>
  );
}
