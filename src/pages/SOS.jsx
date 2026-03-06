import { useNavigate } from "react-router-dom";

export default function SOS() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "60px 80px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Option 1 → SOS Evidence Mode */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "60px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "60px"
      }}>
        <div style={{ maxWidth: "75%" }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: "64px",
            fontWeight: "300",
            color: "#fff",
            lineHeight: "1.1",
            marginBottom: "24px",
            letterSpacing: "-1px"
          }}>
            SOS Evidence Mode
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "20px",
            color: "rgba(255,255,255,0.55)",
            lineHeight: "1.7",
            fontWeight: "300"
          }}>
            Secretly record video and audio evidence during a crime or unsafe situation.
            Triggers a loud buzzer alarm and automatically sends data to authorities.
          </p>
        </div>
        <button
          onClick={() => navigate("/sos/evidence")}
          style={{
            background: "linear-gradient(135deg, #4a7a7a 0%, #2d5a5a 100%)",
            color: "#e8f4f4",
            border: "none",
            borderRadius: "50px",
            padding: "14px 36px",
            fontSize: "15px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: "500",
            cursor: "pointer",
            whiteSpace: "nowrap",
            marginTop: "12px",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 20px rgba(74,122,122,0.3)",
            transition: "all 0.2s"
          }}
          onMouseOver={e => e.target.style.boxShadow = "0 6px 28px rgba(74,122,122,0.5)"}
          onMouseOut={e => e.target.style.boxShadow = "0 4px 20px rgba(74,122,122,0.3)"}
        >
          Start
        </button>
      </div>

      {/* Option 2 → Emergency ER Video Call */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div style={{ maxWidth: "75%" }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            fontSize: "64px",
            fontWeight: "300",
            color: "#fff",
            lineHeight: "1.1",
            marginBottom: "24px",
            letterSpacing: "-1px"
          }}>
            Emergency ER Video Call
          </h1>
          <p style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "20px",
            color: "rgba(255,255,255,0.55)",
            lineHeight: "1.7",
            fontWeight: "300"
          }}>
            Connect live with a medical professional via video call.
            An ambulance notification is dispatched immediately to your location.
          </p>
        </div>
        <button
          onClick={() => navigate("/sos/er")}
          style={{
            background: "linear-gradient(135deg, #4a7a7a 0%, #2d5a5a 100%)",
            color: "#e8f4f4",
            border: "none",
            borderRadius: "50px",
            padding: "14px 36px",
            fontSize: "15px",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: "500",
            cursor: "pointer",
            whiteSpace: "nowrap",
            marginTop: "12px",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 20px rgba(74,122,122,0.3)",
            transition: "all 0.2s"
          }}
          onMouseOver={e => e.target.style.boxShadow = "0 6px 28px rgba(74,122,122,0.5)"}
          onMouseOut={e => e.target.style.boxShadow = "0 4px 20px rgba(74,122,122,0.3)"}
        >
          Start
        </button>
      </div>

    </div>
  );
}