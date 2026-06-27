// 3D 빈티지 버터크림 케이크 (소프트 블루 + 라벤더, 싱글 티어, 플랫 탑)
// 레퍼런스: src/reference — 램버스(Lambeth) 스타일 디테일
// ⚠️ 케이크 위 동물 장식은 의도적으로 렌더링하지 않음 — 편지 작성 시 장식이 올라올 예정.
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import DecorationModel from './DecorationModel';
import { SLOTS } from '../constants/slots';
import { BIRTHDAY_NAME, BIRTHDAY_AGE } from '../constants/config';

// ── 치수 ────────────────────────────────────────────────
const R_TOP = 2.25;
const R_BOT = 2.5;
const H = 1.7;
const TOP_Y = 0.85;
const BOT_Y = TOP_Y - H;

// ── 팔레트 ──────────────────────────────────────────────
const C = {
  side: '#a9cce6',
  sideDeep: '#94bcdc',
  top: '#f4eedd',
  cream: '#f8f1df',
  creamDark: '#ecdfbf',
  lavender: '#c5b3e6',
  lavLight: '#dccff2',
  pink: '#f2a7c2',
  pinkDeep: '#e98bac',
  berry: '#d24a5b',
  berryDark: '#b6394a',
  leaf: '#9ec6a6',
  petal: '#fffaf5',
  pollen: '#f4d06f',
  candle: '#f3aecb',
  candleDark: '#d98bb0',
  plate: '#15171c',
};
const SPRINKLE = ['#f2a7c2', '#ffd27f', '#9ed2e6', '#b7e3c5', '#c9b6ec', '#ff9db0'];

// 원형 분산 배치 헬퍼
function ring(count, radius, y, phase = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = phase + (i / count) * Math.PI * 2;
    return { pos: [Math.cos(a) * radius, y, Math.sin(a) * radius], angle: a, i };
  });
}
// 측면 장식이 바깥(반경 방향)을 향하도록 하는 Y 회전값
const faceOut = (a) => Math.PI / 2 - a;

