// 케이크 위에 올릴 3D 장식 후보 (5종).
// shape: 'animal' | 'sheep' | 'paw' | 'heart' — DecorationModel이 형태별로 렌더.
// emoji는 편지 배지·목록 등 작은 UI용.
export const DECORATIONS = [
  { id: 'sheep',     label: '양',        emoji: '🐑', shape: 'sheep',  color: '#f1ebe0', face: '#5c5249' },
  { id: 'cat',       label: '고양이',    emoji: '🐱', shape: 'cat' },
  { id: 'paw',       label: '냥젤리',    emoji: '🐾', shape: 'paw',    color: '#f3ead9', bean: '#ed9a84' },
  { id: 'heartRed',  label: '빨간 하트', emoji: '❤️', shape: 'heart',  color: '#e23b4e' },
  { id: 'heartPink', label: '분홍 하트', emoji: '💗', shape: 'heart',  color: '#f4a9c4' },
];

export const getDecoration = (id) => DECORATIONS.find((d) => d.id === id);
