// 유튜브 IFrame API로 배경음악 재생 (플레이어는 숨기고 소리만).
// 카드가 클릭으로 열리므로 사용자 제스처 컨텍스트 안에서 자동재생됨 (Chrome 기준).
import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    let cancelled = false;
    loadAPI().then(() => {
      if (cancelled || !hostRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: { autoplay: 1, start, controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: (e) => { try { e.target.playVideo(); } catch { /* noop */ } },
        },
      });
    });
    return () => {
      cancelled = true;
      try { playerRef.current?.destroy(); } catch { /* noop */ }
      playerRef.current = null;
    };
  }, [videoId, start]);

  // 화면 밖 1x1 (소리만)
  return (
    <div aria-hidden style={{ position: 'fixed', left: -9999, top: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}>
      <div ref={hostRef} />
    </div>
  );
}
