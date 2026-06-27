import { useState, useEffect } from 'react';
import { BIRTHDAY_DATE } from '../constants/config';

function pad(n) {
  return String(n).padStart(2, '0');
}

function getTimeLeft() {
  const now = new Date();
  const diff = BIRTHDAY_DATE - now;
  if (diff <= 0) return null;

  const totalSec = Math.floor(diff / 1000);
  const days    = Math.floor(totalSec / 86400);
  const hours   = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, totalSec };
}

export default function CountdownTimer({ onExpire }) {
  const [time, setTime] = useState(getTimeLeft);
  const isLastMinute = time && time.totalSec <= 60;

  useEffect(() => {
    const id = setInterval(() => {
      const t = getTimeLeft();
      if (!t) {
        clearInterval(id);
        onExpire?.();
      } else {
        setTime(t);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onExpire]);

  if (!time) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    }}>
      {isLastMinute && (
        <p style={{
          color: '#ffd700',
          fontSize: '1rem',
          letterSpacing: '0.15em',
          animation: 'pulse 1s ease-in-out infinite',
          marginBottom: '4px',
        }}>
          ✨ 곧 생일이에요! ✨
        </p>
      )}

      <div style={{
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-end',
      }}>
        {time.days > 0 && (
          <TimeUnit value={pad(time.days)} label="일" highlight={isLastMinute} />
        )}
        <TimeUnit value={pad(time.hours)} label="시간" highlight={isLastMinute} />
        <TimeUnit value={pad(time.minutes)} label="분" highlight={isLastMinute} />
        <TimeUnit value={pad(time.seconds)} label="초" highlight={isLastMinute} />
      </div>
    </div>
  );
}

function TimeUnit({ value, label, highlight }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: highlight ? '4rem' : '3.5rem',
        fontWeight: 700,
        color: highlight ? '#ffd700' : '#fff',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        transition: 'all 0.3s ease',
        animation: highlight ? 'pulse 1s ease-in-out infinite' : 'none',
        textShadow: highlight ? '0 0 20px #ffd700' : 'none',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '0.75rem',
        color: highlight ? '#ffd70099' : '#ffffff66',
        letterSpacing: '0.1em',
        marginTop: '4px',
      }}>
        {label}
      </div>
    </div>
  );
}
