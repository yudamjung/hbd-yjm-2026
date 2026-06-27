import { useState } from 'react';
import { motion } from 'framer-motion';
import { getDecoration } from '../constants/decorations';
import { verifyPassword } from '../utils/crypto';
import { updateLetter } from '../utils/storage';
import { BIRTHDAY_NAME, MAX_LETTER_LENGTH } from '../constants/config';
import { parseYouTube } from '../utils/youtube';
import YouTubeAudio from './YouTubeAudio';
import cardLeftImg from '../assets/figma/card-left.png';
import iloveyouImg from '../assets/figma/iloveyou.png';

const LINE_H = 40;
const LETTER_FONT = "'MemomentKkukkukk', 'Noto Sans KR', sans-serif";
const SHORT_NAME = BIRTHDAY_NAME.slice(-2);

export default function LetterViewModal({ letter, isOwner, onClose, onUpdated }) {
  const [step, setStep] = useState(isOwner ? 'view' : 'auth');
  const [canEdit, setCanEdit] = useState(false); // 작성자 비번 인증 시 true
  const [pwInput, setPwInput] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(letter.content);
  const [draft, setDraft] = useState(letter.content);
  const [saving, setSaving] = useState(false);

  const deco = getDecoration(letter.decoration);
  const music = parseYouTube(letter.music);

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    setChecking(true);
    const ok = await verifyPassword(pwInput, letter.passwordHash);
    setChecking(false);
    if (ok) { setCanEdit(true); setStep('view'); }
    else setError('비밀번호가 일치하지 않아요.');
  }

  async function saveEdit() {
    if (saving) return;
    setSaving(true);
    await updateLetter(letter.id, { content: draft, decoration: letter.decoration });
    setContent(draft);
    setEditing(false);
    setSaving(false);
    onUpdated && onUpdated();
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#000000d8', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
        {/* 헤더 배지: (장식명) · (작성자)님의 편지 */}
        <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, textAlign: 'center' }}>
          <span style={{ marginRight: 6 }}>{deco?.emoji}</span>
          {deco?.label} · {letter.name}님의 편지
        </div>

        {step === 'auth' ? (
          /* ── 비밀번호 게이트 (작성자 본인만 열람) ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{
              background: '#fff', borderRadius: 20, padding: '30px 36px',
              width: '100%', maxWidth: 380, position: 'relative',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} style={closeX}>✕</button>
            <p style={{ fontFamily: LETTER_FONT, color: '#666', fontSize: '0.9rem', lineHeight: 1.7, textAlign: 'center', margin: '4px 0 22px' }}>
              이 편지는 {letter.name}님만 열어볼 수 있어요.<br />
              작성 시 사용한 비밀번호를 입력해주세요.
            </p>
            <form onSubmit={handleAuth}>
              <input
                type="password" value={pwInput} autoFocus
                onChange={(e) => { setPwInput(e.target.value); setError(''); }}
                placeholder="비밀번호 입력"
                style={{
                  width: '100%', boxSizing: 'border-box', background: '#f4f4f4',
                  border: 'none', borderRadius: 10, padding: '12px 14px',
                  fontFamily: 'sans-serif', fontSize: '0.95rem', color: '#333', outline: 'none', marginBottom: 10,
                }}
              />
              {error && <p style={{ color: '#e05555', fontSize: '0.82rem', margin: '0 0 10px' }}>{error}</p>}
              <button type="submit" disabled={checking} style={sageBtn}>
                {checking ? '확인 중...' : '편지 열어보기'}
              </button>
            </form>
          </motion.div>
        ) : (
          /* ── 버스데이 카드 형태 열람 ── */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            style={{ position: 'relative', width: 'min(900px, calc(100vw - 32px))' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 카드가 뜸과 동시에 배경음악 재생 (숨김, 소리만) */}
            {music && <YouTubeAudio videoId={music.id} start={music.start} />}
            <div style={{
              display: 'flex', width: '100%', aspectRatio: '972 / 703',
              borderRadius: 12, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
            }}>
              {/* 왼쪽 이미지 */}
              <div style={{ width: '45%', flexShrink: 0 }}>
                <img src={cardLeftImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              {/* 오른쪽 노트지 */}
              <div style={{ flex: 1, background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', padding: '5% 6% 5% 5%', overflow: 'hidden' }}>
                <img src={iloveyouImg} alt="" style={{ position: 'absolute', top: 0, right: 0, height: '52%', width: 'auto', objectFit: 'contain', pointerEvents: 'none', zIndex: 1 }} />

                {/* To. */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, position: 'relative', zIndex: 2 }}>
                  <span style={{ fontFamily: LETTER_FONT, fontSize: '0.95rem', color: '#222', fontWeight: 700, whiteSpace: 'nowrap' }}>To. {SHORT_NAME}</span>
                  <div style={{ flex: 1, borderBottom: '1px solid #bbb', marginLeft: 4, marginRight: '35%' }} />
                </div>

                {/* 내용 — 길면 스크롤 (점선은 내용과 함께 흐르도록 local 배경) */}
                <div style={{
                  position: 'relative', flex: 1, zIndex: 2, overflowY: 'auto',
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${LINE_H - 1}px, #ddd ${LINE_H - 1}px, #ddd ${LINE_H}px)`,
                  backgroundAttachment: 'local',
                }}>
                  {editing ? (
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value.slice(0, MAX_LETTER_LENGTH))}
                      autoFocus
                      style={{
                        position: 'relative', zIndex: 1, width: '70%', height: '100%',
                        background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                        fontFamily: LETTER_FONT, fontSize: '1rem', lineHeight: `${LINE_H}px`,
                        letterSpacing: '0.03em', color: '#222', padding: 0,
                      }}
                    />
                  ) : (
                    <p style={{
                      position: 'relative', zIndex: 1, width: '70%', margin: 0, minHeight: '100%',
                      fontFamily: LETTER_FONT, fontSize: '1rem', lineHeight: `${LINE_H}px`,
                      letterSpacing: '0.03em', color: '#222', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {content}
                    </p>
                  )}
                </div>

                {/* From. */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, position: 'relative', zIndex: 2, paddingLeft: '20%' }}>
                  <div style={{ flex: 1, borderBottom: '1px solid #bbb' }} />
                  <span style={{ fontFamily: LETTER_FONT, fontSize: '0.85rem', color: '#222', whiteSpace: 'nowrap' }}>From. {letter.name}</span>
                </div>

                {editing && (
                  <div style={{ position: 'absolute', bottom: 6, left: 10, fontSize: '0.68rem', color: '#bbb', zIndex: 3 }}>
                    {draft.length}/{MAX_LETTER_LENGTH}
                  </div>
                )}
              </div>
            </div>

            {/* 닫기 */}
            <button onClick={onClose} style={{ ...floatBtn, top: -14, right: -14 }}>✕</button>

            {/* 작성자 전용: 수정 / 저장 / 취소 */}
            {canEdit && !editing && (
              <button onClick={() => { setDraft(content); setEditing(true); }} style={editBtn}>✎ 수정하기</button>
            )}
            {editing && (
              <div style={{ position: 'absolute', bottom: -18, right: 8, display: 'flex', gap: 8 }}>
                <button onClick={() => setEditing(false)} style={{ ...pillBtn, background: '#ddd', color: '#444' }}>취소</button>
                <button onClick={saveEdit} disabled={saving} style={{ ...pillBtn, background: '#8bac8b', color: '#fff' }}>
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

const sageBtn = {
  width: '100%', background: '#8bac8b', border: 'none', borderRadius: 30,
  padding: '13px', color: '#fff', fontSize: '0.95rem', fontFamily: LETTER_FONT,
  fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em',
};

const closeX = {
  position: 'absolute', top: 14, right: 14, background: 'none', border: 'none',
  color: '#aaa', fontSize: '1.1rem', cursor: 'pointer',
};

const floatBtn = {
  position: 'absolute', width: 38, height: 38, borderRadius: '50%',
  background: '#1a1a1a', border: '1.5px solid #444', color: '#fff',
  fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
};

const pillBtn = {
  border: 'none', borderRadius: 20, padding: '8px 18px', fontSize: '0.85rem',
  fontFamily: LETTER_FONT, fontWeight: 700, cursor: 'pointer',
};

const editBtn = {
  position: 'absolute', bottom: -16, right: 8, ...pillBtn,
  background: '#fff', color: '#8bac8b', border: '1.5px solid #8bac8b',
};
