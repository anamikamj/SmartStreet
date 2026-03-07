import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

const MOCK_PROFILE = {
  name: "Riya",
  email: "riya.renjit.4911@gmail.com",
  blood_type: "B+",
  medical_notes: "Allergic to peanuts",
  emergency_contact: "Joe",
  emergency_phone: "6767676767",
};

function Profile() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = "RI";

  const labelStyle = {
    fontSize: "10px",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    fontFamily: "monospace",
    display: "block",
    marginBottom: "6px",
  };

  const fieldStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    color: "rgba(255,255,255,0.7)",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "16px",
    padding: "14px 16px",
    marginBottom: "16px",
  };

  const sectionStyle = {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "16px",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      padding: "40px 80px",
      maxWidth: "700px",
      margin: "0 auto",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      color: "#fff",
    }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
        <button onClick={() => navigate(-1)} style={{
          background: "none", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.4)", padding: "8px 20px",
          borderRadius: "50px", cursor: "pointer", fontSize: "14px",
          fontFamily: "inherit",
        }}>← Back</button>

        <button
          onClick={handleSignOut}
          style={{
            background: "none", border: "1px solid rgba(255,77,109,0.3)",
            color: "rgba(255,77,109,0.7)", padding: "8px 20px",
            borderRadius: "50px", cursor: "pointer", fontSize: "14px",
            fontFamily: "inherit", transition: "all 0.2s",
          }}
          onMouseOver={e => { e.target.style.background = "rgba(255,77,109,0.1)"; e.target.style.color = "#ff4d6d"; }}
          onMouseOut={e => { e.target.style.background = "none"; e.target.style.color = "rgba(255,77,109,0.7)"; }}
        >
          Sign Out
        </button>
      </div>

      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "36px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          background: "linear-gradient(135deg, #5ec4c4, #6366f1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", fontWeight: "600", color: "#fff", flexShrink: 0,
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "300", letterSpacing: "-0.5px", marginBottom: "4px" }}>
            {MOCK_PROFILE.name}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "15px", fontFamily: "monospace" }}>
            {MOCK_PROFILE.email}
          </p>
        </div>
      </div>

      {/* Personal Info */}
      <div style={sectionStyle}>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "20px" }}>
          ⬡ Personal Info
        </div>

        <label style={labelStyle}>Full Name</label>
        <div style={fieldStyle}>{MOCK_PROFILE.name}</div>

        <label style={labelStyle}>Email Address</label>
        <div style={{ ...fieldStyle, opacity: 0.5 }}>{MOCK_PROFILE.email}</div>
      </div>

      {/* Medical Info */}
      <div style={sectionStyle}>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "20px" }}>
          ⬡ Medical Info
        </div>

        <label style={labelStyle}>Blood Type</label>
        <div style={fieldStyle}>{MOCK_PROFILE.blood_type}</div>

        <label style={labelStyle}>Medical Conditions / Allergies</label>
        <div style={fieldStyle}>{MOCK_PROFILE.medical_notes}</div>
      </div>

      {/* Emergency Contact */}
      <div style={sectionStyle}>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "20px" }}>
          ⬡ Emergency Contact
        </div>

        <label style={labelStyle}>Contact Name</label>
        <div style={fieldStyle}>{MOCK_PROFILE.emergency_contact}</div>

        <label style={labelStyle}>Phone Number</label>
        <div style={fieldStyle}>{MOCK_PROFILE.emergency_phone}</div>
      </div>

      {/* View QR */}
      <button
        onClick={() => navigate("/emergency-id")}
        style={{
          width: "100%", padding: "14px",
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: "10px", color: "rgba(99,102,241,0.9)",
          fontFamily: "inherit", fontSize: "15px", cursor: "pointer",
          letterSpacing: "1px", transition: "all 0.2s",
        }}
        onMouseOver={e => e.currentTarget.style.background = "rgba(99,102,241,0.2)"}
        onMouseOut={e => e.currentTarget.style.background = "rgba(99,102,241,0.12)"}
      >
        🪪 View Emergency QR
      </button>

    </div>
  );
}

export default Profile;