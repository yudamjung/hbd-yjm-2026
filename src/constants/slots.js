// 케이크 윗면(숫자초 주변)의 3D 슬롯. x/z 평면 좌표 + rot(Y축 yaw, 안쪽으로 살짝 틀기).
// 앞쪽(z+)의 "Happy Birthday 양정민" 문구는 가리지 않도록 뒤·옆 위주로 배치.
// 새 편지가 등록되면 비어있는 슬롯에 랜덤 배정.
export const SLOTS = [
  { x: 0.0,   z: -1.5,  rot: 0 },
  { x: -0.8,  z: -1.35, rot: 0.18 }, { x: 0.8,  z: -1.35, rot: -0.18 },
  { x: -0.5,  z: -0.7,  rot: 0.12 }, { x: 0.5,  z: -0.7,  rot: -0.12 },
  { x: -1.45, z: -0.95, rot: 0.4 },  { x: 1.45, z: -0.95, rot: -0.4 },
  { x: -1.65, z: -0.2,  rot: 0.55 }, { x: 1.65, z: -0.2,  rot: -0.55 },
  { x: -1.5,  z: 0.45,  rot: 0.6 },  { x: 1.5,  z: 0.45,  rot: -0.6 },
  { x: -0.95, z: 0.55,  rot: 0.35 }, { x: 0.95, z: 0.55,  rot: -0.35 },
  { x: -1.1,  z: -1.55, rot: 0.25 }, { x: 1.1,  z: -1.55, rot: -0.25 },
];

export const getAvailableSlot = (usedSlotIndices) => {
  const available = SLOTS
    .map((_, i) => i)
    .filter((i) => !usedSlotIndices.includes(i));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};
