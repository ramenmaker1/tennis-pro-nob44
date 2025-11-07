import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import MatchAnalysis from './pages/MatchAnalysis';
import Predictions from './pages/Predictions';
import BulkImport from './pages/BulkImport';
import Compliance from './pages/Compliance';
import DataQuality from './pages/DataQuality';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Players": Players,
    "MatchAnalysis": MatchAnalysis,
    "Predictions": Predictions,
    "BulkImport": BulkImport,
    "Compliance": Compliance,
    "DataQuality": DataQuality,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};