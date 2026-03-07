import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="brand">SmartStreet</div>
          <ul className="nav-links">
            <li><a href="#danger-map">Danger Map</a></li>
            <li><a href="#report">Report hazard</a></li>
            <li><a href="#watch">Watch me</a></li>
          </ul>
        </div>
        <div className="navbar-right">
          <button className="sos-btn">SOS</button>
          <button className="icon-btn">🔔</button>
          <button className="icon-btn">👤</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Safer Streets Start With Awareness</h1>
        <p className="hero-description">
          SmartStreet AI is a community-powered road safety platform that detects street
          hazards, maps danger zones, and helps pedestrians respond quickly during emergencies.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </section>
    </div>
  );
}

export default Landing;
