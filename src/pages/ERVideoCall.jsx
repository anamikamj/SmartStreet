import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EMERGENCIES = {
  cpr: {
    label: "CPR",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.4)",
    icon: "❤️",
    steps: [
      { text: "Interlock hands — center of chest", target: { top: "38%", left: "50%", size: 70 }, arrow: "down" },
      { text: "Push hard and fast — 2 inches deep, 100 per minute", target: { top: "38%", left: "50%", size: 70 }, arrow: "down" },
      { text: "30 compressions then tilt head back", target: { top: "18%", left: "50%", size: 50 }, arrow: "up" },
      { text: "Pinch nose, give 2 rescue breaths", target: { top: "14%", left: "50%", size: 45 }, arrow: "up" },
      { text: "Repeat cycle — do not stop", target: { top: "38%", left: "50%", size: 70 }, arrow: "down" },
    ]
  },
  bleeding: {
    label: "Bleeding",
    color: "#f97316",
    glow: "rgba(249,115,22,0.4)",
    icon: "🩸",
    steps: [
      { text: "Locate the wound — identify the source", target: { top: "55%", left: "35%", size: 60 }, arrow: "right" },
      { text: "Apply firm direct pressure here", target: { top: "55%", left: "35%", size: 60 }, arrow: "right" },
      { text: "Tie tourniquet 2 inches above wound", target: { top: "42%", left: "28%", size: 55 }, arrow: "down" },
      { text: "Tighten until bleeding stops — note the time", target: { top: "42%", left: "28%", size: 55 }, arrow: "down" },
      { text: "Keep elevated — do not remove", target: { top: "55%", left: "35%", size: 60 }, arrow: "up" },
    ]
  },
  choking: {
    label: "Choking",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.4)",
    icon: "🫁",
    steps: [
      { text: "Confirm choking — can they speak?", target: { top: "14%", left: "50%", size: 50 }, arrow: "up" },
      { text: "Stand behind — wrap arms around waist", target: { top: "48%", left: "50%", size: 65 }, arrow: "down" },
      { text: "Make fist — place just above navel", target: { top: "44%", left: "50%", size: 55 }, arrow: "right" },
      { text: "Sharp inward and upward thrust — 5 times", target: { top: "44%", left: "50%", size: 55 }, arrow: "right" },
      { text: "Repeat until object is dislodged", target: { top: "44%", left: "50%", size: 55 }, arrow: "right" },
    ]
  },
  unconscious: {
    label: "Unconscious",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.4)",
    icon: "🧠",
    steps: [
      { text: "Check response — tap shoulders and shout", target: { top: "20%", left: "50%", size: 55 }, arrow: "down" },
      { text: "Check breathing — look, listen, feel", target: { top: "26%", left: "50%", size: 45 }, arrow: "down" },
      { text: "Recovery position — roll onto side", target: { top: "50%", left: "50%", size: 80 }, arrow: "right" },
      { text: "Tilt head back — open the airway", target: { top: "18%", left: "50%", size: 48 }, arrow: "up" },
      { text: "Monitor breathing until help arrives", target: { top: "35%", left: "50%", size: 65 }, arrow: "down" },
    ]
  }
};

