import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function SOSEvidence() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const buzzerIntervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [location, setLocation] = useState("Fetching...");
  const [timestamp, setTimestamp] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`),
      () => setLocation("Unavailable")
    );
  }, []);

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // Cleanup buzzer on unmount
  useEffect(() => {
    return () => stopBuzzer();
  }, []);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  function playBuzzerBeep() {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(960, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.01);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) { /* ignore */ }
  }

  function startBuzzer() {
    playBuzzerBeep(); // immediate first beep
    buzzerIntervalRef.current = setInterval(playBuzzerBeep, 800);
  }

  function stopBuzzer() {
    if (buzzerIntervalRef.current) {
      clearInterval(buzzerIntervalRef.current);
      buzzerIntervalRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close();
    }
  }

  async function startSOS() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.start();

    setTimestamp(new Date().toLocaleString());
    setRecording(true);
    setSaved(false);
    startBuzzer();
  }

  async function stopSOS() {
    stopBuzzer();
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    recorder.stop();
    setSaving(true);

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const fileName = `sos-${Date.now()}.webm`;

      videoRef.current.srcObject?.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setRecording(false);

      const { error: uploadError } = await supabase.storage
        .from("incident-videos")
        .upload(fileName, blob);

      if (uploadError) {
        alert("Upload failed: " + uploadError.message);
        setSaving(false);
        return;
      }

      const pos = await new Promise((res) =>
        navigator.geolocation.getCurrentPosition(res, () => res(null))
      );
      const loc = pos ? `${pos.coords.latitude},${pos.coords.longitude}` : location;

      const { error } = await supabase.from("incidents").insert([{
        video_url: fileName,
        location: loc,
        timestamp: new Date().toISOString(),
      }]);

      setSaving(false);
      if (error) alert("DB save failed: " + error.message);
      else setSaved(true);
    };
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "#0f0f0f",
    padding: "40px 80px",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    color: "#fff",
  };

  return (
    <div style={pageStyle}>
      <button
        onClick={() => navigate("/sos")}
        style={{
          background: "none", border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.5)", padding: "8px 20px",
          borderRadius: "50px", cursor: "pointer", fontSize: "14px",
          marginBottom: "48px", fontFamily: "inherit", letterSpacing: "0.3px"
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "56px", fontWeight: "300", letterSpacing: "-1px", marginBottom: "8px" }}>
        🚨 SOS Evidence
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "18px", marginBottom: "40px", fontWeight: "300" }}>
        Recording is stored securely and reported to authorities
      </p>

      {recording && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)",
          color: "#f87171", padding: "8px 18px", borderRadius: "50px",
          fontSize: "13px", marginBottom: "24px", letterSpacing: "1px"
        }}>
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#f87171", animation: "pulse 1s infinite"
          }} />
          RECORDING — {formatTime(elapsed)}
        </div>
      )}

      <div style={{
        borderRadius: "16px", overflow: "hidden", background: "#000",
        marginBottom: "24px", border: "1px solid rgba(255,255,255,0.08)",
        aspectRatio: "16/9", maxHeight: "380px"
      }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px 18px"
        }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Location</div>
          <div style={{ fontSize: "13px", fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>{location}</div>
        </div>
        <div style={{
          flex: 1, background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px 18px"
        }}>
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Started</div>
          <div style={{ fontSize: "13px", fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>{timestamp || "—"}</div>
        </div>
      </div>

      {!recording && !saved && (
        <button
          onClick={startSOS}
          style={{
            width: "100%", padding: "18px", background: "#dc2626",
            color: "#fff", border: "none", borderRadius: "10px",
            fontSize: "15px", fontFamily: "inherit", fontWeight: "500",
            letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
            boxShadow: "0 4px 24px rgba(220,38,38,0.4)"
          }}
        >
          🚨 Start SOS Recording
        </button>
      )}

      {recording && (
        <button
          onClick={stopSOS}
          disabled={saving}
          style={{
            width: "100%", padding: "18px",
            background: "transparent", color: "#f87171",
            border: "1px solid rgba(248,113,113,0.5)", borderRadius: "10px",
            fontSize: "15px", fontFamily: "inherit", fontWeight: "500",
            letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer",
            boxShadow: "0 0 20px rgba(248,113,113,0.1)"
          }}
        >
          {saving ? "Saving Evidence..." : "⏹ Stop & Save Evidence"}
        </button>
      )}

      {saved && (
        <div style={{
          background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.25)",
          borderRadius: "10px", padding: "20px", textAlign: "center",
          color: "#4ade80", fontSize: "16px", fontWeight: "300", letterSpacing: "0.3px"
        }}>
          ✅ Evidence saved and reported to authorities.
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }`}</style>
    </div>
  );
}