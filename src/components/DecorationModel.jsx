// 장식 형태별 3D 모델 디스패처. 정면은 +Z, 바닥은 y≈0.
import { useMemo } from 'react';
import * as THREE from 'three';
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
      {/* 둥근 패드 */}
      <mesh position={[0, 0.55, 0]} scale={[1.12, 1.2, 0.6]}>
        <sphereGeometry args={[0.5, 28, 28]} />
        <meshStandardMaterial color={pad} roughness={0.85} />
      </mesh>
      {/* 위쪽 토우 솜 3개 (살짝 봉긋한 실루엣) */}
      {[[-0.3, 1.0], [0, 1.08], [0.3, 1.0]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], 0.04]} scale={[0.7, 0.62, 0.55]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={pad} roughness={0.85} />
        </mesh>
      ))}
      {/* 중앙 큰 젤리 */}
      <mesh position={[0, 0.46, 0.3]} scale={[1.25, 1.15, 0.6]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial color={bean} roughness={0.4} />
      </mesh>
      {/* 토우 젤리 3개 (아치) */}
      {[[-0.26, 0.78], [0, 0.9], [0.26, 0.78]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], 0.32]} scale={[1.05, 1.2, 0.6]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={bean} roughness={0.4} />
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
      <mesh position={[0, 1.02, 0.2]} scale={[0.92, 1, 0.95]}>
        <sphereGeometry args={[0.27, 18, 18]} />
        <meshStandardMaterial color={fc} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.22, 0.12]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color={wool} roughness={0.97} />
      </mesh>
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 1.04, 0.18]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]} scale={[0.6, 0.32, 0.4]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color={fc} roughness={0.85} />
        </mesh>
      ))}
      {[-0.1, 0.1].map((x, i) => (
        <mesh key={i} position={[x, 1.05, 0.42]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.4} />
        </mesh>
      ))}
      {[-0.17, 0.17].map((x, i) => (
        <mesh key={i} position={[x, 0.96, 0.38]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={PINK} roughness={0.7} />
        </mesh>
      ))}
      {[-0.18, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.12, 0.18]}>
          <cylinderGeometry args={[0.06, 0.06, 0.24, 8]} />
          <meshStandardMaterial color={fc} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// ── 고양이 (회색&흰색 바이컬러, 큰 눈, 분홍 코, 수염) ──
function CatModel() {
  const grey = '#b7c1cb';
  const white = '#f7f4ef';
  const inner = '#f0b9c6';
  const nose = '#ec8aa0';
  const eye = '#2a2320';
  const whisker = '#efe9df';
  return (
    <group>
      {/* 몸통(회색) */}
      <mesh position={[0, 0.42, 0]} scale={[1, 1.05, 0.95]}>
        <sphereGeometry args={[0.46, 22, 22]} />
        <meshStandardMaterial color={grey} roughness={0.85} />
      </mesh>
      {/* 가슴(흰) */}
      <mesh position={[0, 0.34, 0.32]} scale={[0.6, 0.85, 0.5]}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshStandardMaterial color={white} roughness={0.85} />
      </mesh>
      {/* 앞발(흰) */}
      {[-0.24, 0.24].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0.34]}>
          <sphereGeometry args={[0.12, 14, 14]} />
          <meshStandardMaterial color={white} roughness={0.85} />
        </mesh>
      ))}
      {/* 꼬리(회색) */}
      <mesh position={[0.36, 0.5, -0.32]} rotation={[0.5, 0, -0.4]} scale={[0.5, 1.15, 0.5]}>
        <sphereGeometry args={[0.2, 14, 14]} />
        <meshStandardMaterial color={grey} roughness={0.9} />
      </mesh>
      {/* 머리(회색) */}
      <mesh position={[0, 1.0, 0.02]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color={grey} roughness={0.85} />
      </mesh>
      {/* 얼굴 흰 패치 */}
      <mesh position={[0, 0.92, 0.3]} scale={[0.8, 0.95, 0.62]}>
        <sphereGeometry args={[0.3, 18, 18]} />
        <meshStandardMaterial color={white} roughness={0.85} />
      </mesh>
      {/* 귀(회색 + 분홍 속) */}
      {[-0.24, 0.24].map((x, i) => (
        <group key={i} position={[x, 1.35, 0]} rotation={[0, 0, x > 0 ? -0.2 : 0.2]}>
          <mesh><coneGeometry args={[0.15, 0.3, 18]} /><meshStandardMaterial color={grey} roughness={0.85} /></mesh>
          <mesh position={[0, -0.02, 0.06]} scale={[0.6, 0.7, 0.5]}>
            <coneGeometry args={[0.15, 0.3, 18]} /><meshStandardMaterial color={inner} roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* 큰 눈 + 하이라이트 */}
      {[-0.15, 0.15].map((x, i) => (
        <group key={i} position={[x, 1.02, 0.45]}>
          <mesh><sphereGeometry args={[0.075, 16, 16]} /><meshStandardMaterial color={eye} roughness={0.25} /></mesh>
          <mesh position={[0.025, 0.035, 0.045]}>
            <sphereGeometry args={[0.022, 10, 10]} />
            <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}
      {/* 코(분홍 삼각) */}
      <mesh position={[0, 0.9, 0.55]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.05, 0.07, 3]} />
        <meshStandardMaterial color={nose} roughness={0.5} />
      </mesh>
      {/* 볼터치 */}
      {[-0.27, 0.27].map((x, i) => (
        <mesh key={i} position={[x, 0.87, 0.34]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color={inner} roughness={0.7} />
        </mesh>
      ))}
      {/* 수염 (양쪽 3가닥) */}
      {[-1, 1].map((s) =>
        [-0.1, 0, 0.1].map((tilt, j) => (
          <mesh key={`${s}-${j}`} position={[s * 0.4, 0.85, 0.36]} rotation={[0, 0, s * (Math.PI / 2) + tilt]}>
            <cylinderGeometry args={[0.006, 0.006, 0.34, 5]} />
            <meshStandardMaterial color={whisker} roughness={0.6} />
          </mesh>
        )),
      )}
    </group>
  );
}

export default function DecorationModel({ type }) {
  const d = getDecoration(type);
  if (!d) return null;
  if (d.shape === 'heart') return <HeartModel d={d} />;
  if (d.shape === 'paw') return <PawModel d={d} />;
  if (d.shape === 'sheep') return <SheepModel d={d} />;
  if (d.shape === 'cat') return <CatModel />;
  return null;
}