// Voice triage questions per emergency
const TRIAGE = {
  unconscious: {
    question: "Is the person breathing?",
    yesAction: { text: "Place in recovery position — roll onto their side and monitor breathing.", jumpTo: 2 },
    noAction:  { text: "Not breathing — starting CPR protocol immediately.", switchTo: "cpr" },
  },
  cpr: {
    question: "Do you have someone to help you?",
    yesAction: { text: "Good — one person does compressions, the other gives rescue breaths." },
    noAction:  { text: "You are alone — focus only on chest compressions, no rescue breaths needed." },
  },
  bleeding: {
    question: "Is the bleeding slowing down with pressure?",
    yesAction: { text: "Good — maintain pressure. Do not lift the cloth." },
    noAction:  { text: "Bleeding not slowing — apply tourniquet immediately above the wound." },
  },
  choking: {
    question: "Is the person conscious?",
    yesAction: { text: "Conscious — perform abdominal thrusts immediately." },
    noAction:  { text: "Unconscious — lay them down and begin CPR. The thrust may dislodge the object.", switchTo: "cpr" },
  },
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
      position: "relative",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(12px)",
      border: `1px solid ${e.color}`,
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "16px",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.3s ease",
      boxShadow: `0 0 32px ${e.glow}`,
    }}>
      {/* Corner brackets */}
      {[
        { top: 8, left: 8, borderTop: `2px solid ${e.color}`, borderLeft: `2px solid ${e.color}` },
        { top: 8, right: 8, borderTop: `2px solid ${e.color}`, borderRight: `2px solid ${e.color}` },
        { bottom: 8, left: 8, borderBottom: `2px solid ${e.color}`, borderLeft: `2px solid ${e.color}` },
        { bottom: 8, right: 8, borderBottom: `2px solid ${e.color}`, borderRight: `2px solid ${e.color}` },
      ].map((style, i) => (
        <div key={i} style={{ position: "absolute", width: 20, height: 20, ...style, opacity: 0.7 }} />
      ))}

      {/* Top label */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        background: `${e.color}22`, border: `1px solid ${e.color}66`,
        borderRadius: "50px", padding: "4px 14px",
        fontSize: "11px", letterSpacing: "2px",
        color: e.color, fontFamily: "monospace", textTransform: "uppercase",
        marginBottom: "20px",
      }}>
        ⬡ AR GUIDE · {e.label.toUpperCase()}
      </div>

      {/* Step indicator + text */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: e.color, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", fontWeight: "700", color: "#000",
          boxShadow: `0 0 16px ${e.glow}`,
          fontFamily: "monospace",
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
          <div style={{
            fontSize: "13px", color: `${e.color}cc`,
            fontFamily: "monospace", letterSpacing: "1px",
          }}>
            {arrowSymbols[s.arrow]} FOCUS AREA · STEP {step + 1} OF {e.steps.length}
          </div>
        </div>
      </div>

      {/* Progress dots */}
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

export default function ERVideoCall() {
  const navigate = useNavigate();
  const muteRef = useRef(false);
  const recognitionRef = useRef(null);

  const [sessionActive, setSessionActive] = useState(false);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [arStep, setArStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const [triageState, setTriageState] = useState(null); // null | "asking" | "answered"
  const [triageAnswer, setTriageAnswer] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // ── TTS ──────────────────────────────────────────────
  function speak(text, onEnd) {
    if (muteRef.current) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.88;
    utter.pitch = 1;
    utter.volume = 1;
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

  // ── Speech Recognition ────────────────────────────────
  function startListening(onResult) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    setListening(true);

    recognition.onresult = (event) => {
      setListening(false);
      const transcript = Array.from(event.results[0])
        .map(r => r.transcript.toLowerCase()).join(" ");
      onResult(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  // ── Triage voice flow ─────────────────────────────────
  function askTriageQuestion(emergencyKey) {
    const triage = TRIAGE[emergencyKey];
    if (!triage) return;
    setTriageState("asking");
    setTriageAnswer(null);

    speak(triage.question, () => {
      // After question is spoken, start listening
      startListening((transcript) => {
        const isYes = /yes|yeah|yep|yup|correct|he is|she is|they are|breathing/.test(transcript);
        const isNo  = /no|not|nope|isn't|not breathing|they aren't|he isn't|she isn't/.test(transcript);

        if (isYes) {
          setTriageAnswer("yes");
          setTriageState("answered");
          speak(triage.yesAction.text);
          if (triage.yesAction.jumpTo !== undefined) setArStep(triage.yesAction.jumpTo);
        } else if (isNo) {
          setTriageAnswer("no");
          setTriageState("answered");
          speak(triage.noAction.text);
          if (triage.noAction.switchTo) {
            // Switch emergency protocol
            setTimeout(() => {
              setActiveEmergency(triage.noAction.switchTo);
              setArStep(0);
              setTriageState(null);
            }, 3000);
          }
        } else {
          // Didn't understand — ask again
          setTriageState(null);
          speak("Sorry, I didn't catch that. Please answer yes or no.", () => {
            askTriageQuestion(emergencyKey);
          });
        }
      });
    });
  }

  // ── Emergency selection ───────────────────────────────
  function selectEmergency(key) {
    setActiveEmergency(key);
    setArStep(0);
    setTriageState(null);
    setTriageAnswer(null);
    const em = EMERGENCIES[key];
    speak(`${em.label} protocol activated.`, () => {
      // Ask triage question after announcement
      setTimeout(() => askTriageQuestion(key), 500);
    });
  }

  // Speak step when manually navigating
  useEffect(() => {
    if (sessionActive && activeEmergency && triageState !== "asking") {
      const stepData = EMERGENCIES[activeEmergency].steps[arStep];
      speak(`Step ${arStep + 1}. ${stepData.text}`);
    }
  }, [arStep]);

  useEffect(() => {
    if (!sessionActive) window.speechSynthesis.cancel();
  }, [sessionActive]);

  // ── Session controls ──────────────────────────────────
  function startSession() {
    setSessionActive(true);
    speak("Emergency assistant activated. Please select the type of emergency.");
  }

  function endSession() {
    window.speechSynthesis.cancel();
    stopListening();
    setSessionActive(false);
    setAmbulanceDispatched(false);
    setActiveEmergency(null);
    setArStep(0);
    setTriageState(null);
    setTriageAnswer(null);
  }

  async function dispatchAmbulance() {
    setDispatching(true);
    speak("Dispatching ambulance to your location. Help is on the way.");
    await new Promise((res) => setTimeout(res, 2000));
    setDispatching(false);
    setAmbulanceDispatched(true);
  }

  function nextStep() {
    const max = EMERGENCIES[activeEmergency].steps.length - 1;
    setArStep((s) => Math.min(s + 1, max));
  }

  function prevStep() {
    setArStep((s) => Math.max(s - 1, 0));
  }

  const e = activeEmergency ? EMERGENCIES[activeEmergency] : null;
  const triage = activeEmergency ? TRIAGE[activeEmergency] : null;

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      padding: "40px 80px", maxWidth: "1400px", margin: "0 auto",
      fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#fff",
    }}>
      <button onClick={() => navigate("/sos")} style={{
        background: "none", border: "1px solid rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.5)", padding: "8px 20px",
        borderRadius: "50px", cursor: "pointer", fontSize: "14px",
        marginBottom: "36px", fontFamily: "inherit",
      }}>
        ← Back
      </button>

      <h1 style={{ fontSize: "52px", fontWeight: "300", letterSpacing: "-1px", marginBottom: "6px" }}>
        🏥 Emergency Assistant
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "17px", marginBottom: "28px", fontWeight: "300" }}>
        Voice-guided first aid · AR instructions · Ambulance dispatch
      </p>

      {/* Session active badge */}
      {sessionActive && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(0,200,100,0.1)", border: "1px solid rgba(0,200,100,0.3)",
          color: "#4ade80", padding: "7px 18px", borderRadius: "50px",
          fontSize: "12px", marginBottom: "24px", letterSpacing: "2px",
          fontFamily: "monospace",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#4ade80", animation: "pulse 1.2s infinite", display: "inline-block"
          }} />
          ASSISTANT ACTIVE
        </div>
      )}

      {/* Triage voice interaction box */}
      {sessionActive && activeEmergency && triageState && (
        <div style={{
          background: listening
            ? "rgba(99,102,241,0.12)"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${listening ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "16px",
          transition: "all 0.3s",
          boxShadow: listening ? "0 0 32px rgba(99,102,241,0.2)" : "none",
        }}>
          <div style={{
            fontSize: "11px", color: "rgba(255,255,255,0.3)",
            letterSpacing: "2px", fontFamily: "monospace",
            textTransform: "uppercase", marginBottom: "12px",
          }}>
            ⬡ VOICE TRIAGE
          </div>

          {triageState === "asking" && (
            <>
              <div style={{
                fontSize: "22px", fontWeight: "300", marginBottom: "16px", lineHeight: 1.4,
              }}>
                {triage?.question}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                color: listening ? "#818cf8" : "rgba(255,255,255,0.3)",
                fontSize: "14px", fontFamily: "monospace", letterSpacing: "1px",
              }}>
                {listening ? (
                  <>
                    <span style={{
                      display: "inline-block", width: 10, height: 10,
                      borderRadius: "50%", background: "#818cf8",
                      animation: "pulse 0.8s infinite",
                    }} />
                    LISTENING — say YES or NO
                  </>
                ) : (
                  <>🔊 Speaking question...</>
                )}
              </div>
            </>
          )}

          {triageState === "answered" && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: triageAnswer === "yes"
                  ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)",
                border: `1px solid ${triageAnswer === "yes" ? "#4ade80" : "#f87171"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px",
              }}>
                {triageAnswer === "yes" ? "✓" : "✗"}
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "1px", marginBottom: "4px" }}>
                  YOUR ANSWER: {triageAnswer?.toUpperCase()}
                </div>
                <div style={{ fontSize: "16px", fontWeight: "300", color: triageAnswer === "yes" ? "#4ade80" : "#f87171" }}>
                  {triageAnswer === "yes" ? triage?.yesAction.text : triage?.noAction.text}
                </div>
              </div>
            </div>
          )}

          {/* Manual Yes/No buttons as fallback */}
          {triageState === "asking" && (
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => {
                stopListening();
                setTriageAnswer("yes");
                setTriageState("answered");
                speak(triage.yesAction.text);
                if (triage.yesAction.jumpTo !== undefined) setArStep(triage.yesAction.jumpTo);
              }} style={{
                flex: 1, padding: "12px",
                background: "rgba(74,222,128,0.1)",
                border: "1px solid rgba(74,222,128,0.3)",
                borderRadius: "10px", color: "#4ade80",
                fontFamily: "inherit", fontSize: "16px", cursor: "pointer",
              }}>
                ✓ Yes
              </button>
              <button onClick={() => {
                stopListening();
                setTriageAnswer("no");
                setTriageState("answered");
                speak(triage.noAction.text);
                if (triage.noAction.switchTo) {
                  setTimeout(() => {
                    setActiveEmergency(triage.noAction.switchTo);
                    setArStep(0);
                    setTriageState(null);
                  }, 3000);
                }
              }} style={{
                flex: 1, padding: "12px",
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "10px", color: "#f87171",
                fontFamily: "inherit", fontSize: "16px", cursor: "pointer",
              }}>
                ✗ No
              </button>
            </div>
          )}
        </div>
      )}

      {/* AR instruction overlay */}
      {sessionActive && activeEmergency && (
        <AROverlay emergency={activeEmergency} step={arStep} />
      )}

      {/* Step controls */}
      {sessionActive && activeEmergency && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          marginBottom: "16px",
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${e.color}33`,
          borderRadius: "12px", padding: "12px 16px",
        }}>
          <button onClick={prevStep} disabled={arStep === 0} style={{
            background: arStep === 0 ? "rgba(255,255,255,0.05)" : e.color,
            border: "none", borderRadius: "8px",
            color: arStep === 0 ? "rgba(255,255,255,0.2)" : "#000",
            width: 36, height: 36, cursor: arStep === 0 ? "default" : "pointer",
            fontSize: "16px", fontWeight: "bold",
          }}>‹</button>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {EMERGENCIES[activeEmergency].steps.map((_, i) => (
                <div key={i} onClick={() => setArStep(i)} style={{
                  flex: 1, height: 4, borderRadius: "2px", cursor: "pointer",
                  background: i <= arStep ? e.color : "rgba(255,255,255,0.1)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <div style={{
              fontSize: "12px", color: "rgba(255,255,255,0.4)",
              marginTop: "6px", fontFamily: "monospace", letterSpacing: "1px"
            }}>
              STEP {arStep + 1} OF {EMERGENCIES[activeEmergency].steps.length} · {e.label.toUpperCase()}
            </div>
          </div>

          <button onClick={nextStep} disabled={arStep === EMERGENCIES[activeEmergency].steps.length - 1} style={{
            background: arStep === EMERGENCIES[activeEmergency].steps.length - 1
              ? "rgba(255,255,255,0.05)" : e.color,
            border: "none", borderRadius: "8px",
            color: arStep === EMERGENCIES[activeEmergency].steps.length - 1
              ? "rgba(255,255,255,0.2)" : "#000",
            width: 36, height: 36,
            cursor: arStep === EMERGENCIES[activeEmergency].steps.length - 1 ? "default" : "pointer",
            fontSize: "16px", fontWeight: "bold",
          }}>›</button>

          {/* Mute toggle */}
          <button onClick={toggleMute} style={{
            background: muted ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${muted ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "8px", color: muted ? "#f87171" : "rgba(255,255,255,0.6)",
            padding: "0 14px", height: 36, cursor: "pointer",
            fontSize: "16px", transition: "all 0.2s",
          }}>
            {muted ? "🔇" : "🔊"}
          </button>

          <button onClick={() => { setActiveEmergency(null); setArStep(0); setTriageState(null); }} style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px", color: "rgba(255,255,255,0.5)",
            padding: "0 14px", height: 36, cursor: "pointer",
            fontSize: "12px", fontFamily: "monospace", letterSpacing: "1px",
          }}>
            ✕ CLOSE
          </button>
        </div>
      )}

      {/* Emergency type selector */}
      {sessionActive && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{
            fontSize: "11px", color: "rgba(255,255,255,0.3)",
            letterSpacing: "2px", textTransform: "uppercase",
            fontFamily: "monospace", marginBottom: "10px",
          }}>
            ⬡ SELECT EMERGENCY TYPE
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {Object.entries(EMERGENCIES).map(([key, val]) => (
              <button key={key} onClick={() => selectEmergency(key)} style={{
                flex: 1, minWidth: "120px", padding: "12px 10px",
                background: activeEmergency === key
                  ? `linear-gradient(135deg, ${val.color}33, ${val.color}15)`
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeEmergency === key ? val.color : "rgba(255,255,255,0.1)"}`,
                borderRadius: "10px",
                color: activeEmergency === key ? val.color : "rgba(255,255,255,0.6)",
                cursor: "pointer", fontFamily: "inherit", fontSize: "14px",
                fontWeight: "300", letterSpacing: "0.3px",
                boxShadow: activeEmergency === key ? `0 0 16px ${val.glow}` : "none",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: "20px", marginBottom: "4px" }}>{val.icon}</div>
                {val.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ambulance dispatched */}
      {ambulanceDispatched && (
        <div style={{
          background: "rgba(0,200,100,0.08)", border: "1px solid rgba(0,200,100,0.3)",
          borderRadius: "10px", padding: "16px 20px", marginBottom: "14px",
          color: "#4ade80", fontSize: "15px", fontWeight: "300",
        }}>
          🚑 Ambulance dispatched — help is on the way to your location.
        </div>
      )}

      {/* Main controls */}
      {!sessionActive ? (
        <button onClick={startSession} style={{
          width: "100%", padding: "18px", background: "#0ea5e9", color: "#000",
          border: "none", borderRadius: "10px", fontSize: "15px",
          fontFamily: "inherit", fontWeight: "500", letterSpacing: "2px",
          textTransform: "uppercase", cursor: "pointer",
          boxShadow: "0 4px 24px rgba(14,165,233,0.35)",
        }}>
          🚨 Activate Emergency Assistant
        </button>
      ) : (
        <div style={{ display: "flex", gap: "12px" }}>
          {!ambulanceDispatched && (
            <button onClick={dispatchAmbulance} disabled={dispatching} style={{
              flex: 1, padding: "16px",
              background: dispatching ? "rgba(239,68,68,0.3)" : "#ef4444",
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "14px", fontFamily: "inherit", fontWeight: "500",
              letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
            }}>
              {dispatching ? "Notifying..." : "🚑 Dispatch Ambulance"}
            </button>
          )}
          <button onClick={endSession} style={{
            flex: ambulanceDispatched ? 1 : 0,
            padding: "16px 28px",
            background: "transparent", color: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px",
            fontSize: "14px", fontFamily: "inherit", cursor: "pointer",
            letterSpacing: "1px", textTransform: "uppercase",
          }}>
            End Session
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes arPulse { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(1.6);opacity:0} }
      `}</style>
    </div>
  );
}