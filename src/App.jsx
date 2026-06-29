import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CountdownPage from './pages/CountdownPage';
import CakePage from './pages/CakePage';
import AccessWarning from './components/AccessWarning';
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

// 사파리(데스크톱·iOS) 감지 — Chrome/Edge/Firefox 등은 제외
function isSafari() {
  const ua = navigator.userAgent;
  return /^((?!chrome|android|crios|fxios|edg|opr).)*safari/i.test(ua);
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

  // 사파리: 배경음악 등 일부 기능이 막혀 Chrome 권장 (전체 차단)
  if (isSafari()) {
    return (
      <AccessWarning>
        이 사이트는 <b style={{ color: '#ffffffaa' }}>Chrome</b>에 최적화되어 있어요.<br />
        Safari에서는 일부 기능이<br />
        정상 동작하지 않을 수 있어요.<br />
        Chrome으로 접속해주세요 🌟
      </AccessWarning>
    );
  }

  // 모바일: 카운트다운부터 전체 차단 (편지는 작성 가능)
  if (mobile) {
    return (
      <AccessWarning>
        이 페이지는 태블릿(iPad) 또는<br />
        PC(Chrome) 환경에 최적화되어 있어요.<br />
        더 예쁜 화면으로 보고 싶다면<br />
        큰 화면으로 접속해주세요 🌟
      </AccessWarning>
    );
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
