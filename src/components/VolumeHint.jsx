// 사운드가 재생될 때 "볼륨을 올려주세요" 안내 토스트.
// 브라우저는 기기 시스템 볼륨을 강제로 올릴 수 없어 안내만 표시한다.
// triggerKey가 새 값으로 바뀔 때마다 잠깐 나타났다 자동으로 사라진다.
// 한 번이라도 본 기기에는 다시 띄우지 않는다(localStorage).
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SEEN_KEY = 'hbd_volume_hint_seen';

export default function VolumeHint({ triggerKey, duration = 4000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!triggerKey) return;
    if (localStorage.getItem(SEEN_KEY)) return; // 이미 본 기기는 건너뜀
    localStorage.setItem(SEEN_KEY, '1');
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [triggerKey, duration]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          onClick={() => setVisible(false)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1a1a1aee',
            border: '1px solid #ffffff22',
            borderRadius: '24px',
            padding: '10px 20px',
            color: '#fff',
            fontSize: '0.85rem',
            zIndex: 400,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🔊 사운드가 있어요 — 무음이라면 볼륨을 올려주세요!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
