// 마감 1분 전부터 카운트다운과 함께 보이는 작은 영상.
// 페이지 진입 시점부터 preload 해두고(요소를 항상 마운트), active가 되면
// 박스를 펼쳐 재생한다. 늦게 접속한 경우 startOffset(=60-남은초)만큼 seek 해서
// 영상 끝과 생일 시작(0초)이 맞아떨어지게 한다.
// 소리까지 자동재생을 시도하되, 브라우저가 막으면 음소거로 재생하고
// "탭하여 소리 켜기" 버튼을 노출한다(사용자 제스처가 있어야 소리가 풀림).
import { useEffect, useRef, useState } from 'react';

const VIDEO_SRC = '/birthday-countdown.mp4';

export default function CountdownVideo({ active, startOffset = 0 }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!active) return;
    const v = videoRef.current;
    if (!v) return;

    try {
      if (startOffset > 0) v.currentTime = startOffset;
    } catch { /* seek 실패 시 처음부터 */ }

    // 소리까지 자동재생 시도 → 막히면 음소거로 재생 + 버튼 노출
    v.muted = false;
    v.play()
      .then(() => setMuted(false))
      .catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => { /* 그래도 막히면 포기 */ });
      });
  }, [active, startOffset]);

  const handleUnmute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    v.play().catch(() => {});
  };

  return (
    <div
      style={{
        width: active ? 'min(440px, 78vw)' : 0,
        height: active ? 'auto' : 0,
        opacity: active ? 1 : 0,
        marginTop: active ? 28 : 0,
        overflow: 'hidden',
        borderRadius: 16,
        position: 'relative',
        zIndex: 1,
        boxShadow: active ? '0 12px 40px rgba(0,0,0,0.5)' : 'none',
        transition: 'opacity 0.6s ease, margin-top 0.6s ease',
      }}
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        preload="auto"
        playsInline
        style={{ width: '100%', height: 'auto', display: 'block', background: '#000' }}
      />
      {active && muted && (
        <button
          onClick={handleUnmute}
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            background: '#000000aa',
            border: '1px solid #ffffff55',
            borderRadius: 20,
            padding: '8px 14px',
            color: '#fff',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backdropFilter: 'blur(4px)',
          }}
        >
          🔇 탭하여 소리 켜기
        </button>
      )}
    </div>
  );
}
