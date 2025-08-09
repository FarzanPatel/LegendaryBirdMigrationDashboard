import React, { useEffect, useRef } from 'react';

export default function Narration({ script, audioSrc }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked by browser
      });
    }
  }, [audioSrc]);

  return (
    <section style={{ marginTop: '2rem', maxWidth: '800px', padding: '1rem' }}>
      <h2>Dashboard Narration</h2>
      <p style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>{script}</p>
      {audioSrc && (
        <audio controls ref={audioRef} style={{ marginTop: '1rem', width: '100%' }}>
          <source src={audioSrc} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </section>
  );
}
