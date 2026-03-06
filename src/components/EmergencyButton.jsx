import React from "react";

function EmergencyButton({ onEmergency }) {
  return (
    <button
      onClick={onEmergency}
      style={{
        background: "red",
        color: "white",
        padding: "15px 25px",
        border: "none",
        borderRadius: "10px",
        fontSize: "18px",
        cursor: "pointer",
      }}
    >
      🚨 Emergency Help
    </button>
  );
}

export default EmergencyButton;