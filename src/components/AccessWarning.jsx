// 접근 제한 안내 화면 (모바일 / 사파리 공용).
// 케이크 경험은 막지만, 편지 작성·수정은 여기서도 가능하도록 유지.
import { useState, useEffect } from 'react';
import { BIRTHDAY_NAME } from '../constants/config';
import { subscribeLetters } from '../utils/storage';
import LetterFormModal from './LetterFormModal';

export default function AccessWarning({ children }) {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [letters, setLetters] = useState([]);

  // 수정 시 이름으로 편지를 찾으려면 편지 목록이 필요
  useEffect(() => {
    const unsubscribe = subscribeLetters(setLetters);
    return () => unsubscribe();
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      textAlign: 'center',
    }}>
      {/* 별 배경 */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 2 + 0.5}px`,
            height: `${Math.random() * 2 + 0.5}px`,
            borderRadius: '50%',
            background: '#fff',
            opacity: Math.random() * 0.4 + 0.1,
          }} />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎂</div>

        <h2 style={{
          color: '#fff',
          fontSize: '1.2rem',
          fontWeight: 700,
          marginBottom: '12px',
          lineHeight: 1.4,
        }}>
          {BIRTHDAY_NAME}의 생일 케이크
        </h2>

        <p style={{
          color: '#ffffff66',
          fontSize: '0.88rem',
          lineHeight: 1.7,
          marginBottom: '32px',
          maxWidth: '300px',
        }}>
          {children}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => { setEditMode(false); setShowForm(true); }}
            style={{
              background: 'linear-gradient(135deg, #7b2d8b, #e63946)',
              border: 'none',
              borderRadius: '14px',
              padding: '14px 28px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📮 편지는 여기서 쓸 수 있어요
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
        </div>
      </div>

      {showForm && (
        <LetterFormModal
          editMode={editMode}
          letters={letters}
          onClose={() => { setShowForm(false); setEditMode(false); }}
        />
      )}
    </div>
  );
}
