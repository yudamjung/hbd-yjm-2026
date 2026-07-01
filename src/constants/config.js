// 생일자 정보 및 앱 설정
export const BIRTHDAY_NAME = '양정민';
export const BIRTHDAY_AGE = 22; // 한국식 나이
export const BIRTHDAY_DATE = new Date('2026-07-02T00:00:00+09:00'); // KST 기준
// 편지 작성 마감 — 생일 당일(7/2) 23:59:59까지. 이후엔 케이크 페이지에서 편지 작성 불가
export const LETTER_DEADLINE = new Date('2026-07-03T00:00:00+09:00'); // KST 기준

// 오너(생일자) 인증 키 — .env의 VITE_OWNER_KEY 값과 일치해야 함
export const OWNER_KEY = import.meta.env.VITE_OWNER_KEY || 'birthday2026';

// 편지 제한
export const MAX_LETTERS = 15;
export const MAX_LETTER_LENGTH = 500;
