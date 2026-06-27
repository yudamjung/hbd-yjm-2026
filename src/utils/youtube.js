// 유튜브 링크에서 videoId와 시작 시간(초)을 추출.
// 지원: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, music.youtube.com, 순수 ID
export function parseYouTube(url) {
  if (!url || typeof url !== 'string') return null;
  const s = url.trim();
  let id = null;

  let m = s.match(/youtu\.be\/([\w-]{11})/);
  if (m) id = m[1];
  if (!id) { m = s.match(/[?&]v=([\w-]{11})/); if (m) id = m[1]; }
  if (!id) { m = s.match(/youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/); if (m) id = m[1]; }
  if (!id) { m = s.match(/^([\w-]{11})$/); if (m) id = m[1]; }
  if (!id) return null;

  let start = 0;
  const t = s.match(/[?&](?:t|start)=([\dhms]+)/);
  if (t) start = parseTime(t[1]);
  return { id, start };
}

function parseTime(v) {
  if (/^\d+$/.test(v)) return parseInt(v, 10);
  let sec = 0;
  const h = v.match(/(\d+)h/);
  const m = v.match(/(\d+)m/);
  const s = v.match(/(\d+)s/);
  if (h) sec += +h[1] * 3600;
  if (m) sec += +m[1] * 60;
  if (s) sec += +s[1];
  return sec;
}
