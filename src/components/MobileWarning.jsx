// 768px 미만 모바일 환경에서 표시되는 안내 화면
// 편지 작성은 모바일에서도 가능하도록 선택적으로 허용

import { useState } from 'react';
import { BIRTHDAY_NAME } from '../constants/config';
import LetterFormModal from './LetterFormModal';

export default function MobileWarning() {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

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
          maxWidth: '280px',
        }}>
          이 페이지는 태블릿(iPad) 또는<br />
          PC 환경에서 최적화되어 있어요.<br />
          더 예쁜 케이크를 보고 싶다면<br />
          큰 화면으로 접속해주세요 🌟
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
          onClose={() => { setShowForm(false); setEditMode(false); }}
        />
      )}
    </div>
  );
}
