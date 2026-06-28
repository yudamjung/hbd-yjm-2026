import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CountdownPage from './pages/CountdownPage';
import CakePage from './pages/CakePage';
import MobileWarning from './components/MobileWarning';
import { BIRTHDAY_DATE } from './constants/config';

function isBirthday() {
  return new Date() >= BIRTHDAY_DATE;
}

// 미리보기용: ?view=cake / ?view=countdown 로 강제 진입
function forcedView() {
  const v = new URLSearchParams(window.location.search).get('view');
  return v === 'cake' || v === 'countdown' ? v : null;
}

// 데모용: ?demo=video 로 접속 시 새로고침마다 1분 10초 남은 카운트다운으로 시작
// (10초 뒤 60초 지점에서 영상 자동재생 → 0초에 케이크로 전환)
function demoMode() {
  return new URLSearchParams(window.location.search).get('demo') === 'video';
}

function isMobile() {
  return window.innerWidth < 768;
}

export default function App() {
  const [demoDeadline] = useState(() => (demoMode() ? new Date(Date.now() + 70_000) : undefined));
  const [phase, setPhase] = useState(() =>
    demoMode() ? 'countdown' : (forcedView() ?? (isBirthday() ? 'cake' : 'countdown'))
  );
  const [mobile, setMobile] = useState(isMobile);

  useEffect(() => {
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleExpire() {
    setPhase('cake');
  }

  // 모바일: 케이크 페이지는 경고 표시, 카운트다운은 그대로 유지
  if (mobile && phase === 'cake') {
    return <MobileWarning />;
  }

  return (
    <AnimatePresence mode="wait">
      {phase === 'countdown' ? (
        <motion.div
          key="countdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <CountdownPage onExpire={handleExpire} deadline={demoDeadline} />
        </motion.div>
      ) : (
        <motion.div
          key="cake"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <CakePage />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