// ── 작은 꽃 (XY 평면, 정면 +Z) ─────────────────────────
function Flower({ scale = 1 }) {
  return (
    <group scale={scale}>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.075, Math.sin(a) * 0.075, 0]}>
            <sphereGeometry args={[0.058, 8, 8]} />
            <meshStandardMaterial color={C.petal} roughness={0.75} />
          </mesh>
        );
      })}
      <mesh position={[0, 0, 0.03]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={C.pollen} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── 체리 한 쌍 (정면 +Z) ───────────────────────────────
function Cherry({ scale = 1 }) {
  return (
    <group scale={scale}>
      <mesh position={[-0.08, 0, 0]}>
        <sphereGeometry args={[0.095, 12, 12]} />
        <meshStandardMaterial color={C.berry} roughness={0.28} />
      </mesh>
      <mesh position={[0.08, -0.02, 0]}>
        <sphereGeometry args={[0.095, 12, 12]} />
        <meshStandardMaterial color={C.berryDark} roughness={0.28} />
      </mesh>
      <mesh position={[-0.03, 0.14, 0.02]} rotation={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.009, 0.009, 0.18, 6]} />
        <meshStandardMaterial color={C.leaf} roughness={0.6} />
      </mesh>
      <mesh position={[0.05, 0.14, 0.02]} rotation={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.009, 0.009, 0.18, 6]} />
        <meshStandardMaterial color={C.leaf} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── 리본(보우) (정면 +Z) ───────────────────────────────
function Bow({ scale = 1, color = C.pink }) {
  return (
    <group scale={scale}>
      <mesh position={[-0.1, 0.02, 0]} rotation={[0, 0, 0.45]} scale={[1, 0.62, 0.5]}>
        <sphereGeometry args={[0.105, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 0.02, 0]} rotation={[0, 0, -0.45]} scale={[1, 0.62, 0.5]}>
        <sphereGeometry args={[0.105, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-0.05, -0.13, 0]} rotation={[0, 0, 0.28]}>
        <boxGeometry args={[0.05, 0.17, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.05, -0.13, 0]} rotation={[0, 0, -0.28]}>
        <boxGeometry args={[0.05, 0.17, 0.03]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, 0.04]}>
        <sphereGeometry args={[0.052, 10, 10]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
    </group>
  );
}

// ── 윗면 가장자리 돌롭(크림 방울 + 스프링클) ───────────
function Dollop({ color = C.side }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 5 }, () => ({
        p: [(Math.random() - 0.5) * 0.18, 0.08 + Math.random() * 0.06, (Math.random() - 0.5) * 0.18],
        c: SPRINKLE[Math.floor(Math.random() * SPRINKLE.length)],
      })),
    [],
  );
  return (
    <group>
      <mesh scale={[1, 0.85, 1]}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {dots.map((d, i) => (
        <mesh key={i} position={d.p}>
          <sphereGeometry args={[0.028, 6, 6]} />
          <meshStandardMaterial color={d.c} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ── 촛불 불꽃 ──────────────────────────────────────────
function Flame({ position }) {
  return (
    <group position={position}>
      <mesh>
        <coneGeometry args={[0.06, 0.24, 12]} />
        <meshStandardMaterial color="#ffd27f" emissive="#ffb347" emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.02, 0]} scale={0.5}>
        <coneGeometry args={[0.05, 0.2, 12]} />
        <meshStandardMaterial color="#fff7e0" emissive="#fff" emissiveIntensity={2.6} toneMapped={false} />
      </mesh>
      <pointLight color="#ffb866" intensity={2.2} distance={4.5} decay={2} />
    </group>
  );
}

// ── 숫자초 "2" (둥근 튜브로 제작 — 외부 폰트 불필요) ───
// 숫자 "2" 모양의 중심선을 따라 일정 두께의 둥근 튜브를 뽑아 진짜 숫자초처럼.
const D2_PTS = [
  [-0.19, 0.24], [-0.205, 0.40], [-0.07, 0.51], [0.11, 0.47],
  [0.19, 0.31], [0.10, 0.14], [-0.05, -0.02], [-0.20, -0.22],
  [-0.235, -0.36], [-0.05, -0.40], [0.23, -0.40],
].map(([x, y]) => new THREE.Vector3(x, y, 0));
const D2_CURVE = new THREE.CatmullRomCurve3(D2_PTS, false, 'centripetal', 0.5);
const D2_R = 0.082;
const D2_START = D2_PTS[0].toArray();
const D2_END = D2_PTS[D2_PTS.length - 1].toArray();

function Digit2({ x }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <tubeGeometry args={[D2_CURVE, 90, D2_R, 12, false]} />
        <meshStandardMaterial color={C.candle} roughness={0.35} />
      </mesh>
      {/* 둥근 끝 캡 */}
      <mesh position={D2_START}>
        <sphereGeometry args={[D2_R, 12, 12]} />
        <meshStandardMaterial color={C.candle} roughness={0.35} />
      </mesh>
      <mesh position={D2_END}>
        <sphereGeometry args={[D2_R, 12, 12]} />
        <meshStandardMaterial color={C.candle} roughness={0.35} />
      </mesh>
    </group>
  );
}

function NumberCandle({ lit }) {
  const num = String(BIRTHDAY_AGE || 22); // 요구사항: 22
  const digits = num.split('');
  const gap = 0.58;
  const startX = -((digits.length - 1) * gap) / 2;
  return (
    <group position={[0, TOP_Y + 0.42, -0.15]}>
      {digits.map((d, i) => (
        <group key={i}>
          <Digit2 x={startX + i * gap} />
          {lit && <Flame position={[startX + i * gap - 0.04, 0.66, 0]} />}
        </group>
      ))}
    </group>
  );
}

// ── 케이크 본체 ────────────────────────────────────────
export function CakeModel({ candleBlown, letters = [], onAnimalClick }) {
  const group = useRef();
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y += dt * 0.14;
    // 등장 시 살짝 확대 (CSS 스케일 대신 씬 내부에서 처리 → 캔버스 중앙정렬 버그 방지)
    const s = group.current.scale.x;
    if (s < 1) group.current.scale.setScalar(Math.min(1, s + dt * 0.7));
  });

  // 윗면 스프링클 (고정)
  const topSprinkles = useMemo(
    () =>
      Array.from({ length: 46 }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * (R_TOP - 0.35);
        return {
          p: [Math.cos(a) * r, TOP_Y + 0.012, Math.sin(a) * r],
          c: SPRINKLE[Math.floor(Math.random() * SPRINKLE.length)],
          s: 0.022 + Math.random() * 0.018,
        };
      }),
    [],
  );

  return (
    <group ref={group} scale={0.72}>
      {/* 받침 접시 */}
      <mesh position={[0, BOT_Y - 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[3.0, 3.1, 0.18, 64]} />
        <meshStandardMaterial color={C.plate} roughness={0.3} metalness={0.4} />
      </mesh>

      {/* 측면 본체 */}
      <mesh castShadow position={[0, TOP_Y - H / 2, 0]}>
        <cylinderGeometry args={[R_TOP, R_BOT, H, 64]} />
        <meshStandardMaterial color={C.side} roughness={0.65} />
      </mesh>

      {/* 크림 윗면 */}
      <mesh position={[0, TOP_Y + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R_TOP, 64]} />
        <meshStandardMaterial color={C.top} roughness={0.55} />
      </mesh>

      {/* 윗면 스프링클 */}
      {topSprinkles.map((s, i) => (
        <mesh key={`sp-${i}`} position={s.p}>
          <sphereGeometry args={[s.s, 6, 6]} />
          <meshStandardMaterial color={s.c} roughness={0.5} />
        </mesh>
      ))}

      {/* ── 최상단 테두리 장식 ─────────────────────────── */}
      {/* 크림 로프 */}
      <mesh position={[0, TOP_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R_TOP - 0.05, 0.1, 12, 96]} />
        <meshStandardMaterial color={C.cream} roughness={0.5} />
      </mesh>
      {/* 크림 비즈(진주) 띠 */}
      {ring(56, R_TOP - 0.05, TOP_Y + 0.05).map((p) => (
        <mesh key={`tb-${p.i}`} position={p.pos}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={C.creamDark} roughness={0.45} />
        </mesh>
      ))}
      {/* 돌롭(스프링클) + 체리 + 보우 교대 배치 */}
      {ring(10, R_TOP - 0.18, TOP_Y + 0.12).map((p) => (
        <group key={`td-${p.i}`} position={p.pos}>
          <Dollop color={p.i % 2 === 0 ? C.side : C.lavLight} />
        </group>
      ))}
      {ring(5, R_TOP - 0.16, TOP_Y + 0.16, Math.PI / 10).map((p) => (
        <group key={`tc-${p.i}`} position={p.pos} rotation={[0, faceOut(p.angle), 0]}>
          <Cherry scale={0.85} />
        </group>
      ))}
      {ring(5, R_TOP - 0.16, TOP_Y + 0.16, Math.PI / 10 + Math.PI / 5).map((p) => (
        <group key={`tw-${p.i}`} position={p.pos} rotation={[0, faceOut(p.angle), 0]}>
          <Bow scale={0.8} color={C.pink} />
        </group>
      ))}

      {/* ── 윗 측면: 라벤더 러플 드레이프 ─────────────── */}
      {ring(46, R_TOP + 0.04, TOP_Y - 0.16).map((p) => (
        <mesh key={`ruf-${p.i}`} position={p.pos} rotation={[0, -p.angle, 0]} scale={[0.55, 1.25, 0.4]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color={p.i % 2 === 0 ? C.lavender : C.lavLight} roughness={0.55} />
        </mesh>
      ))}
      {/* 라벤더 비즈 띠 */}
      {ring(54, R_BOT - 0.06, TOP_Y - 0.46).map((p) => (
        <mesh key={`lb-${p.i}`} position={p.pos}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color={C.lavLight} roughness={0.45} />
        </mesh>
      ))}

      {/* ── 중단: 보우 줄 ───────────────────────────── */}
      {ring(10, R_BOT + 0.02, TOP_Y - 0.78).map((p) => (
        <group key={`mb-${p.i}`} position={p.pos} rotation={[0, faceOut(p.angle), 0]}>
          <Bow scale={0.85} color={p.i % 2 === 0 ? C.pink : C.lavender} />
        </group>
      ))}

      {/* ── 중하단: 꽃 + 체리 밴드 ─────────────────── */}
      {ring(11, R_BOT + 0.03, TOP_Y - 1.15).map((p) => (
        <group key={`fl-${p.i}`} position={p.pos} rotation={[0, faceOut(p.angle), 0]}>
          <Flower scale={0.95} />
        </group>
      ))}
      {ring(11, R_BOT + 0.05, TOP_Y - 1.4, Math.PI / 11).map((p) => (
        <group key={`be-${p.i}`} position={p.pos} rotation={[0, faceOut(p.angle), 0]}>
          <Cherry scale={0.8} />
        </group>
      ))}

      {/* ── 바닥 셸(조개) 로프 ──────────────────────── */}
      {ring(52, R_BOT + 0.05, BOT_Y + 0.02).map((p) => (
        <mesh key={`shell-${p.i}`} position={p.pos} rotation={[0, -p.angle, 0]} scale={[0.7, 0.7, 1.1]}>
          <sphereGeometry args={[0.16, 10, 10]} />
          <meshStandardMaterial color={C.cream} roughness={0.5} />
        </mesh>
      ))}

      {/* ── 숫자초 22 ───────────────────────────────── */}
      <NumberCandle lit={!candleBlown} />

      {/* ── 편지별 동물 장식 (숫자초 주변, 문구 안 가림) ─ */}
      {letters.map((l) => {
        const slot = SLOTS[l.slot];
        if (!slot) return null;
        return (
          <group
            key={l.id}
            position={[slot.x, TOP_Y, slot.z]}
            rotation={[0, slot.rot || 0, 0]}
            scale={0.42}
            onClick={(e) => { e.stopPropagation(); onAnimalClick && onAnimalClick(l); }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
          >
            <DecorationModel type={l.decoration} />
          </group>
        );
      })}

      {/* ── 이름 토퍼 (앞쪽, 귀여운 손글씨 폰트 + 아치) ─ */}
      <Text
        position={[0, TOP_Y + 0.02, 1.12]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color={C.pinkDeep}
        anchorX="center"
        anchorY="middle"
        curveRadius={3.4}
        letterSpacing={0.01}
        font="/fonts/DancingScript.woff"
      >
        Happy Birthday
      </Text>
      <Text
        position={[0, TOP_Y + 0.02, 1.55]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.38}
        color={C.berry}
        anchorX="center"
        anchorY="middle"
        curveRadius={4}
        letterSpacing={0.04}
        font="/fonts/MemomentKkukkukk.ttf"
      >
        ♥ {BIRTHDAY_NAME} ♥
      </Text>
    </group>
  );
}

export default function Cake3D({ candleBlown, letters = [], onAnimalClick }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 3.4, 6.8], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 5]} intensity={1.1} castShadow />
      <pointLight position={[-5, 2, -4]} intensity={0.6} color={C.lavender} />
      <pointLight position={[0, 1, 6]} intensity={0.45} color="#bcd8f0" />

      <Suspense fallback={null}>
        <CakeModel candleBlown={candleBlown} letters={letters} onAnimalClick={onAnimalClick} />
      </Suspense>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3.4}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.3, 0]}
      />
    </Canvas>
  );
}
