import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useVoiceSOS } from "../hooks/useVoiceSOS";
import { useCommunityAlert } from "../hooks/useCommunityAlert";
import VoiceSOSBanner from "../components/VoiceSOSBanner";
import CommunityAlertPanel from "../components/CommunityAlertPanel";

const CALL_TIMEOUT_SECONDS = 7;

const EMERGENCIES = {
  cpr: {
    label: "CPR", color: "#ef4444", glow: "rgba(239,68,68,0.4)", icon: "❤️",
    steps: [
      { text: "Interlock hands — center of chest", arrow: "down" },
      { text: "Push hard and fast — 2 inches deep, 100 per minute", arrow: "down" },
      { text: "30 compressions then tilt head back", arrow: "up" },
      { text: "Pinch nose, give 2 rescue breaths", arrow: "up" },
      { text: "Repeat cycle — do not stop", arrow: "down" },
    ]
  },
  bleeding: {
    label: "Bleeding", color: "#f97316", glow: "rgba(249,115,22,0.4)", icon: "🩸",
    steps: [
      { text: "Locate the wound — identify the source", arrow: "right" },
      { text: "Apply firm direct pressure here", arrow: "right" },
      { text: "Tie tourniquet 2 inches above wound", arrow: "down" },
      { text: "Tighten until bleeding stops — note the time", arrow: "down" },
      { text: "Keep elevated — do not remove", arrow: "up" },
    ]
  },
  choking: {
    label: "Choking", color: "#a855f7", glow: "rgba(168,85,247,0.4)", icon: "🫁",
    steps: [
      { text: "Confirm choking — can they speak?", arrow: "up" },
      { text: "Stand behind — wrap arms around waist", arrow: "down" },
      { text: "Make fist — place just above navel", arrow: "right" },
      { text: "Sharp inward and upward thrust — 5 times", arrow: "right" },
      { text: "Repeat until object is dislodged", arrow: "right" },
    ]
  },
  unconscious: {
    label: "Unconscious", color: "#06b6d4", glow: "rgba(6,182,212,0.4)", icon: "🧠",
    steps: [
      { text: "Check response — tap shoulders and shout", arrow: "down" },
      { text: "Check breathing — look, listen, feel", arrow: "down" },
      { text: "Recovery position — roll onto side", arrow: "right" },
      { text: "Tilt head back — open the airway", arrow: "up" },
      { text: "Monitor breathing until help arrives", arrow: "down" },
    ]
  }
};

function AROverlay({ emergency, step }) {
  const e = EMERGENCIES[emergency];
  const s = e.steps[step];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [step, emergency]);

  const arrowSymbols = { down: "↓", up: "↑", right: "→" };

  return (
    <div style={{
      position: "relative", background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(12px)", border: `1px solid ${e.color}`,
      borderRadius: "16px", padding: "24px", marginBottom: "16px",
      opacity: visible ? 1 : 0, transition: "opacity 0.3s ease",
      boxShadow: `0 0 32px ${e.glow}`,
    }}>
      {[
        { top: 8, left: 8, borderTop: `2px solid ${e.color}`, borderLeft: `2px solid ${e.color}` },
        { top: 8, right: 8, borderTop: `2px solid ${e.color}`, borderRight: `2px solid ${e.color}` },
        { bottom: 8, left: 8, borderBottom: `2px solid ${e.color}`, borderLeft: `2px solid ${e.color}` },
        { bottom: 8, right: 8, borderBottom: `2px solid ${e.color}`, borderRight: `2px solid ${e.color}` },
      ].map((style, i) => (
        <div key={i} style={{ position: "absolute", width: 20, height: 20, ...style, opacity: 0.7 }} />
      ))}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: `${e.color}22`, border: `1px solid ${e.color}66`,
        borderRadius: "50px", padding: "4px 14px", fontSize: "11px",
        letterSpacing: "2px", color: e.color, fontFamily: "monospace",
        textTransform: "uppercase", marginBottom: "20px",
      }}>
        ⬡ AR GUIDE · {e.label.toUpperCase()}
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%", background: e.color,
          flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", fontWeight: "700", color: "#000",
          boxShadow: `0 0 16px ${e.glow}`, fontFamily: "monospace",
        }}>
          {step + 1}
        </div>
        <div>
          <div style={{
            color: "#fff", fontSize: "20px", fontWeight: "300",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            lineHeight: 1.4, marginBottom: "8px",
          }}>
            {s.text}
          </div>
          <div style={{ fontSize: "13px", color: `${e.color}cc`, fontFamily: "monospace", letterSpacing: "1px" }}>
            {arrowSymbols[s.arrow]} FOCUS AREA · STEP {step + 1} OF {e.steps.length}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "6px", marginTop: "20px" }}>
        {e.steps.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: "2px",
            background: i <= step ? e.color : "rgba(255,255,255,0.1)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
    </div>
  );
}

