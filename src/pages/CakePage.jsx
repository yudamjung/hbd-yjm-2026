import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cake3D from '../components/Cake3D';
import LetterViewModal from '../components/LetterViewModal';
import VolumeHint from '../components/VolumeHint';
import { getDecoration } from '../constants/decorations';
import { subscribeLetters, isCandleBlown, setCandleBlown, setCandleLit } from '../utils/storage';
import { createBirthdaySong } from '../utils/birthdaySong';
import { parseYouTube } from '../utils/youtube';
import { BIRTHDAY_NAME, BIRTHDAY_AGE, OWNER_KEY } from '../constants/config';

export default function CakePage() {
  const [letters, setLetters] = useState([]);
  const [blown, setBlown] = useState(isCandleBlown);
  const [selectedLetter, setSelectedLetter] = useState(null);

  // 실시간 구독 — 다른 사람이 남긴 편지도 바로 케이크에 반영
  useEffect(() => {
    const unsubscribe = subscribeLetters(setLetters);
    return () => unsubscribe();
  }, []);

  // 열어둔 카드가 수정되면 최신 내용으로 갱신
  useEffect(() => {
    if (!selectedLetter) return;
    const fresh = letters.find((l) => l.id === selectedLetter.id);
    if (fresh && fresh !== selectedLetter) setSelectedLetter(fresh);
  }, [letters, selectedLetter]);

  const [isOwner, setIsOwner] = useState(() =>
    sessionStorage.getItem('hbd_owner') === 'true'
  );
  const [ownerPrompt, setOwnerPrompt] = useState(false);
  const [ownerInput, setOwnerInput] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [showLetterList, setShowLetterList] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volumeHint, setVolumeHint] = useState(0); // 값이 바뀌면 볼륨 안내 토스트 재표시

  // 마이크 기반 촛불 끄기
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  // 생일 축하 노래 (피아노 합성)
  const songRef = useRef(null);

  useEffect(() => {
    // 페이지 진입 애니메이션
    setTimeout(() => setEntered(true), 100);
    // 진입 직후 사운드 볼륨 안내
    setTimeout(() => setVolumeHint((k) => k + 1), 1200);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  // 케이크 등장과 동시에 노래 재생 (자동재생 차단 시 첫 탭에서 시작)
  useEffect(() => {
    const song = createBirthdaySong();
    songRef.current = song;

    const onInteract = () => { song.start(); };
    const removeListeners = () => {
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
      window.removeEventListener('touchstart', onInteract);
    };

    song.start().then((ok) => {
      if (!ok) {
        window.addEventListener('pointerdown', onInteract, { once: true });
        window.addEventListener('keydown', onInteract, { once: true });
        window.addEventListener('touchstart', onInteract, { once: true });
      }
    });

    return () => { removeListeners(); song.stop(); };
  }, []);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    songRef.current?.setMuted(next);
    if (!next) songRef.current?.start();
  }

  // 편지에 배경음악이 있으면 카드 열린 동안 생일축하 피아노는 음소거
  useEffect(() => {
    const hasMusic = !!(selectedLetter && parseYouTube(selectedLetter.music));
    if (hasMusic) {
      songRef.current?.setMuted(true);
      setVolumeHint((k) => k + 1); // 음악 있는 편지 열람 시 볼륨 안내
    }
    return () => { if (hasMusic) songRef.current?.setMuted(muted); };
  }, [selectedLetter, muted]);

  // 영상 다시 보기 동안에는 배경 피아노 음소거 (영상 소리와 겹치지 않게)
  useEffect(() => {
    if (!showVideo) return;
    songRef.current?.setMuted(true);
    return () => { songRef.current?.setMuted(muted); };
  }, [showVideo, muted]);

  function handleOwnerSubmit(e) {
    e.preventDefault();
    if (ownerInput === OWNER_KEY) {
      sessionStorage.setItem('hbd_owner', 'true');
      setIsOwner(true);
      setOwnerPrompt(false);
    } else {
      setOwnerError('비밀번호가 틀렸어요.');
    }
  }

  async function startMicDetection() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const check = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 30) {
          blowCandle();
          stream.getTracks().forEach(t => t.stop());
          ctx.close();
        } else {
          rafRef.current = requestAnimationFrame(check);
        }
      };
      rafRef.current = requestAnimationFrame(check);
    } catch {
      // 마이크 권한 거부 → 폴백 안내
      alert('마이크 권한이 필요해요. 화면을 클릭해서 촛불을 끌 수도 있어요!');
    }
  }

  function blowCandle() {
    setBlown(true);
    setCandleBlown();
  }

  function relightCandle() {
    setBlown(false);
    setCandleLit();
  }

  const cakeRef = useRef(null);

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Stars />

      {/* 사운드 볼륨 안내 토스트 */}
      <VolumeHint triggerKey={volumeHint} />

      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: entered ? 1 : 0, y: entered ? 0 : -16 }}
        transition={{ duration: 1 }}
        style={{ textAlign: 'center', marginBottom: '24px', zIndex: 1 }}
      >
        <h1 style={{
          fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
          fontWeight: 700,
          color: '#fff',
          margin: 0,
          textShadow: '0 0 30px #ffd70044',
        }}>
          🎉 Happy Birthday, {BIRTHDAY_NAME}! 🎉
        </h1>
        {BIRTHDAY_AGE && (
          <p style={{ color: '#ffd70088', marginTop: '6px', fontSize: '0.9rem' }}>
            {BIRTHDAY_AGE}살 생일을 축하해요
          </p>
        )}
      </motion.div>

      {/* 3D 케이크 (동물 장식 없음 — 편지 작성 시 장식이 올라올 예정) */}
      <motion.div
        ref={cakeRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{
          position: 'relative',
          width: 'clamp(320px, 70vw, 620px)',
          height: 'clamp(340px, 58vh, 560px)',
          zIndex: 1,
        }}
      >
        <Cake3D candleBlown={blown} letters={letters} onAnimalClick={setSelectedLetter} />
      </motion.div>

      {/* 촛불 끄기 버튼 */}
      {!blown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ delay: 1.5 }}
          style={{ marginTop: '24px', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <button
            onClick={startMicDetection}
            style={{
              background: '#ffffff11',
              border: '1px solid #ffffff33',
              borderRadius: '30px',
              padding: '10px 24px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🎤 후~ 불어서 촛불 끄기
          </button>
          <button
            onClick={blowCandle}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff44',
              fontSize: '0.78rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            클릭으로 끄기
          </button>
        </motion.div>
      )}

      {blown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginTop: '20px', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
        >
          <p style={{ margin: 0, color: '#ffd70099', fontSize: '0.9rem' }}>
            🌟 소원이 이루어지길!
          </p>
          <button
            onClick={relightCandle}
            style={{
              background: '#ffffff11',
              border: '1px solid #ffffff33',
              borderRadius: '30px',
              padding: '8px 20px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            🔥 다시 불 붙이기
          </button>
        </motion.div>
      )}

      {/* 편지 수 */}
      {letters.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ delay: 2 }}
          style={{ marginTop: '16px', color: '#ffffff55', fontSize: '0.85rem', zIndex: 1 }}
        >
          💌 {letters.length}명이 편지를 남겼어요
        </motion.p>
      )}

      {/* 생일자 안내: 케이크 위 친구 클릭 (작은 고정 힌트 한 줄) */}
      {isOwner && letters.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ delay: 2.2 }}
          style={{ marginTop: '6px', color: '#ffffff33', fontSize: '0.78rem', zIndex: 1 }}
        >
          🎁 케이크 위 친구를 누르면 편지를 볼 수 있어요
        </motion.p>
      )}

      {/* 우측 상단 메뉴바 (음악 · 영상 · 편지보기/로그인) */}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        <MenuBarButton onClick={toggleMute} title={muted ? '음악 켜기' : '음악 끄기'}>
          {muted ? '🔇' : '🔊'}
        </MenuBarButton>
        <MenuBarButton onClick={() => setShowVideo(true)} title="생일 영상 다시 보기">
          🎬
        </MenuBarButton>
        {isOwner ? (
          <MenuBarButton onClick={() => setShowLetterList(true)} title="편지 전체 보기">
            📋
          </MenuBarButton>
        ) : (
          <MenuBarButton onClick={() => setOwnerPrompt(true)} title="생일자 로그인">
            🔑
          </MenuBarButton>
        )}
      </div>

      {/* 생일 영상 다시 보기 모달 */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowVideo(false); }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#000000e6',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <video
              src="/birthday-countdown.mp4"
              autoPlay
              controls
              playsInline
              style={{
                width: 'min(720px, 92vw)',
                maxHeight: '85vh',
                borderRadius: '16px',
                background: '#000',
              }}
            />
            <button
              onClick={() => setShowVideo(false)}
              aria-label="닫기"
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: '#00000088',
                border: '1px solid #ffffff44',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                zIndex: 301,
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 오너 로그인 모달 */}
      <AnimatePresence>
        {ownerPrompt && (
          <div
            style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={(e) => { if (e.target === e.currentTarget) { setOwnerPrompt(false); setOwnerError(''); } }}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onSubmit={handleOwnerSubmit}
              style={{
                background: '#0e0e0e',
                border: '1px solid #2a2a2a',
                borderRadius: '20px',
                padding: '32px 28px',
                width: '100%',
                maxWidth: '360px',
              }}
            >
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '8px' }}>생일자 로그인</h3>
              <p style={{ color: '#ffffff55', fontSize: '0.82rem', marginBottom: '20px' }}>
                생일자만 모든 편지를 볼 수 있어요 🎂
              </p>
              <input
                type="password"
                value={ownerInput}
                onChange={e => { setOwnerInput(e.target.value); setOwnerError(''); }}
                placeholder="비밀번호"
                autoFocus
                style={{
                  width: '100%',
                  background: '#111',
                  border: '1px solid #333',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '12px',
                }}
              />
              {ownerError && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '8px' }}>{ownerError}</p>}
              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #7b2d8b, #e63946)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                입장하기
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* 편지 전체 목록 (오너용) */}
      <AnimatePresence>
        {showLetterList && (
          <div
            style={{ position: 'fixed', inset: 0, background: '#000000cc', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowLetterList(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                background: '#0e0e0e',
                border: '1px solid #2a2a2a',
                borderRadius: '20px',
                padding: '28px 24px',
                width: '100%',
                maxWidth: '480px',
                maxHeight: '80dvh',
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <button onClick={() => setShowLetterList(false)} style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', color: '#ffffff55', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
              <h3 style={{ color: '#fff', marginTop: 0, marginBottom: '20px' }}>
                📋 전체 편지 ({letters.length}개)
              </h3>
              {letters.length === 0 ? (
                <p style={{ color: '#ffffff44', fontSize: '0.9rem' }}>아직 편지가 없어요.</p>
              ) : letters.map((letter, i) => {
                const deco = getDecoration(letter.decoration);
                return (
                  <div
                    key={letter.id}
                    style={{
                      borderBottom: '1px solid #1a1a1a',
                      paddingBottom: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>{deco?.emoji}</span>
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{letter.name}</span>
                      <span style={{ color: '#ffffff33', fontSize: '0.75rem' }}>
                        {new Date(letter.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p style={{
                      color: '#ffffffbb',
                      fontSize: '0.88rem',
                      lineHeight: 1.7,
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {letter.content}
                    </p>
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 편지 열람 모달 */}
      <AnimatePresence>
        {selectedLetter && (
          <LetterViewModal
            letter={selectedLetter}
            isOwner={isOwner}
            onClose={() => setSelectedLetter(null)}
            onUpdated={() => { /* 실시간 구독이 자동 반영 */ }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const menuIconBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  opacity: 0.5,
  transition: 'opacity 0.2s',
  padding: '4px',
  fontSize: '1.4rem',
  lineHeight: 1,
};

// 우측 상단 메뉴바 아이콘 버튼 (호버 시 또렷해짐)
function MenuBarButton({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={menuIconBtn}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.95')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
    >
      {children}
    </button>
  );
}

function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.4 + 0.05,
    delay: Math.random() * 4,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((s) => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          borderRadius: '50%', background: '#fff',
          opacity: s.opacity,
          animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}
