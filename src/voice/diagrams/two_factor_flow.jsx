/* Two-factor authentication in three steps: password, code, access. */
const L = {
  ka: { title: 'ორმაგი ავთენტიფიკაცია', steps: ['პაროლი', 'კოდი ტელეფონზე', 'შესვლა'], note: 'პაროლის ცოდნა საკმარისი აღარ არის' },
  en: { title: 'Two-factor authentication', steps: ['password', 'code on your phone', 'access'], note: 'knowing the password is no longer enough' },
}
const ICON = ['🔑', '📱', '🔓']

export default function TwoFactorFlow({ lang = 'ka' }) {
  const t = L[lang] || L.ka
  return (
    <svg className="voice-diagram" viewBox="0 0 320 130" role="img" aria-label={t.title}>
      <title>{t.title}</title>
      {t.steps.map((step, i) => {
        const x = 12 + i * 106
        return (
          <g key={i}>
            <rect x={x} y="14" width="92" height="66" rx="12" fill="#fff" stroke={i === 2 ? '#2fbf83' : '#2a7bb5'} strokeWidth="2" />
            <text x={x + 46} y="44" fontSize="22" textAnchor="middle">
              {ICON[i]}
            </text>
            <text x={x + 46} y="68" fontSize="10.5" fontWeight="700" textAnchor="middle" fill="#1c2434">
              {step}
            </text>
            {i < 2 ? (
              <text x={x + 99} y="52" fontSize="16" fontWeight="800" fill="#2a7bb5">
                →
              </text>
            ) : null}
          </g>
        )
      })}
      <text x="160" y="112" fontSize="11" fontWeight="600" textAnchor="middle" fill="#5b6b82">
        {t.note}
      </text>
    </svg>
  )
}
