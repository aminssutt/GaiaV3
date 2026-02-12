import React, { useMemo } from 'react'
import './VideoPlayer.css'

function toEmbeddableUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    // Convert youtu.be/<id> to embed
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    // Convert youtube.com/watch?v=<id> to embed
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch' && u.searchParams.get('v')) {
        const id = u.searchParams.get('v');
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.pathname.startsWith('/embed/')) {
        return url; // already embed
      }
    }
  } catch (_) {
    // fall through, return original
  }
  return url;
}

function VideoPlayer({ title, description, videoUrl }) {
  const src = useMemo(() => toEmbeddableUrl(videoUrl), [videoUrl]);
  return (
    <div className="video-player">
      <div className="video-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      
      <div className="video-container">
        {src ? (
          <iframe
            src={src}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="video-placeholder" style={{
            width: '100%',
            aspectRatio: '16 / 9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#111',
            color: '#aaa',
            borderRadius: 8,
            border: '1px solid #333'
          }}>
            Video coming soon
          </div>
        )}
        {src && (
          <div style={{ textAlign: 'right', paddingTop: 6 }}>
            <a href={src} target="_blank" rel="noreferrer" style={{ color: '#8b7a9e', fontSize: 12 }}>
              Open video in browser
            </a>
          </div>
        )}
      </div>
      
      {/* Controls removed per request to avoid API/quotas & keep UI simple */}
    </div>
  )
}

export default VideoPlayer

