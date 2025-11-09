import { lazy } from 'react';
import Layout from './Layout.jsx';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveGames = lazy(() => import('./pages/LiveGames'));
const TopPlayers = lazy(() => import('./pages/TopPlayers'));
const Tournaments = lazy(() => import('./pages/Tournaments'));
const LivePlayers = lazy(() => import('./pages/LivePlayers'));
const DataAnalysis = lazy(() => import('./pages/DataAnalysis'));
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
  Dashboard: Dashboard,
  LiveGames: LiveGames,
  TopPlayers: TopPlayers,
  Tournaments: Tournaments,
  LivePlayers: LivePlayers,
  DataAnalysis: DataAnalysis,
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
  mainPage: 'Dashboard',
  Pages: PAGES,
  Layout: Layout,
};
