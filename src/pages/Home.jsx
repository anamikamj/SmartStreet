import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="home-header">
        <div className="app-name">Hack4Safety</div>
        <h1>Stay Safe.<br /><span>Act Fast.</span></h1>
      </div>

      <div className="card card-red">
        <div className="card-icon">🚨</div>
        <h2>SOS Emergency</h2>
        <p>Record evidence, trigger alarm, and alert authorities during a crime or unsafe situation.</p>
        <ul className="feature-list">
          <li>Video + audio recording</li>
          <li>Live location capture</li>
          <li>Buzzer alarm</li>
        </ul>
        <button className="btn btn-red" onClick={() => navigate("/sos")}>
          Open SOS
        </button>
      </div>

      <div className="card card-orange">
        <div className="card-icon">🛑</div>
        <h2>Report Road Hazard</h2>
        <p>Upload a photo and description of unsafe roads or traffic issues.</p>
        <ul className="feature-list">
          <li>Photo upload</li>
          <li>Description + location</li>
          <li>Stored in database</li>
        </ul>
        <button className="btn btn-orange" onClick={() => navigate("/report")}>
          Report Hazard
        </button>
      </div>
    </div>
  );
}