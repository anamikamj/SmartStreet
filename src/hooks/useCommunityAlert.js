import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseClient";

export function useCommunityAlert() {
  const [alertId, setAlertId] = useState(null);
  const [responders, setResponders] = useState([]);
  const [alertSent, setAlertSent] = useState(false);
  const [sending, setSending] = useState(false);
  const subscriptionRef = useRef(null);

  async function sendCommunityAlert({ emergencyType, userId = "demo-user" }) {
    setSending(true);

    const pos = await new Promise((res) =>
      navigator.geolocation.getCurrentPosition(res, () => res(null))
    );

    const lat = pos?.coords.latitude || 0;
    const lng = pos?.coords.longitude || 0;
    const location = lat ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Unavailable";

    const { data, error } = await supabase
      .from("community_alerts")
      .insert([{
        user_id: userId,
        emergency_type: emergencyType,
        location,
        lat,
        lng,
        status: "active",
      }])
      .select()
      .single();

    setSending(false);
    if (error) { console.error(error); return; }

    setAlertId(data.id);
    setAlertSent(true);

    // ── Fetch ALL existing alerts' responses to demo nearby helpers ──
    await fetchNearbyResponders();

    // ── Then subscribe for any NEW responses on this specific alert ──
    subscribeToResponders(data.id);
  }

  // Fetches existing responses from the seeded demo data
  async function fetchNearbyResponders() {
    const { data, error } = await supabase
      .from("alert_responses")
      .select("responder_name, responder_lat, responder_lng, created_at")
      .order("created_at", { ascending: true });

    if (error) { console.error(error); return; }
    if (data && data.length > 0) {
      // Stagger the appearance for visual effect — 1 per second
      data.forEach((responder, i) => {
        setTimeout(() => {
          setResponders(prev => {
            // Avoid duplicates
            const exists = prev.find(r => r.responder_name === responder.responder_name);
            if (exists) return prev;
            return [...prev, responder];
          });
        }, i * 1000);
      });
    }
  }

  function subscribeToResponders(id) {
    subscriptionRef.current = supabase
      .channel(`alert-${id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "alert_responses",
        filter: `alert_id=eq.${id}`,
      }, (payload) => {
        setResponders(prev => {
          const exists = prev.find(r => r.responder_name === payload.new.responder_name);
          if (exists) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();
  }

  async function respondToAlert(alertId, responderName) {
    const pos = await new Promise((res) =>
      navigator.geolocation.getCurrentPosition(res, () => res(null))
    );
    await supabase.from("alert_responses").insert([{
      alert_id: alertId,
      responder_name: responderName,
      responder_lat: pos?.coords.latitude || 0,
      responder_lng: pos?.coords.longitude || 0,
    }]);
  }

  async function cancelAlert() {
    if (!alertId) return;
    await supabase
      .from("community_alerts")
      .update({ status: "cancelled" })
      .eq("id", alertId);
    subscriptionRef.current?.unsubscribe();
    setAlertSent(false);
    setAlertId(null);
    setResponders([]);
  }

  useEffect(() => {
    return () => subscriptionRef.current?.unsubscribe();
  }, []);

  return {
    alertSent, alertId, responders, sending,
    sendCommunityAlert, cancelAlert, respondToAlert
  };
}