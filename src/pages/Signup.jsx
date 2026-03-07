import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    blood_type: "",
    medical_notes: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Create auth account
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    // 2. Insert into users table
    if (userId) {
      const { error: profileError } = await supabase.from("users").insert({
        id: userId,
        name: form.name,
        blood_type: form.blood_type || null,
        medical_notes: form.medical_notes || null,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("Profile save error:", profileError.message);
        alert("Account created but profile could not be saved: " + profileError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    alert("Signup successful! Please check your email to confirm your account.");
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-left" style={{ maxWidth: "560px" }}>
        <div className="auth-brand">SmartStreet</div>

        <h1 className="auth-title">Join SmartStreet</h1>
        <p className="auth-subtitle">Create an account to start your safer journey</p>

        <form className="auth-form" onSubmit={handleSignup}>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Your full name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {/* Divider */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            margin: "8px 0",
            paddingTop: "8px",
          }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>
              🏥 Medical Info — used in emergencies
            </p>
          </div>

          {/* Blood Type */}
          <div className="form-group">
            <label className="form-label">Blood Type</label>
            <select
              name="blood_type"
              className="form-input"
              value={form.blood_type}
              onChange={handleChange}
              style={{ cursor: "pointer" }}
            >
              <option value="">Select blood type</option>
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>{bt}</option>
              ))}
            </select>
          </div>

          {/* Medical Notes */}
          <div className="form-group">
            <label className="form-label">Medical Conditions / Allergies</label>
            <textarea
              name="medical_notes"
              className="form-input"
              placeholder="e.g. Diabetic, allergic to penicillin, asthma..."
              value={form.medical_notes}
              onChange={handleChange}
              rows={3}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;