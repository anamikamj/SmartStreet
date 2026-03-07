import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "../services/supabaseClient";

const BLOOD_TYPES = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−", "Unknown"];

export default function EmergencyID() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [step, setStep] = useState("form"); // "form" | "qr"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  const [form, setForm] = useState({ name: "", blood_type: "", medical_notes: "" });
  const [contact, setContact] = useState({ contact_name: "", contact_phone: "", contact_email: "" });

  useEffect(() => {
    async function loadExisting() {
      // Get real auth user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUserId(user.id);

      const { data: userData } = await supabase
        .from("users")
        .select("name, blood_type, medical_notes")
        .eq("id", user.id)
        .maybeSingle();

      if (userData) {
        setForm({
          name: userData.name || "",
          blood_type: userData.blood_type || "",
          medical_notes: userData.medical_notes || "",
        });
      }

      const { data: contactData } = await supabase
        .from("trusted_contacts")
        .select("contact_name, contact_phone, contact_email")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (contactData) {
        setContact(contactData);
        setQrUrl(`${window.location.origin}/emergency-card/${user.id}`);
        setStep("qr");
      }

      setLoading(false);
    }
    loadExisting();
  }, []);

  async function handleSave() {
    if (!form.name || !form.blood_type) {
      alert("Name and blood type are required.");
      return;
    }
    if (!contact.contact_name || !contact.contact_phone) {
      alert("Emergency contact name and phone are required.");
      return;
    }

    setSaving(true);

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    const { error: userError } = existing
      ? await supabase.from("users").update({
          name: form.name,
          blood_type: form.blood_type,
          medical_notes: form.medical_notes,
          updated_at: new Date().toISOString(),
        }).eq("id", userId)
      : await supabase.from("users").insert({
          id: userId,
          name: form.name,
          blood_type: form.blood_type,
          medical_notes: form.medical_notes,
          updated_at: new Date().toISOString(),
        });

    if (userError) {
      alert("Failed to save profile: " + userError.message);
      setSaving(false);
      return;
    }

    const { error: contactError } = await supabase
      .from("trusted_contacts")
      .upsert({
        user_id: userId,
        contact_name: contact.contact_name,
        contact_phone: contact.contact_phone,
        contact_email: contact.contact_email,
      });

    if (contactError) {
      alert("Failed to save contact: " + contactError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setQrUrl(`${window.location.origin}/emergency-card/${userId}`);
    setStep("qr");
  }

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#fff",
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: "16px",
    padding: "14px 16px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "12px",
  };

  const labelStyle = {
    fontSize: "11px",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    fontFamily: "monospace",
    display: "block",
    marginBottom: "6px",
  };

  const sectionStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "16px",
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "2px"
    }}>
      LOADING...
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      padding: "40px 80px", maxWidth: "860px", margin: "0 auto",
      fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#fff",
    }}>
      <button onClick={() => navigate(-1)} style={{
        background: "none", border: "1px solid rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.5)", padding: "8px 20px",
        borderRadius: "50px", cursor: "pointer", fontSize: "14px",
        marginBottom: "36px", fontFamily: "inherit",
      }}>
        ← Back
      </button>

      <h1 style={{ fontSize: "52px", fontWeight: "300", letterSpacing: "-1px", marginBottom: "8px" }}>
        🪪 Emergency ID
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "17px", marginBottom: "36px", fontWeight: "300" }}>
        Your scannable life-saving QR card
      </p>

      {step === "form" && (
        <>
          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "20px" }}>
              ⬡ Medical Information
            </div>

            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} placeholder="e.g. Karen Teddy" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

            <label style={labelStyle}>Blood Type</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.blood_type} onChange={e => setForm({ ...form, blood_type: e.target.value })}>
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>

            <label style={labelStyle}>Medical Notes (allergies, conditions)</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} placeholder="e.g. Allergic to penicillin, diabetic..." value={form.medical_notes} onChange={e => setForm({ ...form, medical_notes: e.target.value })} />
          </div>

          <div style={sectionStyle}>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "20px" }}>
              ⬡ Emergency Contact
            </div>

            <label style={labelStyle}>Contact Name</label>
            <input style={inputStyle} placeholder="e.g. John Vadakkan" value={contact.contact_name} onChange={e => setContact({ ...contact, contact_name: e.target.value })} />

            <label style={labelStyle}>Phone Number</label>
            <input style={inputStyle} placeholder="e.g. +91 98765 43210" value={contact.contact_phone} onChange={e => setContact({ ...contact, contact_phone: e.target.value })} />

            <label style={labelStyle}>Email (optional)</label>
            <input style={inputStyle} placeholder="e.g. john@email.com" value={contact.contact_email} onChange={e => setContact({ ...contact, contact_email: e.target.value })} />
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            width: "100%", padding: "18px",
            background: saving ? "rgba(99,102,241,0.3)" : "#6366f1",
            color: "#fff", border: "none", borderRadius: "10px",
            fontSize: "15px", fontFamily: "inherit", fontWeight: "500",
            letterSpacing: "2px", textTransform: "uppercase",
            cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
          }}>
            {saving ? "Saving..." : "Generate QR Code →"}
          </button>
        </>
      )}

      {step === "qr" && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "#fff", borderRadius: "20px", padding: "32px",
            display: "inline-block", marginBottom: "28px",
            boxShadow: "0 0 60px rgba(99,102,241,0.3)",
          }}>
            <QRCodeSVG value={qrUrl} size={220} bgColor="#ffffff" fgColor="#0a0a0a" level="H" />
            <div style={{ marginTop: "16px", fontFamily: "monospace", fontSize: "11px", color: "#666", letterSpacing: "1px" }}>
              SMARTSTREET · EMERGENCY ID
            </div>
          </div>

          <div style={{
            background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: "16px", padding: "24px", marginBottom: "20px", textAlign: "left",
          }}>
            <div style={{ fontSize: "13px", color: "rgba(99,102,241,0.8)", letterSpacing: "2px", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "16px" }}>
              ⬡ Card Preview
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Name", value: form.name },
                { label: "Blood Type", value: form.blood_type },
                { label: "Emergency Contact", value: contact.contact_name },
                { label: "Contact Phone", value: contact.contact_phone },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px 16px" }}>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "4px" }}>{label}</div>
                  <div style={{ fontSize: "15px", fontWeight: "300" }}>{value || "—"}</div>
                </div>
              ))}
            </div>
            {form.medical_notes && (
              <div style={{ marginTop: "12px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "12px 16px" }}>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "4px" }}>Medical Notes</div>
                <div style={{ fontSize: "15px", fontWeight: "300" }}>{form.medical_notes}</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setStep("form")} style={{
              flex: 1, padding: "14px", background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: "10px",
              color: "rgba(255,255,255,0.6)", fontFamily: "inherit", fontSize: "15px", cursor: "pointer",
            }}>
              ✎ Edit Info
            </button>
            <button onClick={() => window.open(qrUrl, "_blank")} style={{
              flex: 1, padding: "14px", background: "#6366f1", border: "none",
              borderRadius: "10px", color: "#fff", fontFamily: "inherit",
              fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}>
              Preview Card →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}