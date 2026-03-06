import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
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