import { useState, useRef } from "react";

export default function ERCall() {

  const [callActive, setCallActive] = useState(false);
  const videoRef = useRef(null);

  async function startCall() {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    videoRef.current.srcObject = stream;

    setCallActive(true);
  }

  return (
    <div>

      <h2>Emergency ER Video Call</h2>

      {!callActive && (
        <button onClick={startCall}>
          Start Emergency Call
        </button>
      )}

      {callActive && (
        <div>

          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "400px" }}
          />

          <p>Connecting to medical professional...</p>

        </div>
      )}

    </div>
  );
}