function CallingScreen({ countdown, onCancel, onAnswered }) {
  const progress = (countdown / CALL_TIMEOUT_SECONDS) * 100;
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "55vh", textAlign: "center",
    }}>
      <div style={{ position: "relative", marginBottom: "36px" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            width: 100 + i * 40, height: 100 + i * 40,
            borderRadius: "50%", border: "1.5px solid rgba(14,165,233,0.3)",
            transform: "translate(-50%, -50%)",
            animation: "ringPulse 2s ease-out infinite",
            animationDelay: `${i * 0.5}s`,
          }} />
        ))}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "40px", boxShadow: "0 0 40px rgba(14,165,233,0.4)",
          position: "relative", zIndex: 1,
        }}>🏥</div>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "28px", fontWeight: "300", marginBottom: "8px" }}>
        Calling Emergency Nurse...
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "2px", marginBottom: "32px" }}>
        CONNECTING TO MEDICAL TEAM
      </div>
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: "16px" }}>
        <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="#0ea5e9" strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: "22px", fontWeight: "300", fontFamily: "monospace", color: "#0ea5e9",
        }}>
          {countdown}
        </div>
      </div>
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "32px" }}>
        {countdown > 0 ? "If no answer, AI assistant activates automatically" : "No answer — switching to AI assistant..."}
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button onClick={onAnswered} style={{
          padding: "12px 28px", background: "rgba(74,222,128,0.15)",
          border: "1px solid rgba(74,222,128,0.4)", borderRadius: "50px", color: "#4ade80",
          fontFamily: "monospace", fontSize: "12px", letterSpacing: "1px", cursor: "pointer",
        }}>✓ SIMULATE ANSWER</button>
        <button onClick={onCancel} style={{
          padding: "12px 28px", background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)", borderRadius: "50px", color: "#f87171",
          fontFamily: "monospace", fontSize: "12px", letterSpacing: "1px", cursor: "pointer",
        }}>✕ CANCEL CALL</button>
      </div>
      <style>{`
        @keyframes ringPulse {
          0% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function NurseConnectedScreen({ onEndCall }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "55vh", textAlign: "center" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)",
        color: "#4ade80", padding: "8px 20px", borderRadius: "50px",
        fontSize: "12px", marginBottom: "32px", letterSpacing: "2px", fontFamily: "monospace",
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", animation: "pulse 1s infinite", display: "inline-block" }} />
        NURSE CONNECTED — {fmt(elapsed)}
      </div>
      <div style={{
        width: 120, height: 120, borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(74,222,128,0.2), rgba(74,222,128,0.05))",
        border: "2px solid rgba(74,222,128,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "52px", marginBottom: "24px", boxShadow: "0 0 40px rgba(74,222,128,0.2)",
      }}>👩‍⚕️</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "26px", fontWeight: "300", marginBottom: "8px" }}>
        Nurse Priya — Emergency Unit
      </div>
      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "40px" }}>
        CITY GENERAL HOSPITAL · ONLINE
      </div>
      <button onClick={onEndCall} style={{
        padding: "14px 40px", background: "rgba(239,68,68,0.15)",
        border: "1px solid rgba(239,68,68,0.4)", borderRadius: "50px", color: "#f87171",
        fontFamily: "monospace", fontSize: "13px", letterSpacing: "2px", cursor: "pointer",
      }}>END CALL</button>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

export default function ERVideoCall() {
  const navigate = useNavigate();
  const muteRef = useRef(false);
  const countdownRef = useRef(null);

  // ── Step nav voice refs ──────────────────────────────
  const stepNavRef = useRef(null);
  const stepNavRunningRef = useRef(false);
  const activeEmergencyRef = useRef(null); // mirror for use inside async callbacks
  const phaseRef = useRef("idle");         // mirror for use inside async callbacks

  const [phase, setPhase] = useState("idle");
  const [countdown, setCountdown] = useState(CALL_TIMEOUT_SECONDS);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [arStep, setArStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [stepNavListening, setStepNavListening] = useState(false);

  // Keep refs in sync with state (needed inside recognition callbacks)
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { activeEmergencyRef.current = activeEmergency; }, [activeEmergency]);

  const { voiceListening, voiceSOSActive, resetVoiceSOS } = useVoiceSOS({
    enabled: phase === "idle",
    onTriggered: () => { if (phase === "idle") setPhase("calling"); },
  });

  const { alertSent, alertId, responders, sending, sendCommunityAlert, cancelAlert } = useCommunityAlert();

  // ── Start/stop step nav based on phase + activeEmergency ──
  useEffect(() => {
    if (phase === "assistant" && activeEmergency) {
      startStepNavListening();
    } else {
      stopStepNav();
    }
    return () => stopStepNav();
  }, [phase, activeEmergency]);

  // ── Countdown ────────────────────────────────────────
  useEffect(() => {
    if (phase === "calling") {
      setCountdown(CALL_TIMEOUT_SECONDS);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            setPhase("assistant");
            speakText("No answer from medical team. Activating AI emergency assistant. Please select the type of emergency.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownRef.current);
  }, [phase]);

  // ── TTS ──────────────────────────────────────────────
  function speakText(text, onEnd) {
    if (muteRef.current) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.88; utter.pitch = 1; utter.volume = 1;
    if (onEnd) utter.onend = onEnd;
    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes("Google UK English Female") ||
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.lang === "en-GB"
      );
      if (preferred) utter.voice = preferred;
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length > 0) trySpeak();
    else window.speechSynthesis.onvoiceschanged = trySpeak;
  }

  function toggleMute() {
    muteRef.current = !muteRef.current;
    setMuted(muteRef.current);
    if (muteRef.current) window.speechSynthesis.cancel();
  }

  // ── Voice step navigation ────────────────────────────
  function stopStepNav() {
    stepNavRunningRef.current = false;
    setStepNavListening(false);
    try { stepNavRef.current?.abort(); } catch (e) {}
    stepNavRef.current = null;
  }

  function startStepNavListening() {
    if (stepNavRunningRef.current) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    try {
      const recognition = new SR();
      stepNavRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 5;

      recognition.onstart = () => {
        stepNavRunningRef.current = true;
        setStepNavListening(true);
        console.log("[StepNav] 🎤 Listening for step commands...");
      };

      recognition.onresult = (event) => {
        const transcripts = Array.from(event.results)
          .flatMap(r => Array.from(r))
          .map(a => a.transcript.toLowerCase().trim());
        console.log("[StepNav] Heard:", transcripts);
        const text = transcripts.join(" ");

        const isNext = /\b(next|done|continue|forward|go|okay|ok|proceed|step)\b/.test(text);
        const isPrev = /\b(back|previous|before|undo|go back|last)\b/.test(text);

        const emergency = activeEmergencyRef.current;
        if (!emergency) return;
        const maxStep = EMERGENCIES[emergency].steps.length - 1;

        if (isNext) {
          setArStep(s => {
            const next = Math.min(s + 1, maxStep);
            // Speak after a tiny delay so state has settled
            setTimeout(() => {
              speakText(`Step ${next + 1}. ${EMERGENCIES[emergency].steps[next].text}`);
            }, 100);
            return next;
          });
        } else if (isPrev) {
          setArStep(s => {
            const prev = Math.max(s - 1, 0);
            setTimeout(() => {
              speakText(`Step ${prev + 1}. ${EMERGENCIES[emergency].steps[prev].text}`);
            }, 100);
            return prev;
          });
        }
      };

      recognition.onerror = (ev) => {
        console.warn("[StepNav] Error:", ev.error);
        stepNavRunningRef.current = false;
        setStepNavListening(false);
        if (ev.error === "aborted" || ev.error === "not-allowed") return;
        if (phaseRef.current === "assistant" && activeEmergencyRef.current) {
          setTimeout(startStepNavListening, 800);
        }
      };

      recognition.onend = () => {
        stepNavRunningRef.current = false;
        setStepNavListening(false);
        // Keep restarting while assistant is active with an emergency selected
        if (phaseRef.current === "assistant" && activeEmergencyRef.current) {
          setTimeout(startStepNavListening, 400);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("[StepNav] Failed to start:", e);
      stepNavRunningRef.current = false;
      if (phaseRef.current === "assistant" && activeEmergencyRef.current) {
        setTimeout(startStepNavListening, 1000);
      }
    }
  }

  // ── Emergency selection ──────────────────────────────
  function selectEmergency(key) {
    setActiveEmergency(key);
    setArStep(0);
    // Speak first step after short delay
    setTimeout(() => {
      speakText(`${EMERGENCIES[key].label} protocol. Step 1. ${EMERGENCIES[key].steps[0].text}`);
    }, 300);
  }

  // Speak step on arrow navigation
  useEffect(() => {
    if (phase === "assistant" && activeEmergency) {
      const stepData = EMERGENCIES[activeEmergency].steps[arStep];
      speakText(`Step ${arStep + 1}. ${stepData.text}`);
    }
  }, [arStep]);

  useEffect(() => {
    if (phase === "idle") {
      window.speechSynthesis.cancel();
      stopStepNav();
    }
  }, [phase]);

  // ── Controls ─────────────────────────────────────────
  function cancelCall() {
    clearInterval(countdownRef.current);
    setPhase("idle");
  }

  function nurseAnswered() {
    clearInterval(countdownRef.current);
    setPhase("nurse_connected");
  }

  function endNurseCall() { setPhase("idle"); }

  function endSession() {
    clearInterval(countdownRef.current);
    window.speechSynthesis.cancel();
    stopStepNav();
    setPhase("idle");
    setAmbulanceDispatched(false);
    setActiveEmergency(null);
    setArStep(0);
  }

  async function dispatchAmbulance() {
    setDispatching(true);
    speakText("Dispatching ambulance to your location. Help is on the way.");
    await new Promise(res => setTimeout(res, 2000));
    setDispatching(false);
    setAmbulanceDispatched(true);
  }

  function nextStep() { setArStep(s => Math.min(s + 1, EMERGENCIES[activeEmergency].steps.length - 1)); }
  function prevStep() { setArStep(s => Math.max(s - 1, 0)); }

  const e = activeEmergency ? EMERGENCIES[activeEmergency] : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      padding: "40px 80px", maxWidth: "1400px", margin: "0 auto",
      fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#fff",
    }}>
      <VoiceSOSBanner active={voiceSOSActive} onDismiss={resetVoiceSOS} />

      <button onClick={() => navigate("/sos")} style={{
        background: "none", border: "1px solid rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.5)", padding: "8px 20px",
        borderRadius: "50px", cursor: "pointer", fontSize: "14px",
        marginBottom: "36px", fontFamily: "inherit",
      }}>← Back</button>

      <h1 style={{ fontSize: "52px", fontWeight: "300", letterSpacing: "-1px", marginBottom: "6px" }}>
        🏥 ER Call
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "17px", marginBottom: "28px", fontWeight: "300" }}>
        Live nurse call · Voice-guided first aid · Ambulance dispatch
      </p>

      {/* ── IDLE ── */}
      {phase === "idle" && (
        <>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontSize: "12px",
            color: voiceListening ? "rgba(99,102,241,0.9)" : "rgba(255,255,255,0.2)",
            fontFamily: "monospace", letterSpacing: "1px",
            marginBottom: "28px", transition: "color 0.3s",
            background: voiceListening ? "rgba(99,102,241,0.1)" : "transparent",
            border: `1px solid ${voiceListening ? "rgba(99,102,241,0.3)" : "transparent"}`,
            borderRadius: "50px", padding: "6px 14px",
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: voiceListening ? "#818cf8" : "rgba(255,255,255,0.2)",
              animation: voiceListening ? "pulse 1s infinite" : "none",
              display: "inline-block", flexShrink: 0,
            }} />
            {voiceListening
              ? 'VOICE ACTIVE — say "Help me" or "SOS" to start call'
              : "VOICE STANDBY — microphone initializing..."}
          </div>

          <div style={{
            background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)",
            borderRadius: "16px", padding: "28px", marginBottom: "28px",
          }}>
            <div style={{ fontSize: "13px", color: "rgba(14,165,233,0.7)", letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "16px" }}>
              ⬡ How It Works
            </div>
            {[
              { step: "1", text: "Connects you to an on-call nurse immediately" },
              { step: "2", text: `If no answer in ${CALL_TIMEOUT_SECONDS}s, AI assistant activates automatically` },
              { step: "3", text: "AI guides you through first aid with voice + AR instructions" },
              { step: "4", text: "Dispatch ambulance and alert nearby community helpers" },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "rgba(14,165,233,0.2)", border: "1px solid rgba(14,165,233,0.4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", color: "#0ea5e9", fontFamily: "monospace", flexShrink: 0,
                }}>{step}</div>
                <div style={{ fontSize: "16px", fontWeight: "300", color: "rgba(255,255,255,0.7)" }}>{text}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setPhase("calling")} style={{
            width: "100%", padding: "18px", background: "#0ea5e9", color: "#000",
            border: "none", borderRadius: "10px", fontSize: "15px",
            fontFamily: "inherit", fontWeight: "500", letterSpacing: "2px",
            textTransform: "uppercase", cursor: "pointer",
            boxShadow: "0 4px 24px rgba(14,165,233,0.35)",
          }}>
            📞 Call Emergency Nurse
          </button>
        </>
      )}

      {/* ── CALLING ── */}
      {phase === "calling" && (
        <CallingScreen countdown={countdown} onCancel={cancelCall} onAnswered={nurseAnswered} />
      )}

      {/* ── NURSE CONNECTED ── */}
      {phase === "nurse_connected" && (
        <NurseConnectedScreen onEndCall={endNurseCall} />
      )}

      {/* ── ASSISTANT ── */}
      {phase === "assistant" && (
        <>
          <div style={{
            background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)",
            borderRadius: "12px", padding: "14px 20px", marginBottom: "20px",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <div>
              <div style={{ fontSize: "13px", color: "#eab308", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "2px" }}>
                NURSE UNAVAILABLE
              </div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: "300" }}>
                AI assistant activated — follow the voice-guided instructions below
              </div>
            </div>
          </div>

          {/* Voice step nav status indicator */}
          {activeEmergency && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontSize: "12px", fontFamily: "monospace", letterSpacing: "1px",
              marginBottom: "16px", padding: "6px 14px", borderRadius: "50px",
              transition: "all 0.3s",
              color: stepNavListening ? "rgba(99,102,241,0.9)" : "rgba(255,255,255,0.2)",
              background: stepNavListening ? "rgba(99,102,241,0.1)" : "transparent",
              border: `1px solid ${stepNavListening ? "rgba(99,102,241,0.3)" : "transparent"}`,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", display: "inline-block", flexShrink: 0,
                background: stepNavListening ? "#818cf8" : "rgba(255,255,255,0.2)",
                animation: stepNavListening ? "pulse 1s infinite" : "none",
              }} />
              {stepNavListening
                ? 'LISTENING — say "next" to navigate steps'
                : "VOICE NAV READY"}
            </div>
          )}

          {/* AR overlay */}
          {activeEmergency && <AROverlay emergency={activeEmergency} step={arStep} />}

          {/* Step controls */}
          {activeEmergency && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", background: "rgba(255,255,255,0.04)", border: `1px solid ${e.color}33`, borderRadius: "12px", padding: "12px 16px" }}>
              <button onClick={prevStep} disabled={arStep === 0} style={{ background: arStep === 0 ? "rgba(255,255,255,0.05)" : e.color, border: "none", borderRadius: "8px", color: arStep === 0 ? "rgba(255,255,255,0.2)" : "#000", width: 36, height: 36, cursor: arStep === 0 ? "default" : "pointer", fontSize: "16px", fontWeight: "bold" }}>‹</button>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "4px" }}>
                  {EMERGENCIES[activeEmergency].steps.map((_, i) => (
                    <div key={i} onClick={() => setArStep(i)} style={{ flex: 1, height: 4, borderRadius: "2px", cursor: "pointer", background: i <= arStep ? e.color : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
                  ))}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px", fontFamily: "monospace", letterSpacing: "1px" }}>
                  STEP {arStep + 1} OF {EMERGENCIES[activeEmergency].steps.length} · {e.label.toUpperCase()}
                </div>
              </div>
              <button onClick={nextStep} disabled={arStep === EMERGENCIES[activeEmergency].steps.length - 1} style={{ background: arStep === EMERGENCIES[activeEmergency].steps.length - 1 ? "rgba(255,255,255,0.05)" : e.color, border: "none", borderRadius: "8px", color: arStep === EMERGENCIES[activeEmergency].steps.length - 1 ? "rgba(255,255,255,0.2)" : "#000", width: 36, height: 36, cursor: arStep === EMERGENCIES[activeEmergency].steps.length - 1 ? "default" : "pointer", fontSize: "16px", fontWeight: "bold" }}>›</button>
              <button onClick={toggleMute} style={{ background: muted ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${muted ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: "8px", color: muted ? "#f87171" : "rgba(255,255,255,0.6)", padding: "0 14px", height: 36, cursor: "pointer", fontSize: "16px", transition: "all 0.2s" }}>
                {muted ? "🔇" : "🔊"}
              </button>
              <button onClick={() => { stopStepNav(); setActiveEmergency(null); setArStep(0); }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "rgba(255,255,255,0.5)", padding: "0 14px", height: 36, cursor: "pointer", fontSize: "12px", fontFamily: "monospace", letterSpacing: "1px" }}>
                ✕ CLOSE
              </button>
            </div>
          )}

          {/* Emergency selector */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "10px" }}>
              ⬡ SELECT EMERGENCY TYPE
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.entries(EMERGENCIES).map(([key, val]) => (
                <button key={key} onClick={() => selectEmergency(key)} style={{ flex: 1, minWidth: "120px", padding: "12px 10px", background: activeEmergency === key ? `linear-gradient(135deg, ${val.color}33, ${val.color}15)` : "rgba(255,255,255,0.04)", border: `1px solid ${activeEmergency === key ? val.color : "rgba(255,255,255,0.1)"}`, borderRadius: "10px", color: activeEmergency === key ? val.color : "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "inherit", fontSize: "14px", fontWeight: "300", boxShadow: activeEmergency === key ? `0 0 16px ${val.glow}` : "none", transition: "all 0.2s" }}>
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{val.icon}</div>
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Community alert */}
          <CommunityAlertPanel
            emergencyType={activeEmergency || "Medical Emergency"}
            alertSent={alertSent} alertId={alertId}
            responders={responders} sending={sending}
            onSend={() => sendCommunityAlert({ emergencyType: activeEmergency || "Medical Emergency" })}
            onCancel={cancelAlert}
          />

          {ambulanceDispatched && (
            <div style={{ background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.3)", borderRadius: "10px", padding: "16px 20px", marginBottom: "14px", color: "#4ade80", fontSize: "15px", fontWeight: "300" }}>
              🚑 Ambulance dispatched — help is on the way.
            </div>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            {!ambulanceDispatched && (
              <button onClick={dispatchAmbulance} disabled={dispatching} style={{ flex: 1, padding: "16px", background: dispatching ? "rgba(239,68,68,0.3)" : "#ef4444", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", fontWeight: "500", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 4px 20px rgba(239,68,68,0.3)" }}>
                {dispatching ? "Notifying..." : "🚑 Dispatch Ambulance"}
              </button>
            )}
            <button onClick={endSession} style={{ flex: ambulanceDispatched ? 1 : 0, padding: "16px 28px", background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase" }}>
              End Session
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
      `}</style>
    </div>
  );
}