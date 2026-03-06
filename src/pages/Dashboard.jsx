import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const dashboardFeatures = [
    {
      icon: "🗺️",
      title: "Danger Map",
      description: "View and navigate around reported hazard zones in your area",
      color: "#ff9f43",
      route: "/danger-map"
    },
    {
      icon: "⚠️",
      title: "Report Hazard",
      description: "Help your community by reporting street hazards, potholes, or dangerous areas",
      color: "#feca57",
      route: "/report"
    },
    {
      icon: "🆘",
      title: "SOS Alert",
      description: "Instantly send emergency alerts to your trusted contacts and authorities",
      color: "#ff4d6d",
      route: "/sos"
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand">SmartStreet</div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        <h1 className="dashboard-title">Safety Dashboard</h1>
        <p className="dashboard-subtitle">
          Your command center for street safety and emergency response
        </p>

        <div className="dashboard-grid">
          {dashboardFeatures.map((feature, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => navigate(feature.route)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-icon">{feature.icon}</div>
              <h3 className="card-title">{feature.title}</h3>
              <p className="card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;