// 2D SVG 케이크 컴포넌트 (Stage 2용 — Stage 3에서 3D로 교체 예정)
export default function CakeSVG({ candleBlown }) {
  return (
    <svg
      viewBox="0 0 300 340"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 40px #7b2d8b66)' }}
    >
      {/* 플레이트 */}
      <ellipse cx="150" cy="320" rx="145" ry="16" fill="#1a1a1a" />
      <ellipse cx="150" cy="314" rx="145" ry="10" fill="#2a2a2a" />

      {/* 하단 티어 */}
      <rect x="20" y="240" width="260" height="74" rx="6" fill="#3d1a4a" />
      <ellipse cx="150" cy="240" rx="130" ry="18" fill="#5a2870" />
      <ellipse cx="150" cy="314" rx="130" ry="10" fill="#2d1438" />
      {/* 하단 장식 띠 */}
      <rect x="20" y="282" width="260" height="6" fill="#7b2d8b44" />
      <rect x="20" y="260" width="260" height="4" fill="#ffffff11" />

      {/* 중간 티어 */}
      <rect x="55" y="162" width="190" height="82" rx="6" fill="#4a1a5a" />
      <ellipse cx="150" cy="162" rx="95" ry="16" fill="#6b2880" />
      <ellipse cx="150" cy="244" rx="95" ry="12" fill="#3a1248" />
      {/* 중간 장식 띠 */}
      <rect x="55" y="204" width="190" height="5" fill="#9b3db044" />
      <rect x="55" y="180" width="190" height="3" fill="#ffffff0d" />

      {/* 상단 티어 */}
      <rect x="95" y="94" width="110" height="72" rx="6" fill="#5a1a6e" />
      <ellipse cx="150" cy="94" rx="55" ry="12" fill="#7b2d8b" />
      <ellipse cx="150" cy="166" rx="55" ry="10" fill="#3a0e50" />
      {/* 상단 장식 띠 */}
      <rect x="95" y="130" width="110" height="4" fill="#ffffff11" />

      {/* 이름 토퍼 플레이트 */}
      <rect x="105" y="56" width="90" height="42" rx="8" fill="#1a0a22" stroke="#ffd70066" strokeWidth="1" />
      <text x="150" y="73" textAnchor="middle" fill="#ffd700" fontSize="9" fontFamily="inherit" fontWeight="600" letterSpacing="1">
        Happy Birthday
      </text>
      <text x="150" y="90" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="inherit" fontWeight="700">
        양정민 🎂
      </text>

      {/* 초 (5개) */}
      {!candleBlown && [
        { x: 122, label: '' }, { x: 132, label: '' }, { x: 150, label: '' },
        { x: 168, label: '' }, { x: 178, label: '' },
      ].map((c, i) => (
        <g key={i}>
          {/* 초 몸체 */}
          <rect x={c.x - 3} y="25" width="6" height="30" rx="2"
            fill={['#ff6b9d', '#ffd700', '#7ec8e3', '#b5ead7', '#ff9aa2'][i]} />
          {/* 불꽃 */}
          <ellipse cx={c.x} cy="22" rx="4" ry="6" fill="#ffd700" opacity="0.9" />
          <ellipse cx={c.x} cy="21" rx="2.5" ry="4" fill="#fff" opacity="0.7" />
          {/* 글로우 */}
          <ellipse cx={c.x} cy="22" rx="7" ry="9" fill="#ffd700" opacity="0.15" />
        </g>
      ))}

      {/* 꺼진 초 */}
      {candleBlown && [122, 132, 150, 168, 178].map((x, i) => (
        <g key={i}>
          <rect x={x - 3} y="25" width="6" height="30" rx="2"
            fill={['#ff6b9d88', '#ffd70088', '#7ec8e388', '#b5ead788', '#ff9aa288'][i]} />
          {/* 연기 */}
          <path
            d={`M${x},24 Q${x + 3},18 ${x},12 Q${x - 3},6 ${x},0`}
            stroke="#ffffff33" strokeWidth="1.5" fill="none"
            style={{ animation: 'smokerise 1.5s ease-out forwards' }}
          />
        </g>
      ))}

      {/* 크림 웨이브 */}
      <path
        d="M55,162 Q65,148 80,156 Q90,148 105,156 Q115,148 130,156 Q140,148 150,156 Q160,148 175,156 Q185,148 200,156 Q210,148 225,156 Q240,148 245,162"
        stroke="#c084fc" strokeWidth="3" fill="none" opacity="0.6"
      />
      <path
        d="M20,240 Q32,226 50,234 Q62,226 82,234 Q94,226 112,234 Q124,226 150,234 Q162,226 188,234 Q200,226 218,234 Q230,226 250,234 Q268,226 280,240"
        stroke="#c084fc" strokeWidth="3" fill="none" opacity="0.6"
      />
    </svg>
  );
}
