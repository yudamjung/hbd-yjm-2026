import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountdownTimer from '../components/CountdownTimer';
import CountdownVideo from '../components/CountdownVideo';
import LetterFormModal from '../components/LetterFormModal';
import { subscribeLetters } from '../utils/storage';
import { BIRTHDAY_NAME } from '../constants/config';

export default function CountdownPage({ onExpire, deadline }) {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [letters, setLetters] = useState([]);
  const [videoActive, setVideoActive] = useState(false);
  const [videoOffset, setVideoOffset] = useState(0);
  const letterCount = letters.length;

  const handleLastMinute = useCallback((totalSec) => {
    setVideoOffset(Math.max(0, 60 - totalSec)); // 늦게 접속 시 현재 시점으로 점프
    setVideoActive(true);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeLetters(setLetters);
    return () => unsubscribe();
  }, []);

  const handleFormClose = useCallback(() => {
    setShowForm(false);
    setEditMode(false);
  }, []);

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
      {/* 배경 별 파티클 */}
      <Stars />

      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '48px', zIndex: 1 }}
      >
        <p style={{ color: '#ffffff55', fontSize: '0.85rem', letterSpacing: '0.3em', marginBottom: '12px' }}>
          🎂 BIRTHDAY COUNTDOWN
        </p>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#fff',
          margin: 0,
        }}>
          {BIRTHDAY_NAME}의 생일까지
        </h1>
      </motion.div>

      {/* 카운트다운 타이머 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ zIndex: 1 }}
      >
        <CountdownTimer onExpire={onExpire} onLastMinute={handleLastMinute} deadline={deadline} />
      </motion.div>

      {/* 마감 1분 전부터 카운트다운과 함께 보이는 영상 */}
      <CountdownVideo active={videoActive} startOffset={videoOffset} />

      {/* 편지 수 표시 */}
      {letterCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: '32px',
            color: '#ffffff66',
            fontSize: '0.9rem',
            zIndex: 1,
          }}
        >
          💌 {letterCount}명이 편지를 남겼어요
        </motion.p>
      )}

      {/* 편지함 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        style={{ marginTop: '56px', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
      >
        <button
          onClick={() => { setEditMode(false); setShowForm(true); }}
          style={{
            background: 'none',
            border: '1px solid #ffffff33',
            borderRadius: '16px',
            padding: '16px 32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#fff',
            fontSize: '1rem',
            backdropFilter: 'blur(8px)',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#ffffff88';
            e.currentTarget.style.background = '#ffffff11';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#ffffff33';
            e.currentTarget.style.background = 'none';
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>📮</span>
          편지 남기기
        </button>

        <button
          onClick={() => { setEditMode(true); setShowForm(true); }}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffffff44',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          내 편지 수정하기
        </button>
      </motion.div>

      {/* 편지 작성/수정 모달 */}
      {showForm && (
        <LetterFormModal
          editMode={editMode}
          letters={letters}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

// 배경 별 컴포넌트
function Stars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    delay: Math.random() * 3,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            background: '#fff',
            opacity: s.opacity,
            animation: `twinkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
