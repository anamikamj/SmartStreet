import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function IncidentRecorder() {

  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");

  async function submitReport() {

    if (!image) {
      alert("Please upload an image");
      return;
    }

    const fileName = `report-${Date.now()}-${image.name}`;

    // upload image to storage
    const { error: uploadError } = await supabase.storage
      .from("incident-images")
      .upload(fileName, image);

    if (uploadError) {
      alert("Upload failed");
      console.error(uploadError);
      return;
    }

    // get location
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    const location =
      position.coords.latitude + "," +
      position.coords.longitude;

    // save to database
    const { error } = await supabase.from("reports").insert([
      {
        image_url: fileName,
        description: description,
        location: location
      }
    ]);

    if (error) {
      console.error(error);
      alert("Report failed");
    } else {
      alert("Incident reported successfully");
    }

  }

  return (

    <div>

      <h2>Report Road Hazard</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <br /><br />

      <textarea
        placeholder="Describe the hazard"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <br /><br />

      <button onClick={submitReport}>
        Submit Report
      </button>

    </div>

  );
}