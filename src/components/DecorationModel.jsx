// 장식 형태별 3D 모델 디스패처. 정면은 +Z, 바닥은 y=0.
import { useMemo } from 'react';
import * as THREE from 'three';
import AnimalModel from './AnimalModel';
import { getDecoration } from '../constants/decorations';

const PINK = '#f4a9c4';
const DARK = '#241c18';

// ── 하트 (퍼피한 입체 하트) ────────────────────────────
const heartShape = new THREE.Shape();
heartShape.moveTo(0, 0.4);
heartShape.bezierCurveTo(0, 0.62, -0.4, 0.95, -0.7, 0.55);
heartShape.bezierCurveTo(-1.02, 0.12, -0.45, -0.4, 0, -0.82);
heartShape.bezierCurveTo(0.45, -0.4, 1.02, 0.12, 0.7, 0.55);
heartShape.bezierCurveTo(0.4, 0.95, 0, 0.62, 0, 0.4);

function HeartModel({ d }) {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.5, bevelEnabled: true, bevelSize: 0.18, bevelThickness: 0.16, bevelSegments: 5, steps: 1,
    });
    g.center();
    return g;
  }, []);
  return (
    <group position={[0, 0.72, 0]} rotation={[-0.12, 0, 0]} scale={0.66}>
      <mesh geometry={geo}>
        <meshStandardMaterial color={d.color} roughness={0.32} metalness={0.05} />
      </mesh>
    </group>
  );
}

// ── 냥젤리 (고양이 발바닥 + 코랄 젤리) ─────────────────
function PawModel({ d }) {
  const pad = d.color;
  const bean = d.bean || PINK;
  return (
    <group>
      {/* 메인 둥근 패드 */}
      <mesh position={[0, 0.5, 0]} scale={[1.18, 1.05, 0.62]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial color={pad} roughness={0.85} />
      </mesh>
      {/* 위쪽 토우 솜 3개 (봉긋한 실루엣) */}
      {[[-0.32, 0.84, 0.18], [0, 0.97, 0.2], [0.32, 0.84, 0.18]].map((p, i) => (
        <mesh key={i} position={p} scale={[0.62, 0.62, 0.5]}>
          <sphereGeometry args={[0.27, 16, 16]} />
          <meshStandardMaterial color={pad} roughness={0.85} />
        </mesh>
      ))}
      {/* 중앙 큰 젤리 */}
      <mesh position={[0, 0.42, 0.35]} scale={[1.3, 1.1, 0.72]}>
        <sphereGeometry args={[0.23, 18, 18]} />
        <meshStandardMaterial color={bean} roughness={0.45} />
      </mesh>
      {/* 발가락 젤리 3개 (아치) */}
      {[[-0.29, 0.82, 0.42], [0, 0.96, 0.44], [0.29, 0.82, 0.42]].map((p, i) => (
        <mesh key={i} position={p} scale={[1, 1.15, 0.72]}>
          <sphereGeometry args={[0.105, 14, 14]} />
          <meshStandardMaterial color={bean} roughness={0.45} />
        </mesh>
      ))}
    </group>
  );
}

// ── 양 (양털 몸통 + 어두운 얼굴) ───────────────────────
function SheepModel({ d }) {
  const wool = d.color;
  const fc = d.face || '#5c5249';
  const bumps = [
    [0, 0.5, 0, 0.46], [-0.34, 0.55, 0.05, 0.26], [0.34, 0.55, 0.05, 0.26],
    [-0.2, 0.8, 0.08, 0.24], [0.2, 0.8, 0.08, 0.24], [0, 0.85, 0, 0.27],
    [-0.3, 0.35, 0.26, 0.22], [0.3, 0.35, 0.26, 0.22], [0, 0.4, 0.34, 0.24],
  ];
  return (
    <group>
      {bumps.map((b, i) => (
        <mesh key={i} position={[b[0], b[1], b[2]]}>
          <sphereGeometry args={[b[3], 14, 14]} />
          <meshStandardMaterial color={wool} roughness={0.97} />
        </mesh>
      ))}
      {/* 얼굴 */}
      <mesh position={[0, 1.02, 0.2]} scale={[0.92, 1, 0.95]}>
        <sphereGeometry args={[0.27, 18, 18]} />
        <meshStandardMaterial color={fc} roughness={0.85} />
      </mesh>
      {/* 이마 양털 */}
      <mesh position={[0, 1.22, 0.12]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color={wool} roughness={0.97} />
      </mesh>
      {/* 귀 */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 1.04, 0.18]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]} scale={[0.6, 0.32, 0.4]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color={fc} roughness={0.85} />
        </mesh>
      ))}
      {/* 눈 */}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 1.05, 0.42]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.4} />
        </mesh>
      ))}
      {/* 볼터치 */}
      {[-0.17, 0.17].map((x, i) => (
        <mesh key={i} position={[x, 0.96, 0.38]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={PINK} roughness={0.7} />
        </mesh>
      ))}
      {/* 다리 */}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0.18]}>
          <cylinderGeometry args={[0.06, 0.06, 0.24, 8]} />
          <meshStandardMaterial color={fc} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

export default function DecorationModel({ type }) {
  const d = getDecoration(type);
  if (!d) return null;
  if (d.shape === 'heart') return <HeartModel d={d} />;
  if (d.shape === 'paw') return <PawModel d={d} />;
  if (d.shape === 'sheep') return <SheepModel d={d} />;
  return <AnimalModel type={type} />;
}
