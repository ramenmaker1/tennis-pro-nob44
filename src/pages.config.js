import { lazy } from 'react';
import Layout from './Layout.jsx';

// New primary pages
const Simulator = lazy(() => import('./pages/Simulator'));
const LiveAnalysis = lazy(() => import('./pages/LiveAnalysis'));
const Settings = lazy(() => import('./pages/Settings'));

// Legacy pages (kept for backward compatibility)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveGames = lazy(() => import('./pages/LiveGames'));
const TopPlayers = lazy(() => import('./pages/TopPlayers'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const LivePlayers = lazy(() => import('./pages/LivePlayers'));
const DataAnalysis = lazy(() => import('./pages/DataAnalysis'));
const PlayerDetail = lazy(() => import('./pages/PlayerDetail'));
const Players = lazy(() => import('./pages/Players'));
const MatchAnalysis = lazy(() => import('./pages/MatchAnalysis'));
const Predictions = lazy(() => import('./pages/Predictions'));
const Analytics = lazy(() => import('./pages/Analytics'));
const MatchHistory = lazy(() => import('./pages/MatchHistory'));
const MLDashboard = lazy(() => import('./pages/MLDashboard'));
const BulkImport = lazy(() => import('./pages/BulkImport'));
const Compliance = lazy(() => import('./pages/Compliance'));
const DataQuality = lazy(() => import('./pages/DataQuality'));
const Help = lazy(() => import('./pages/Help'));

export const PAGES = {
  // New primary pages
  Simulator: Simulator,
  LiveAnalysis: LiveAnalysis,
  Settings: Settings,
  
  // Legacy pages
  Dashboard: Dashboard,
  LiveGames: LiveGames,
  TopPlayers: TopPlayers,
  Tournaments: Tournaments,
  LivePlayers: LivePlayers,
  DataAnalysis: DataAnalysis,
  PlayerDetail: PlayerDetail,
  Players: Players,
  MatchAnalysis: MatchAnalysis,
  Predictions: Predictions,
  Analytics: Analytics,
  MatchHistory: MatchHistory,
  BulkImport: BulkImport,
  Compliance: Compliance,
  DataQuality: DataQuality,
  Help: Help,
  MLDashboard: MLDashboard,
};

export const pagesConfig = {
  mainPage: 'Simulator', // Changed from Dashboard to Simulator
  Pages: PAGES,
  Layout: Layout,
};
