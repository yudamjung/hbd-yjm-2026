import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DECORATIONS, getDecoration } from '../constants/decorations';
import DecorationPicker, { AnimalSpinPreview } from './DecorationPicker';
import { MAX_LETTER_LENGTH, MAX_LETTERS, BIRTHDAY_NAME } from '../constants/config';
import { addLetter, updateLetter } from '../utils/storage';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { parseYouTube } from '../utils/youtube';
import YouTubeAudio from './YouTubeAudio';
import cardLeftImg from '../assets/figma/card-left.png';
import iloveyouImg from '../assets/figma/iloveyou.png';

const LINE_H = 46;
const SHORT_NAME = BIRTHDAY_NAME.slice(-2); // '정민'
const LETTER_FONT = "'MemomentKkukkukk', 'Noto Sans KR', sans-serif";

export default function LetterFormModal({ editMode, letters = [], onClose }) {
  // 메인 스텝: 'auth' | 'writing' | 'decoration' | 'done'
  const [step, setStep] = useState(editMode ? 'auth' : 'writing');
  const [editingId, setEditingId] = useState(null);

  // 편지 내용
  const [content, setContent] = useState('');
  const [senderName, setSenderName] = useState('');
  const [password, setPassword] = useState('');
  const [decoration, setDecoration] = useState(DECORATIONS[0].id);
  const [musicUrl, setMusicUrl] = useState(''); // 배경음악 유튜브 링크 (선택)

  // From. 클릭으로 열리는 이름/비번 모달 (카드 위 오버레이)
  const [showCredModal, setShowCredModal] = useState(false);
  const credSet = senderName !== ''; // 이름/비번이 설정됐는지

  const [error, setError] = useState('');
  const [credError, setCredError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ── 수정 모드 인증 ── */
  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    const inputName = e.target.authName.value.trim();
    const inputPw = e.target.authPw.value;
    const letter = letters.find((l) => l.name.trim().toLowerCase() === inputName.toLowerCase());
    if (!letter) { setError('해당 이름으로 작성된 편지를 찾을 수 없어요.'); return; }
    const ok = await verifyPassword(inputPw, letter.passwordHash);
    if (!ok) { setError('비밀번호가 일치하지 않아요.'); return; }
    setSenderName(letter.name);
    setContent(letter.content);
    setDecoration(letter.decoration);
    setMusicUrl(letter.music || '');
    setEditingId(letter.id);
    setStep('writing');
  }

  /* ── 이름/비번 모달 완료 ── */
  async function handleCredSubmit(e) {
    e.preventDefault();
    setCredError('');
    const inputName = e.target.credName.value.trim();
    const inputPw = e.target.credPw.value;
    if (!inputName) { setCredError('이름을 입력해주세요.'); return; }
    if (!inputPw) { setCredError('비밀번호를 입력해주세요.'); return; }
    // 이름 중복 체크 (수정 모드가 아닐 때만)
    if (!editingId) {
      const existing = letters.find((l) => l.name.trim().toLowerCase() === inputName.toLowerCase());
      if (existing) { setCredError('이미 같은 이름으로 작성된 편지가 있어요.'); return; }
    }
    setSenderName(inputName);
    setPassword(inputPw);
    setShowCredModal(false);
  }

  /* ── → 버튼: 데코레이션으로 ── */
  function handleArrow() {
    if (!content.trim()) { setError('편지 내용을 입력해주세요.'); return; }
    if (!credSet) { setError('From. 을 눌러 이름과 비밀번호를 설정해주세요.'); return; }
    setError('');
    setStep('decoration');
  }

  /* ── 동물 선택 → 저장 ── */
  async function handleSubmit(decoId) {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    const music = musicUrl.trim();
    if (music && !parseYouTube(music)) {
      setError('유튜브 링크를 확인해주세요.'); setSubmitting(false); return;
    }
    try {
      if (editingId) {
        await updateLetter(editingId, { content, decoration: decoId, music });
      } else {
        if (letters.length >= MAX_LETTERS) {
          setError('케이크가 이미 가득 찼어요 🎂'); setSubmitting(false); return;
        }
        const passwordHash = await hashPassword(password);
        const result = await addLetter({ name: senderName, passwordHash, content, decoration: decoId, music }, letters);
        if (!result.ok) { setError('자리가 모두 찼어요 🎂'); setSubmitting(false); return; }
      }
      setDecoration(decoId);
      setStep('done');
    } catch {
      setError('오류가 발생했어요. 다시 시도해주세요.');
    }
    setSubmitting(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }}>
      <AnimatePresence mode="wait">

        {/* ── 수정 모드 인증 ── */}
        {step === 'auth' && (
          <motion.div key="auth"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={whiteBoxStyle}
          >
            <button onClick={onClose} style={closeXStyle}>✕</button>
            <h2 style={modalTitleStyle}>내 편지 수정하기</h2>
            <p style={modalSubStyle}>작성 시 입력한 이름과 비밀번호를 입력해주세요.</p>
            <form onSubmit={handleAuth} style={{ width: '100%' }}>
              <FormInput name="authName" placeholder="이름" />
              <FormInput name="authPw" type="password" placeholder="비밀번호" />
              {error && <p style={errStyle}>{error}</p>}
              <button type="submit" style={sageBtn}>확인</button>
            </form>
          </motion.div>
        )}

        {/* ── 편지 카드 ── */}
        {step === 'writing' && (
          <motion.div key="writing"
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'relative', width: 'min(920px, calc(100vw - 32px))' }}
          >
            {/* 수정 모드: 카드가 뜨면 저장된 배경음악 재생 */}
            {editingId && parseYouTube(musicUrl) && (
              <YouTubeAudio videoId={parseYouTube(musicUrl).id} start={parseYouTube(musicUrl).start} />
            )}
            {/* 카드 본체 */}
            <div style={{
              display: 'flex',
              width: '100%',
              aspectRatio: '972 / 703',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}>
              {/* 왼쪽: 이미지 */}
              <div style={{ width: '45%', flexShrink: 0 }}>
                <img src={cardLeftImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>

              {/* 오른쪽: 노트지 */}
              <div style={{
                flex: 1,
                background: '#fff',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                padding: '5% 6% 5% 5%',
                overflow: 'hidden',
              }}>
                {/* i love you 이미지 — 우상단 고정 */}
                <img src={iloveyouImg} alt="" style={{
                  position: 'absolute', top: 0, right: 0,
                  height: '55%', width: 'auto',
                  objectFit: 'contain',
                  pointerEvents: 'none', zIndex: 1,
                }} />

                {/* To. 정민 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginBottom: 2, position: 'relative', zIndex: 2,
                }}>
                  <span style={{ fontFamily: LETTER_FONT, fontSize: '0.95rem', color: '#222', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    To. {SHORT_NAME}
                  </span>
                  <div style={{ flex: 1, borderBottom: '1px solid #bbb', marginLeft: 4, marginRight: '35%' }} />
                </div>

                {/* 점선 노트 + textarea */}
                <div style={{ position: 'relative', flex: 1, zIndex: 2 }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: `repeating-linear-gradient(
                      to bottom,
                      transparent 0px,
                      transparent ${LINE_H - 1}px,
                      #ddd ${LINE_H - 1}px,
                      #ddd ${LINE_H}px
                    )`,
                    pointerEvents: 'none',
                  }} />
                  <textarea
                    value={content}
                    onChange={e => {
                      setContent(e.target.value.slice(0, MAX_LETTER_LENGTH));
                      if (error) setError('');
                    }}
                    placeholder={'이곳을 클릭하면\n편지를 작성할 수 있습니다.'}
                    style={{
                      position: 'relative', zIndex: 1,
                      width: '68%',
                      height: '100%',
                      background: 'transparent',
                      border: 'none', outline: 'none', resize: 'none',
                      fontFamily: LETTER_FONT,
                      fontSize: '1rem',
                      lineHeight: `${LINE_H}px`,
                      letterSpacing: '0.03em',
                      color: '#222',
                      padding: 0,
                    }}
                  />
                </div>

                {/* From. — 클릭하면 이름/비번 모달 오픈 */}
                <div
                  onClick={() => { setCredError(''); setShowCredModal(true); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    marginTop: 6, position: 'relative', zIndex: 2,
                    paddingLeft: '20%',
                    cursor: 'pointer',
                  }}
                  title="클릭하여 이름과 비밀번호 설정"
                >
                  <div style={{ flex: 1, borderBottom: '1px solid #bbb' }} />
                  <span style={{
                    fontFamily: LETTER_FONT,
                    fontSize: '0.85rem',
                    color: credSet ? '#222' : '#aaa',
                    whiteSpace: 'nowrap',
                    textDecoration: credSet ? 'none' : 'underline dotted #aaa',
                  }}>
                    From. {senderName || '작성자이름'}
                  </span>
                </div>

                {/* 글자 수 */}
                <div style={{ position: 'absolute', bottom: 6, left: 10, fontSize: '0.68rem', color: '#bbb', zIndex: 3 }}>
                  {content.length}/{MAX_LETTER_LENGTH}
                </div>

                {/* 에러 */}
                {error && (
                  <p style={{ ...errStyle, position: 'absolute', bottom: 24, left: 10, right: 10, zIndex: 3 }}>
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* 닫기 버튼 */}
            <button onClick={onClose} style={{ ...floatBtnStyle, top: -14, right: -14 }}>✕</button>
            {/* 화살표 버튼 */}
            <button onClick={handleArrow} style={{ ...floatBtnStyle, bottom: -14, right: -14, fontSize: '1.1rem' }}>→</button>

            {/* ── 이름/비번 모달 오버레이 (From. 클릭 시) ── */}
            <AnimatePresence>
              {showCredModal && (
                <motion.div
                  key="cred-overlay"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={e => { if (e.target === e.currentTarget) setShowCredModal(false); }}
                  style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 200,
                    padding: '16px',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    style={whiteBoxStyle}
                    onClick={e => e.stopPropagation()}
                  >
                    <button onClick={() => setShowCredModal(false)} style={closeXStyle}>✕</button>
                    <h2 style={modalTitleStyle}>
                      작성자의 이름과 비밀번호를 설정해주세요
                    </h2>
                    <p style={modalSubStyle}>
                      추후 편지 내용 수정이 필요한 경우에<br />비밀번호가 사용됩니다.
                    </p>
                    <form onSubmit={handleCredSubmit} style={{ width: '100%' }}>
                      <div style={credRowStyle}>
                        <span style={credLabelStyle}>작성자 이름</span>
                        <input
                          name="credName"
                          defaultValue={senderName}
                          style={credInputStyle}
                          autoFocus
                          placeholder="이름을 입력해주세요"
                        />
                      </div>
                      <div style={credRowStyle}>
                        <span style={credLabelStyle}>비밀번호</span>
                        <input
                          name="credPw"
                          type="password"
                          defaultValue={password}
                          style={{ ...credInputStyle, fontFamily: 'sans-serif' }}
                          placeholder="비밀번호를 입력해주세요"
                        />
                      </div>
                      {credError && <p style={errStyle}>{credError}</p>}
                      <button type="submit" style={sageBtn}>완료</button>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── 동물 장식 선택 ── */}
        {step === 'decoration' && (
          <motion.div key="decoration"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36 }}
          >
            <h2 style={{ color: '#fff', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontWeight: 800, margin: 0 }}>
              케이크에 올릴 친구를 고르세요
            </h2>
            {error && <p style={errStyle}>{error}</p>}

            {/* 빙글빙글 도는 3D 후보들 */}
            <div style={{ width: 'min(940px, 94vw)' }}>
              <DecorationPicker selected={decoration} onSelect={setDecoration} />
            </div>

            <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, margin: 0, minHeight: 24 }}>
              {getDecoration(decoration)?.label}
            </p>

            {/* 배경음악 (유튜브 링크, 선택) */}
            <div style={{ width: 'min(420px, 90vw)', textAlign: 'center' }}>
              <label style={{ display: 'block', color: '#ffffffaa', fontSize: '0.85rem', marginBottom: 8 }}>
                🎵 배경음악 (유튜브 링크, 선택)
              </label>
              <input
                type="url"
                value={musicUrl}
                onChange={(e) => { setMusicUrl(e.target.value); if (error) setError(''); }}
                placeholder="https://youtu.be/..."
                style={{
                  width: '100%', boxSizing: 'border-box', background: '#1c1c1c',
                  border: '1px solid #ffffff22', borderRadius: 10, padding: '11px 14px',
                  color: '#fff', fontSize: '0.9rem', outline: 'none',
                }}
              />
              <p style={{ color: '#ffffff44', fontSize: '0.72rem', margin: '8px 0 0' }}>
                생일자가 카드를 열 때 이 노래가 흘러나와요
              </p>
            </div>

            <button
              onClick={() => !submitting && handleSubmit(decoration)}
              disabled={submitting}
              style={{ ...sageBtn, width: 'auto', padding: '13px 40px', marginTop: 0, opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? '올리는 중...' : '이 친구로 결정 🎂'}
            </button>
            <p style={{ color: '#ffffff44', fontSize: '0.8rem', margin: 0 }}>
              마음에 드는 친구를 누르면 케이크에 올라가요
            </p>
          </motion.div>
        )}

        {/* ── 완료 ── */}
        {step === 'done' && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ width: 200, height: 200, margin: '0 auto 16px' }}>
              <AnimalSpinPreview type={decoration} />
            </div>
            <h2 style={{ color: '#fff', marginBottom: 10, fontSize: '1.4rem' }}>
              {editingId ? '편지가 수정됐어요!' : '편지를 케이크에 붙였어요!'}
            </h2>
            <p style={{ color: '#ffffff66', fontSize: '0.9rem', marginBottom: 32, lineHeight: 1.7 }}>
              생일 당일에 {SHORT_NAME}이가 확인할 수 있어요 🎉
            </p>
            <button onClick={onClose} style={{ ...sageBtn, width: 'auto', padding: '12px 36px', display: 'inline-block' }}>
              닫기
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

