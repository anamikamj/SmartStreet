// ─── Stat field pill ──────────────────────────────────────────────────────────
function InfoPill({ label, value }) {
  return (
    <div style={{
      background: "#1c1c1e",
      border: "1px solid #2e2e2e",
      borderRadius: "14px",
      padding: "10px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }}>
      <span style={{
        fontSize: "11px",
        color: "#666",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "15px",
        fontWeight: "600",
        color: "#e8e8e8",
        fontFamily: "'Georgia', serif",
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Stat badge ───────────────────────────────────────────────────────────────
function StatBadge({ label, value, alert }) {
  return (
    <div style={{
      background: alert ? "rgba(180,0,0,0.15)" : "#1a1a1a",
      border: `1px solid ${alert ? "#7a1a1a" : "#2e2e2e"}`,
      borderRadius: "10px",
      padding: "10px 14px",
    }}>
      <div style={{
        fontSize: "22px",
        fontWeight: "700",
        color: alert ? "#e05555" : "#888",
        fontFamily: "'Georgia', serif",
      }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>{label}</div>
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────
export default function SafetyScoreCard({ score, level, color, advice, counts, date, time, venue, entryFees }) {
  return (
    <div style={{
      background: "rgba(10, 10, 10, 0.92)",
      border: `1.5px solid ${color || "#7a1a1a"}`,
      borderRadius: "18px",
      padding: "22px 20px",
      color: "white",
      width: "340px",
      backdropFilter: "blur(10px)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
      fontFamily: "'Georgia', serif",
    }}>

      {/* Score + Level */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "14px" }}>
        <div style={{
          fontSize: "64px",
          fontWeight: "900",
          color: color || "#c0392b",
          lineHeight: 1,
          letterSpacing: "-2px",
          fontStyle: "italic",
          minWidth: "70px",
        }}>
          {score}
        </div>
        <div style={{ paddingTop: "6px" }}>
          <div style={{ fontSize: "21px", fontWeight: "700", color: "#e8e8e8", letterSpacing: "0.04em" }}>
            {level}
          </div>
          <div style={{ fontSize: "12px", color: "#888", marginTop: "3px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Street Safety Score
          </div>
        </div>
      </div>

      {/* Warning banner */}
      <div style={{
        background: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "10px",
        padding: "9px 14px",
        fontSize: "12px",
        color: "#bbb",
        marginBottom: "14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <span style={{ color: "#e0a020", fontSize: "14px" }}>⚠</span>
        <span>{advice}</span>
      </div>

      {/* Info pills */}
      {(date || time || venue || entryFees) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          {date && <InfoPill label="Date" value={date} />}
          {time && <InfoPill label="Time" value={time} />}
          {venue && <InfoPill label="Venue" value={venue} />}
          {entryFees && <InfoPill label="Entry Fees" value={entryFees} />}
        </div>
      )}

      {/* Stats breakdown */}
      {counts && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <StatBadge label="Offenders Nearby" value={counts.offenders} alert={counts.offenders > 0} />
          <StatBadge label="Abduction Cases" value={counts.abductions} alert={counts.abductions > 0} />
          <StatBadge label="Crime Reports" value={counts.crimes} alert={counts.crimes > 0} />
          <StatBadge label="Unsafe Zones" value={counts.unsafeZones} alert={counts.unsafeZones > 0} />
        </div>
      )}
    </div>
  );
}