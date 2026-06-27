import { useState } from 'react';
import { motion } from 'framer-motion';
import { getDecoration } from '../constants/decorations';
import { verifyPassword } from '../utils/crypto';

export default function LetterViewModal({ letter, isOwner, onClose }) {
  const [step, setStep] = useState(isOwner ? 'view' : 'auth');
  const [pwInput, setPwInput] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const deco = getDecoration(letter.decoration);

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    setChecking(true);
    const ok = await verifyPassword(pwInput, letter.passwordHash);
    setChecking(false);
    if (ok) {
      setStep('view');
    } else {
      setError('비밀번호가 일치하지 않아요.');
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000cc',
        backdropFilter: 'blur(6px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          background: '#0e0e0e',
          border: `1px solid ${deco?.color ?? '#333'}44`,
          borderRadius: '20px',
          padding: '28px 24px',
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          boxShadow: `0 0 40px ${deco?.color ?? '#7b2d8b'}22`,
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'none', border: 'none', color: '#ffffff55',
            fontSize: '1.1rem', cursor: 'pointer',
          }}
        >✕</button>

        {/* 장식 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span style={{
            background: (deco?.color ?? '#7b2d8b') + '33',
            border: `1px solid ${deco?.color ?? '#7b2d8b'}66`,
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '0.85rem',
            color: deco?.color ?? '#fff',
          }}>
            {deco?.emoji} {deco?.label}
          </span>
          <span style={{ color: '#ffffff44', fontSize: '0.8rem' }}>
            {letter.name}의 편지
          </span>
        </div>

        {step === 'auth' ? (
          <form onSubmit={handleAuth}>
            <p style={{ color: '#ffffff77', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6 }}>
              이 편지는 {letter.name}님만 열어볼 수 있어요.<br />
              작성 시 사용한 비밀번호를 입력해주세요.
            </p>
            <input
              type="password"
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
              value={pwInput}
              onChange={e => setPwInput(e.target.value)}
              placeholder="비밀번호 입력"
              autoFocus
            />
            {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '8px' }}>{error}</p>}
            <button
              type="submit"
              disabled={checking}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #7b2d8b, #e63946)',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {checking ? '확인 중...' : '열어보기'}
            </button>
          </form>
        ) : (
          <div>
            <p style={{
              color: '#ffffffcc',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {letter.content}
            </p>
            <p style={{
              color: '#ffffff33',
              fontSize: '0.78rem',
              marginTop: '20px',
              textAlign: 'right',
            }}>
              — {letter.name}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
