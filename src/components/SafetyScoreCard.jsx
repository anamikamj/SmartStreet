function SafetyScoreCard({ score, level, color, advice, counts }) {
  return (
    <div style={{
      background: "#111",
      border: `2px solid ${color}`,
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      color: "white",
    }}>
      {/* Score */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{
          fontSize: "52px",
          fontWeight: "bold",
          color: color,
          lineHeight: 1,
        }}>
          {score}
        </div>
        <div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>{level}</div>
          <div style={{ fontSize: "13px", color: "#aaa", marginTop: "4px" }}>
            Street Safety Score
          </div>
        </div>
      </div>

      {/* Advice */}
      <div style={{
        marginTop: "12px",
        background: "#1e1e1e",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "13px",
        color: "#ccc",
      }}>
        ⚠️ {advice}
      </div>

      {/* Breakdown */}
      <div style={{
        marginTop: "12px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
      }}>
        <StatBadge label="Offenders Nearby" value={counts.offenders} alert={counts.offenders > 0} />
        <StatBadge label="Abduction Cases" value={counts.abductions} alert={counts.abductions > 0} />
        <StatBadge label="Crime Reports" value={counts.crimes} alert={counts.crimes > 0} />
        <StatBadge label="Unsafe Zones" value={counts.unsafeZones} alert={counts.unsafeZones > 0} />
      </div>
    </div>
  );
}

function StatBadge({ label, value, alert }) {
  return (
    <div style={{
      background: alert ? "#2a0000" : "#1a1a1a",
      border: `1px solid ${alert ? "#ff4444" : "#333"}`,
      borderRadius: "8px",
      padding: "8px 12px",
    }}>
      <div style={{ fontSize: "20px", fontWeight: "bold", color: alert ? "#ff4444" : "#aaa" }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: "#777" }}>{label}</div>
    </div>
  );
}

export default SafetyScoreCard;