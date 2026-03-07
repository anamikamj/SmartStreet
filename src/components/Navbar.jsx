import { useNavigate, useLocation } from "react-router-dom";
import bellIcon from "../assets/bell.svg";
import userIcon from "../assets/user.svg";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Danger Map", path: "/danger-map" },
    { label: "Report Hazard", path: "/report" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          SmartStreet
        </div>
        <ul className="nav-links">
          {links.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <li
                key={path}
                onClick={() => navigate(path)}
                style={{
                  cursor: "pointer",
                  color: isActive ? "var(--accent-teal)" : "var(--text-primary)",
                  borderBottom: isActive ? "2px solid var(--accent-teal)" : "2px solid transparent",
                  paddingBottom: "4px",
                  fontWeight: isActive ? "600" : "400",
                  transition: "all 0.2s ease",
                }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="navbar-right">
        <button className="sos-btn" onClick={() => navigate("/sos")}>SOS</button>
        <button className="icon-btn" title="Notifications">
          <img src={bellIcon} alt="Notifications" style={{ width: "20px", height: "20px" }} />
        </button>
        <button className="icon-btn" onClick={() => navigate("/profile")} title="Profile">
          <img src={userIcon} alt="Profile" style={{ width: "20px", height: "20px" }} />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;