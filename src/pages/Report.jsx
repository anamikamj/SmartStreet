import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Report() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [location, setLocation] = useState("Fetching...");
  const [coords, setCoords] = useState(null);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(pos.coords);
        setLocation(`${pos.coords.latitude.toFixed(7)}, ${pos.coords.longitude.toFixed(7)}`);
      },
      () => setLocation("Unavailable")
    );
    setTimestamp(new Date().toLocaleString());
  }, []);

  function handleReset() {
    setImage(null);
    setDescription("");
    setSuccess(false);
  }

  async function submitReport() {
    if (!image) { alert("Please upload an image of the hazard"); return; }
    if (!description.trim()) { alert("Please describe the hazard"); return; }
    setSubmitting(true);

    const fileName = `report-${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage
      .from("incident-images")
      .upload(fileName, image);

    if (uploadError) {
      alert("Image upload failed: " + uploadError.message);
      setSubmitting(false);
      return;
    }

    const loc = coords ? `${coords.latitude},${coords.longitude}` : "Unavailable";

    const { error } = await supabase.from("reports").insert([{
      image_url: fileName,
      description: description.trim(),
      location: loc,
      timestamp: new Date().toISOString(),
    }]);

    setSubmitting(false);
    if (error) alert("Report failed: " + error.message);
    else setSuccess(true);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      padding: "60px 80px",
      fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
      color: "#fff",
    }}>

      {/* Title */}
      <h1 style={{
        fontSize: "72px",
        fontWeight: "300",
        letterSpacing: "-1px",
        lineHeight: "1",
        marginBottom: "12px",
      }}>
        Report Hazard
      </h1>
      <p style={{
        fontSize: "18px",
        fontWeight: "300",
        color: "rgba(255,255,255,0.4)",
        marginBottom: "48px",
        fontStyle: "italic",
      }}>
        Help keep roads safe for everyone
      </p>

      {/* Card */}
      <div style={{
        background: "linear-gradient(145deg, rgba(120,40,60,0.35) 0%, rgba(80,20,40,0.5) 50%, rgba(60,15,30,0.6) 100%)",
        border: "1px solid rgba(180,80,100,0.2)",
        borderRadius: "20px",
        padding: "32px",
        maxWidth: "860px",
        backdropFilter: "blur(10px)",
      }}>

        {/* Location + Timestamp row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
          <div style={{
            flex: 1,
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "14px 20px",
          }}>
            <div style={{
              fontSize: "11px", color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase", letterSpacing: "1.5px",
              marginBottom: "6px", fontFamily: "inherit"
            }}>
              Your Location
            </div>
            <div style={{
              fontSize: "14px", color: "rgba(255,255,255,0.85)",
              fontFamily: "monospace", letterSpacing: "0.3px"
            }}>
              {location}
            </div>
          </div>

          <div style={{
            flex: 1,
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "14px 20px",
          }}>
            <div style={{
              fontSize: "11px", color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase", letterSpacing: "1.5px",
              marginBottom: "6px", fontFamily: "inherit"
            }}>
              Timestamp
            </div>
            <div style={{
              fontSize: "14px", color: "rgba(255,255,255,0.85)",
              fontFamily: "monospace", letterSpacing: "0.3px"
            }}>
              {timestamp}
            </div>
          </div>
        </div>

        {/* Upload area */}
        <label htmlFor="hazard-upload" style={{ cursor: "pointer" }}>
          <div style={{
            background: "rgba(0,0,0,0.3)",
            border: `1px solid ${image ? "rgba(180,80,100,0.5)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "12px",
            padding: "48px 20px",
            textAlign: "center",
            marginBottom: "12px",
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: "22px", marginBottom: "10px" }}>
              {image ? "📷" : "⬆"}
            </div>
            <div style={{
              fontSize: "15px",
              color: image ? "rgba(255,180,180,0.9)" : "rgba(255,255,255,0.35)",
              fontFamily: "inherit",
              fontWeight: "300",
            }}>
              {image ? image.name : "tap to upload a photo of the hazard"}
            </div>
          </div>
        </label>
        <input
          id="hazard-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => { setImage(e.target.files[0]); setSuccess(false); }}
        />

        {/* Description textarea */}
        <textarea
          placeholder="describe the hazard"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            color: "rgba(255,255,255,0.8)",
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "16px",
            fontWeight: "300",
            padding: "16px 20px",
            resize: "vertical",
            minHeight: "80px",
            marginBottom: "16px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {/* Success message */}
        {success && (
          <div style={{
            background: "rgba(0,200,100,0.08)",
            border: "1px solid rgba(0,200,100,0.25)",
            borderRadius: "10px",
            padding: "14px 20px",
            color: "#4ade80",
            fontSize: "15px",
            fontWeight: "300",
            marginBottom: "16px",
            textAlign: "center",
          }}>
            ✅ Hazard reported successfully!
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              flex: 1, padding: "16px",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", color: "rgba(255,255,255,0.7)",
              fontFamily: "inherit", fontSize: "16px", fontWeight: "300",
              cursor: "pointer", letterSpacing: "0.5px",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleReset}
            style={{
              flex: 1, padding: "16px",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", color: "rgba(255,255,255,0.7)",
              fontFamily: "inherit", fontSize: "16px", fontWeight: "300",
              cursor: "pointer", letterSpacing: "0.5px",
            }}
          >
            Reset
          </button>

          <button
            onClick={submitReport}
            disabled={submitting}
            style={{
              flex: 1, padding: "16px",
              background: submitting ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "12px", color: submitting ? "rgba(255,255,255,0.4)" : "#fff",
              fontFamily: "inherit", fontSize: "16px", fontWeight: "300",
              cursor: submitting ? "not-allowed" : "pointer", letterSpacing: "0.5px",
            }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
}