/* ── 스타일 ── */

const whiteBoxStyle = {
  background: '#fff',
  borderRadius: 20,
  padding: '30px 80px',
  width: '100%',
  maxWidth: 440,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
};

const modalTitleStyle = {
  fontSize: '1.15rem',
  fontFamily: "'HSSaemaeul', sans-serif",
  fontWeight: 800,
  color: '#111',
  textAlign: 'center',
  margin: '0 0 10px',
  lineHeight: 1.5,
};

const modalSubStyle = {
  fontSize: '0.83rem',
  fontFamily: "'GriunMongtori', sans-serif",
  color: '#888',
  textAlign: 'center',
  lineHeight: 1.7,
  margin: '0 0 24px',
};

const credRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 12,
  width: '100%',
};

const credLabelStyle = {
  fontSize: '0.85rem',
  fontFamily: "'GriunMongtori', sans-serif",
  color: '#333',
  fontWeight: 700,
  whiteSpace: 'nowrap',
  width: 72,
  flexShrink: 0,
};

const credInputStyle = {
  flex: 1,
  background: '#f4f4f4',
  border: 'none',
  borderRadius: 8,
  padding: '10px 14px',
  fontSize: '0.9rem',
  outline: 'none',
  color: '#333',
  fontFamily: "'MemomentKkukkukk', 'Noto Sans KR', sans-serif",
};

const sageBtn = {
  width: '100%',
  background: '#8bac8b',
  border: 'none',
  borderRadius: 30,
  padding: '13px',
  color: '#fff',
  fontSize: '0.95rem',
  fontFamily: "'GriunMongtori', sans-serif",
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: 8,
  letterSpacing: '0.04em',
};

const floatBtnStyle = {
  position: 'absolute',
  width: 38, height: 38,
  borderRadius: '50%',
  background: '#1a1a1a',
  border: '1.5px solid #444',
  color: '#fff',
  fontSize: '1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
};

const errStyle = {
  color: '#e05555',
  fontSize: '0.82rem',
  margin: '0 0 8px',
};

const closeXStyle = {
  position: 'absolute',
  top: 14, right: 14,
  background: 'none', border: 'none',
  color: '#aaa', fontSize: '1.1rem',
  cursor: 'pointer',
};

function FormInput({ name, type = 'text', placeholder }) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      style={{
        ...credInputStyle,
        width: '100%',
        marginBottom: 12,
        ...(type === 'password' && { fontFamily: 'sans-serif' }),
      }}
    />
  );
}
