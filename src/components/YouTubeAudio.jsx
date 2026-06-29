// 유튜브 IFrame API로 배경음악 재생 (플레이어는 숨기고 소리만).
// 사파리/iOS는 숨김 자동재생을 막는 경우가 많아, 막히면 "음악 재생하기" 탭 버튼으로 폴백.
import { useEffect, useRef, useState } from 'react';

let apiPromise = null;
function loadAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
  });
  return apiPromise;
}

export default function YouTubeAudio({ videoId, start = 0 }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const [needTap, setNeedTap] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let checkTimer;
    loadAPI().then(() => {
      if (cancelled || !hostRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: { autoplay: 1, start, controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: (e) => {
            try { e.target.playVideo(); } catch { /* noop */ }
            // 1.5초 뒤에도 재생 중이 아니면(=사파리 등 차단) 탭 버튼 노출
            checkTimer = setTimeout(() => {
              const st = playerRef.current && playerRef.current.getPlayerState
                ? playerRef.current.getPlayerState() : -1;
              if (st !== 1) setNeedTap(true); // 1 = playing
            }, 1500);
          },
          onStateChange: (e) => { if (e.data === 1) setNeedTap(false); }, // 재생 시작되면 버튼 숨김
        },
      });
    });
    return () => {
      cancelled = true;
      clearTimeout(checkTimer);
      try { playerRef.current?.destroy(); } catch { /* noop */ }
      playerRef.current = null;
    };
  }, [videoId, start]);

  function handleTap() {
    try { playerRef.current?.playVideo(); } catch { /* noop */ }
  }

  return (
    <>
      {/* 화면 밖 1x1 (소리만) */}
      <div aria-hidden style={{ position: 'fixed', left: -9999, top: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}>
        <div ref={hostRef} />
      </div>

      {/* 자동재생이 막힌 경우 폴백 버튼 */}
      {needTap && (
        <button
          onClick={handleTap}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 400, background: '#fff', color: '#8bac8b',
            border: '1.5px solid #8bac8b', borderRadius: 24,
            padding: '11px 22px', fontSize: '0.92rem', fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
          }}
        >
          🎵 음악 재생하기
        </button>
      )}
    </>
  );
}
