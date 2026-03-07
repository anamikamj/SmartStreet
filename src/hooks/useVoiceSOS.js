import { useEffect, useRef, useState } from "react";

const TRIGGER_PHRASES = ["help", "help me", "sos", "emergency", "save me", "help us"];

// ── Global singleton — only ONE instance ever runs ──────────────────────────
let globalRecognition = null;
let globalListeners = [];
let isGlobalRunning = false;
let restartTimer = null;
let globalEnabled = false;

function notifyListeners(type, data) {
  globalListeners.forEach(l => l(type, data));
}

function stopGlobal() {
  clearTimeout(restartTimer);
  isGlobalRunning = false;
  try { globalRecognition?.abort(); } catch (e) {}
  globalRecognition = null;
  notifyListeners("listening", false);
}

function startGlobal() {
  if (!globalEnabled) return;
  if (isGlobalRunning) return;

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    console.warn("[VoiceSOS] Not supported");
    return;
  }

  try {
    const recognition = new SR();
    globalRecognition = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      isGlobalRunning = true;
      notifyListeners("listening", true);
      console.log("[VoiceSOS] 🎤 Listening...");
    };

    recognition.onresult = (event) => {
      const transcripts = [];
      for (let i = 0; i < event.results.length; i++) {
        for (let j = 0; j < event.results[i].length; j++) {
          transcripts.push(event.results[i][j].transcript.toLowerCase().trim());
        }
      }
      console.log("[VoiceSOS] Heard:", transcripts);

      const triggered = transcripts.some(t =>
        TRIGGER_PHRASES.some(phrase => t.includes(phrase))
      );

      if (triggered) {
        console.log("[VoiceSOS] ✅ Triggered!");
        notifyListeners("triggered", true);
        stopGlobal();
      }
    };

    recognition.onspeechstart = () => console.log("[VoiceSOS] Speech detected");
    recognition.onnomatch = () => console.log("[VoiceSOS] No match");

    recognition.onerror = (event) => {
      console.warn("[VoiceSOS] Error:", event.error);
      isGlobalRunning = false;
      notifyListeners("listening", false);

      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        console.error("[VoiceSOS] ❌ Mic permission denied");
        globalEnabled = false;
        return;
      }
      if (event.error === "aborted") return;

      scheduleRestart(1000);
    };

    recognition.onend = () => {
      console.log("[VoiceSOS] Session ended");
      isGlobalRunning = false;
      notifyListeners("listening", false);
      if (globalEnabled) scheduleRestart(600);
    };

    recognition.start();
  } catch (e) {
    console.error("[VoiceSOS] Failed to start:", e);
    isGlobalRunning = false;
    scheduleRestart(1500);
  }
}

function scheduleRestart(delay = 800) {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    if (globalEnabled && !isGlobalRunning) startGlobal();
  }, delay);
}
// ─────────────────────────────────────────────────────────────────────────────

export function useVoiceSOS({ onTriggered, enabled = true }) {
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceSOSActive, setVoiceSOSActive] = useState(false);
  const onTriggeredRef = useRef(onTriggered);
  const triggeredRef = useRef(false);

  useEffect(() => { onTriggeredRef.current = onTriggered; }, [onTriggered]);

  useEffect(() => {
    // Register this component as a listener
    function handleEvent(type, data) {
      if (type === "listening") setVoiceListening(data);
      if (type === "triggered" && !triggeredRef.current) {
        triggeredRef.current = true;
        setVoiceSOSActive(true);
        onTriggeredRef.current?.();
      }
    }

    globalListeners.push(handleEvent);

    // Update global enabled state
    globalEnabled = enabled;

    if (enabled) {
      triggeredRef.current = false;
      // Start after short delay to let page settle
      scheduleRestart(800);
    } else {
      // If this component disables, check if any other listener still wants it
      // For simplicity just stop — the active page will re-enable
      globalEnabled = false;
      stopGlobal();
    }

    return () => {
      // Remove this listener on unmount
      globalListeners = globalListeners.filter(l => l !== handleEvent);
      // If no listeners left, stop
      if (globalListeners.length === 0) {
        globalEnabled = false;
        stopGlobal();
      }
    };
  }, [enabled]);

  function resetVoiceSOS() {
    triggeredRef.current = false;
    setVoiceSOSActive(false);
    globalEnabled = true;
    scheduleRestart(500);
  }

  return { voiceListening, voiceSOSActive, resetVoiceSOS };
}
