import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import MatchAnalysis from './pages/MatchAnalysis';
import Predictions from './pages/Predictions';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Players": Players,
    "MatchAnalysis": MatchAnalysis,
    "Predictions": Predictions,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};