export default function CommunityAlertPanel({
  emergencyType,
  alertSent,
  alertId,
  responders,
  sending,
  onSend,
  onCancel,
}) {
  return (
    <div style={{
      background: alertSent
        ? "rgba(234,179,8,0.08)"
        : "rgba(255,255,255,0.03)",
      border: `1px solid ${alertSent
        ? "rgba(234,179,8,0.3)"
        : "rgba(255,255,255,0.08)"}`,
      borderRadius: "16px",
      padding: "20px 24px",
      marginBottom: "16px",
      transition: "all 0.3s",
    }}>
      <div style={{
        fontSize: "11px", color: alertSent
          ? "rgba(234,179,8,0.8)"
          : "rgba(255,255,255,0.3)",
        letterSpacing: "2px", fontFamily: "monospace",
        textTransform: "uppercase", marginBottom: "12px",
      }}>
        ⬡ Community Alert
      </div>

      {!alertSent ? (
        <>
          <p style={{
            fontSize: "15px", color: "rgba(255,255,255,0.5)",
            fontWeight: "300", marginBottom: "14px", lineHeight: 1.5,
          }}>
            Notify nearby registered users within 1km to assist with this emergency.
          </p>
          <button
            onClick={onSend}
            disabled={sending}
            style={{
              width: "100%", padding: "14px",
              background: sending
                ? "rgba(234,179,8,0.2)"
                : "rgba(234,179,8,0.9)",
              color: "#000", border: "none",
              borderRadius: "10px", fontSize: "14px",
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: "500", letterSpacing: "1px",
              cursor: sending ? "not-allowed" : "pointer",
              boxShadow: sending ? "none" : "0 4px 20px rgba(234,179,8,0.3)",
            }}
          >
            {sending ? "Sending Alert..." : "📢 Alert Nearby Community"}
          </button>
        </>
      ) : (
        <>
          <div style={{
            display: "flex", alignItems: "center",
            gap: "10px", marginBottom: "14px",
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#eab308", animation: "pulse 1.2s infinite",
            }} />
            <span style={{ fontSize: "15px", color: "#eab308", fontWeight: "300" }}>
              Alert sent — waiting for nearby helpers
            </span>
          </div>

          {/* Responders list */}
          {responders.length === 0 ? (
            <div style={{
              fontSize: "13px", color: "rgba(255,255,255,0.25)",
              fontFamily: "monospace", letterSpacing: "1px",
              marginBottom: "14px",
            }}>
              No responses yet...
            </div>
          ) : (
            <div style={{ marginBottom: "14px" }}>
              <div style={{
                fontSize: "11px", color: "rgba(255,255,255,0.3)",
                letterSpacing: "1px", fontFamily: "monospace",
                textTransform: "uppercase", marginBottom: "8px",
              }}>
                {responders.length} Helper{responders.length > 1 ? "s" : ""} Responding
              </div>
              {responders.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center",
                  gap: "10px", padding: "10px 14px",
                  background: "rgba(74,222,128,0.08)",
                  border: "1px solid rgba(74,222,128,0.2)",
                  borderRadius: "10px", marginBottom: "8px",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#4ade80", flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: "15px", color: "#4ade80", fontWeight: "300" }}>
                      {r.responder_name} is on the way
                    </div>
                    <div style={{
                      fontSize: "11px", color: "rgba(255,255,255,0.3)",
                      fontFamily: "monospace",
                    }}>
                      {r.responder_lat?.toFixed(4)}, {r.responder_lng?.toFixed(4)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button onClick={onCancel} style={{
            width: "100%", padding: "12px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", color: "rgba(255,255,255,0.4)",
            fontFamily: "inherit", fontSize: "14px", cursor: "pointer",
            letterSpacing: "1px",
          }}>
            Cancel Alert
          </button>
        </>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}