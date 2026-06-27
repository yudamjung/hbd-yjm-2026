// 귀여운 저폴리 동물 (앉은 블롭 형태). 정면은 +Z. 발이 y=0에 닿도록 구성.
// 레퍼런스의 버터크림 동물 토퍼 느낌.
import { getDecoration } from '../constants/decorations';

const PINK = '#f4a9c4';
const DARK = '#352a24';

function Ears({ d }) {
  const body = d.color;
  const inner = d.accent || PINK;
  if (d.ear === 'round') {
    return (
      <>
        {[-0.26, 0.26].map((x, i) => (
          <mesh key={i} position={[x, 1.3, 0]}>
            <sphereGeometry args={[0.13, 14, 14]} />
            <meshStandardMaterial color={body} roughness={0.85} />
          </mesh>
        ))}
      </>
    );
  }
  if (d.ear === 'long') {
    return (
      <>
        {[-0.15, 0.15].map((x, i) => (
          <group key={i} position={[x, 1.5, -0.02]} rotation={[0, 0, x > 0 ? -0.13 : 0.13]}>
            <mesh scale={[0.5, 1.25, 0.45]}>
              <sphereGeometry args={[0.16, 14, 14]} />
              <meshStandardMaterial color={body} roughness={0.85} />
            </mesh>
            <mesh position={[0, 0.02, 0.05]} scale={[0.28, 1.0, 0.3]}>
              <sphereGeometry args={[0.16, 12, 12]} />
              <meshStandardMaterial color={inner} roughness={0.8} />
            </mesh>
          </group>
        ))}
      </>
    );
  }
  if (d.ear === 'pointy') {
    return (
      <>
        {[-0.22, 0.22].map((x, i) => (
          <mesh key={i} position={[x, 1.32, 0]} rotation={[0, 0, x > 0 ? -0.18 : 0.18]}>
            <coneGeometry args={[0.14, 0.28, 4]} />
            <meshStandardMaterial color={body} roughness={0.85} />
          </mesh>
        ))}
      </>
    );
  }
  if (d.ear === 'floppy') {
    return (
      <>
        {[-0.3, 0.3].map((x, i) => (
          <mesh key={i} position={[x, 1.12, 0.04]} rotation={[0, 0, x > 0 ? -0.55 : 0.55]} scale={[0.5, 1, 0.4]}>
            <sphereGeometry args={[0.17, 14, 14]} />
            <meshStandardMaterial color={body} roughness={0.85} />
          </mesh>
        ))}
      </>
    );
  }
  return null; // 'none' (오리 등) — 귀 없음
}

export default function AnimalModel({ type }) {
  const d = getDecoration(type) || { color: '#ccc', face: '#eee' };
  const body = d.color;
  const face = d.face || body;

  return (
    <group>
      {/* 앉은 몸통 */}
      <mesh position={[0, 0.42, 0]} scale={[1, 1.05, 0.95]}>
        <sphereGeometry args={[0.46, 20, 20]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 배 (밝은 톤) */}
      <mesh position={[0, 0.38, 0.3]} scale={[0.66, 0.85, 0.5]}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <meshStandardMaterial color={face} roughness={0.85} />
      </mesh>
      {/* 머리 */}
      <mesh position={[0, 1.0, 0.02]}>
        <sphereGeometry args={[0.38, 20, 20]} />
        <meshStandardMaterial color={body} roughness={0.85} />
      </mesh>
      {/* 주둥이 */}
      <mesh position={[0, 0.92, 0.33]} scale={[1, 0.82, 0.8]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshStandardMaterial color={face} roughness={0.85} />
      </mesh>
      {/* 코 또는 부리 */}
      {d.beak ? (
        <mesh position={[0, 0.92, 0.46]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.22, 12]} />
          <meshStandardMaterial color={d.beak} roughness={0.6} />
        </mesh>
      ) : (
        <mesh position={[0, 0.94, 0.48]}>
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshStandardMaterial color={d.nose || DARK} roughness={0.5} />
        </mesh>
      )}
      {/* 눈 */}
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x, 1.04, 0.33]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshStandardMaterial color={DARK} roughness={0.4} />
        </mesh>
      ))}
      {/* 볼터치 */}
      {[-0.23, 0.23].map((x, i) => (
        <mesh key={i} position={[x, 0.93, 0.29]}>
          <sphereGeometry args={[0.052, 10, 10]} />
          <meshStandardMaterial color={PINK} roughness={0.75} />
        </mesh>
      ))}
      {/* 앞발 */}
      {[-0.27, 0.27].map((x, i) => (
        <mesh key={i} position={[x, 0.18, 0.32]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color={body} roughness={0.85} />
        </mesh>
      ))}
      <Ears d={d} />
    </group>
  );
}
