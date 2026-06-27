// 생일자 정보 및 앱 설정
export const BIRTHDAY_NAME = '양정민';
export const BIRTHDAY_AGE = 22; // 한국식 나이
export const BIRTHDAY_DATE = new Date('2026-07-02T00:00:00+09:00'); // KST 기준

// 오너(생일자) 인증 키 — .env의 VITE_OWNER_KEY 값과 일치해야 함
export const OWNER_KEY = import.meta.env.VITE_OWNER_KEY || 'birthday2026';

// 편지 제한
export const MAX_LETTERS = 15;
export const MAX_LETTER_LENGTH = 500;
