// 유튜브 IFrame API로 배경음악 재생 (플레이어는 숨기고 소리만).
// 데스크톱은 카드 클릭 제스처 컨텍스트에서 자동재생되지만,
// iOS(Safari·Chrome)는 비동기 콜백 재생을 차단하므로 안내 + 켜기 버튼을 띄운다.
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
  const [playing, setPlaying] = useState(false);
  const [needTap, setNeedTap] = useState(false); // 자동재생이 안 잡힐 때만 안내 노출

  useEffect(() => {
    let cancelled = false;
    loadAPI().then(() => {
      if (cancelled || !hostRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: { autoplay: 1, start, controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: (e) => { try { e.target.playVideo(); } catch { /* noop */ } },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) setPlaying(true);
          },
        },
      });
    });
    // 데스크톱 자동재생은 보통 1초 안에 잡힘 → 그 뒤에도 무음이면 안내 노출
    const t = setTimeout(() => setNeedTap(true), 1200);
    return () => {
      cancelled = true;
      clearTimeout(t);
      try { playerRef.current?.destroy(); } catch { /* noop */ }
      playerRef.current = null;
    };
  }, [videoId, start]);

  function handlePlay() {
    try { playerRef.current?.playVideo(); } catch { /* noop */ }
  }

  return (
    <>
      {/* 화면 밖 1x1 (소리만) */}
      <div aria-hidden style={{ position: 'fixed', left: -9999, top: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}>
        <div ref={hostRef} />
      </div>

      {/* 자동재생이 막힌 기기(iOS 등): 안내 + 직접 재생 버튼 */}
      {!playing && needTap && (
        <div style={{ position: 'fixed', left: 0, right: 0, top: 20, display: 'flex', justifyContent: 'center', zIndex: 401, pointerEvents: 'none', padding: '0 16px' }}>
          <button onClick={handlePlay} style={musicHintBtn}>
            🎵 이 편지엔 배경음악이 있어요 — 탭해서 켜기
          </button>
        </div>
      )}
    </>
  );
}

const musicHintBtn = {
  background: '#1a1a1aee',
  border: '1px solid #ffffff33',
  borderRadius: 24,
  padding: '10px 20px',
  color: '#fff',
  fontSize: '0.85rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
  cursor: 'pointer',
  pointerEvents: 'auto',
  maxWidth: '100%',
};
