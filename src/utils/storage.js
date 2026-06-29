import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { getAvailableSlot } from '../constants/slots';

const CANDLE_KEY = 'hbd_candle_blown';
const LETTERS = 'letters';

// --- 편지 CRUD (Firestore) ---

// 실시간 구독: 케이크/카운트다운이 항상 최신 편지 목록을 캐시로 들고 있게 함.
export function subscribeLetters(onUpdate) {
  return onSnapshot(
    collection(db, LETTERS),
    (snap) => {
      const letters = [];
      snap.forEach((d) => letters.push({ id: d.id, ...d.data() }));
      onUpdate(letters);
    },
    (e) => console.error('letters 구독 오류:', e),
  );
}

export async function getLetters() {
  try {
    const snap = await getDocs(collection(db, LETTERS));
    const letters = [];
    snap.forEach((d) => letters.push({ id: d.id, ...d.data() }));
    return letters;
  } catch (e) {
    console.error('letters 조회 오류:', e);
    return [];
  }
}

// existingLetters(구독 캐시)를 넘기면 추가 조회 없이 슬롯 계산 → 쓰기 1회만 발생(빠름).
export async function addLetter({ name, passwordHash, content, decoration, music = '' }, existingLetters) {
  try {
    const letters = existingLetters || (await getLetters());
    const slot = getAvailableSlot(letters.map((l) => l.slot));
    if (slot === null) return { ok: false, reason: 'full' };

    const data = { name, passwordHash, content, decoration, music, slot, createdAt: new Date().toISOString() };
    const ref = await addDoc(collection(db, LETTERS), data);
    return { ok: true, letter: { id: ref.id, ...data } };
  } catch (e) {
    console.error('letter 추가 오류:', e);
    return { ok: false, reason: 'error' };
  }
}

export async function updateLetter(id, { content, decoration, music }) {
  try {
    const fields = { content, decoration };
    if (music !== undefined) fields.music = music; // 미제공 시 기존값 보존
    await updateDoc(doc(db, LETTERS, id), fields);
    return true;
  } catch (e) {
    console.error('letter 수정 오류:', e);
    return false;
  }
}

export async function findLetterByName(name, existingLetters) {
  const letters = existingLetters || (await getLetters());
  return letters.find((l) => l.name.trim().toLowerCase() === name.trim().toLowerCase()) || null;
}

// --- 촛불 상태 (기기별로 기억하도록 localStorage 유지) ---

export function isCandleBlown() {
  return localStorage.getItem(CANDLE_KEY) === 'true';
}

export function setCandleBlown() {
  localStorage.setItem(CANDLE_KEY, 'true');
}

export function setCandleLit() {
  localStorage.removeItem(CANDLE_KEY);
}
