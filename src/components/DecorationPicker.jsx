// 후보 선택 — 각 후보가 자기 타일 안에서 크게 빙글빙글 회전. 타일 클릭으로 선택.
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import DecorationModel from './DecorationModel';
import { DECORATIONS } from '../constants/decorations';

function SpinOne({ type, scale = 1.05, y = -0.8 }) {
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.9; });
  return (
    <group ref={ref} position={[0, y, 0]} scale={scale}>
      <DecorationModel type={type} />
    </group>
  );
}

function MiniCanvas({ type }) {
  return (
    <Canvas camera={{ position: [0, 0, 3.6], fov: 32 }} gl={{ alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 6, 5]} intensity={1.0} />
      <pointLight position={[-4, 2, 3]} intensity={0.4} color="#c5b3e6" />
      <SpinOne type={type} />
    </Canvas>
  );
}

export default function DecorationPicker({ selected, onSelect, isMobile = false }) {
  const cardW = isMobile ? 132 : 168;
  const cardH = isMobile ? 162 : 204;
  const canvasH = isMobile ? 118 : 152;
  return (
    <div style={{ display: 'flex', gap: isMobile ? 10 : 14, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      {DECORATIONS.map((d) => {
        const on = selected === d.id;
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelect(d.id)}
            style={{
              width: cardW, height: cardH, borderRadius: 20, padding: '12px 0 0',
              border: `2px solid ${on ? '#f3a9c4' : '#ffffff22'}`,
              background: on ? 'rgba(243,169,196,0.12)' : '#1c1c1c',
              cursor: 'pointer', overflow: 'hidden',
              transform: on ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform .15s, border-color .15s, background .15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            <div style={{ width: '100%', height: canvasH, pointerEvents: 'none' }}>
              <MiniCanvas type={d.id} />
            </div>
            <span style={{ color: on ? '#fff' : '#ddd', fontSize: '0.88rem', fontWeight: 700 }}>{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// 완료 화면용 단일 회전 미리보기
export function AnimalSpinPreview({ type }) {
  return (
    <Canvas camera={{ position: [0, 0, 3.9], fov: 34 }} gl={{ alpha: true }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 6, 5]} intensity={1.0} />
      <pointLight position={[-4, 2, 3]} intensity={0.4} color="#c5b3e6" />
      <SpinOne type={type} scale={1.15} y={-0.85} />
    </Canvas>
  );
}
