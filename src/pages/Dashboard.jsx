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
      icon: "👁️",
      title: "Start Watch Me",
      description: "Activate real-time safety monitoring and alert trusted contacts during your journey",
      color: "#5ec4c4"
    },
    {
      icon: "🗺️",
      title: "Danger Map",
      description: "View and navigate around reported hazard zones in your area",
      color: "#ff9f43"
    },
    {
      icon: "⚠️",
      title: "Report Hazard",
      description: "Help your community by reporting street hazards, potholes, or dangerous areas",
      color: "#feca57"
    },
    {
      icon: "🆘",
      title: "SOS Alert",
      description: "Instantly send emergency alerts to your trusted contacts and authorities",
      color: "#ff4d6d"
    },
    {
      icon: "📞",
      title: "Emergency Call",
      description: "Quick access to emergency services with location sharing",
      color: "#48dbfb"
    },
    {
      icon: "👥",
      title: "Trusted Contacts",
      description: "Manage your emergency contact list for Watch Me mode",
      color: "#a29bfe"
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
            <div key={index} className="dashboard-card">
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
