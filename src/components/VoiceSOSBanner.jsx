export default function VoiceSOSBanner({ active, onDismiss }) {
  if (!active) return null;

  return (
    <div style={{
      position: "fixed", top: 24, left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      background: "linear-gradient(135deg, rgba(220,38,38,0.95), rgba(185,28,28,0.98))",
      border: "1px solid rgba(255,100,100,0.5)",
      borderRadius: "16px",
      padding: "16px 28px",
      display: "flex", alignItems: "center", gap: "14px",
      boxShadow: "0 8px 40px rgba(220,38,38,0.5)",
      animation: "slideDown 0.4s ease",
      maxWidth: "90vw",
    }}>
      <div style={{
        width: 12, height: 12, borderRadius: "50%",
        background: "#fff", animation: "pulse 0.8s infinite",
        flexShrink: 0,
      }} />
      <div>
        <div style={{
          fontFamily: "monospace", fontSize: "12px",
          letterSpacing: "2px", color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase", marginBottom: "2px",
        }}>
          Voice Command Detected
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: "18px", color: "#fff", fontWeight: "300",
        }}>
          🚨 SOS Activated
        </div>
      </div>
      <button onClick={onDismiss} style={{
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px", color: "#fff",
        padding: "6px 12px", cursor: "pointer",
        fontFamily: "monospace", fontSize: "11px",
        letterSpacing: "1px", marginLeft: "8px",
      }}>
        DISMISS
      </button>
      <style>{`
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}