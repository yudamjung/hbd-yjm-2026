import { getAvailableSlot } from '../constants/slots';

const STORAGE_KEY = 'hbd_letters';
const CANDLE_KEY = 'hbd_candle_blown';

// --- 편지 CRUD ---

export function getLetters() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLetters(letters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
}

export function addLetter({ name, passwordHash, content, decoration }) {
  const letters = getLetters();
  const usedSlots = letters.map((l) => l.slot);
  const slot = getAvailableSlot(usedSlots);
  if (slot === null) return { ok: false, reason: 'full' };

  const letter = {
    id: crypto.randomUUID(),
    name,
    passwordHash,
    content,
    decoration,
    slot,
    createdAt: new Date().toISOString(),
  };
  letters.push(letter);
  saveLetters(letters);
  return { ok: true, letter };
}

export function updateLetter(id, { content, decoration }) {
  const letters = getLetters();
  const idx = letters.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  letters[idx] = { ...letters[idx], content, decoration };
  saveLetters(letters);
  return true;
}

export function findLetterByName(name) {
  return getLetters().find(
    (l) => l.name.trim().toLowerCase() === name.trim().toLowerCase()
  ) || null;
}

// --- 촛불 상태 ---

export function isCandleBlown() {
  return localStorage.getItem(CANDLE_KEY) === 'true';
}

export function setCandleBlown() {
  localStorage.setItem(CANDLE_KEY, 'true');
}
