import React, { useState } from 'react';

const Narration = ({ script, audioSrc }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <audio
        src={audioSrc}
        controls
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        style={{ width: '100%' }}
      />
      <div
        style={{
          marginTop: '1rem',
          whiteSpace: 'pre-line',
          fontSize: '1rem',
          lineHeight: '1.5',
          maxHeight: '200px',
          overflowY: 'auto',
          backgroundColor: '#f9f9f9',
          padding: '1rem',
          borderRadius: '4px',
          fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        }}
      >
        {script}
      </div>
    </section>
  );
};

export default Narration;
