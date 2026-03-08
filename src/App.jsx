import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import RoleSelection from "./pages/RoleSelection";
import FounderDashboard from "./pages/FounderDashboard";
import InvestorDashboard from "./pages/InvestorDashboard";
import PartnerDashboard from "./pages/PartnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventsPage from "./pages/EventsPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [role, setRole] = useState(null);

  const navigate = (page, r = null) => {
    setCurrentPage(page);
    if (r) setRole(r);
    window.scrollTo(0, 0);
  };

  const pages = {
    landing: <LandingPage navigate={navigate} />,
    roleselect: <RoleSelection navigate={navigate} />,
    founder: <FounderDashboard navigate={navigate} />,
    investor: <InvestorDashboard navigate={navigate} />,
    partner: <PartnerDashboard navigate={navigate} />,
    admin: <AdminDashboard navigate={navigate} />,
    events: <EventsPage navigate={navigate} />,
  };

  return <div className="min-h-screen">{pages[currentPage] || pages.landing}</div>;
}
