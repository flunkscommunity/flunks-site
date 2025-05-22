import React, { useState } from 'react';
import '../styles/map.css'; // Make sure this CSS file exists

interface Props {
  onClose: () => void;
}

const Semester0Map: React.FC<Props> = ({ onClose }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="map-window">
      <img
        src="/images/flunks-map.png"
        className="background-map"
        alt="Semester 0 Map"
      />

      {/* Grayout overlay */}
      {hovered && <div className="map-overlay" />}

      {/* Treehouse icon */}
      <div
        className="icon treehouse"
        onMouseEnter={() => setHovered('treehouse')}
        onMouseLeave={() => setHovered(null)}
      />

      {/* School icon */}
      <div
        className="icon school"
        onMouseEnter={() => setHovered('school')}
        onMouseLeave={() => setHovered(null)}
      />

      {/* Info Box */}
      {hovered && (
        <div className="info-box">
          {hovered === 'treehouse' && <>🪵 The secret treehouse where the real stories unfold.</>}
          {hovered === 'school' && <>🏫 The high school – where it all begins (and ends).</>}
        </div>
      )}

      {/* Close button */}
      <button className="close-btn" onClick={onClose}>✖</button>
    </div>
  );
};

export default Semester0Map;