/* Three passwords, three strengths: short, long, a passphrase. */
const L = {
  ka: { title: 'პაროლის სიძლიერე', rows: [['Nika2010', 'სუსტი — მოკლე და გამოსაცნობი'], ['t7$Qp!9zLw#e', 'საშუალო — ძნელი დასამახსოვრებელი'], ['ლურჯი-ვეფხვი-ჭიქა-მთვარე', 'ძლიერი — გრძელი და დასამახსოვრებელი']] },
  en: { title: 'Password strength', rows: [['Nika2010', 'weak — short and guessable'], ['t7$Qp!9zLw#e', 'medium — hard to remember'], ['blue-tiger-cup-moon', 'strong — long and memorable']] },
}
const WIDTH = [60, 150, 250]
const COLOR = ['#ea5f5f', '#ffb020', '#2fbf83']

export default function PasswordStrength({ lang = 'ka' }) {
  const t = L[lang] || L.ka
  return (
    <svg className="voice-diagram" viewBox="0 0 320 150" role="img" aria-label={t.title}>
      <title>{t.title}</title>
      {t.rows.map(([pw, note], i) => {
        const y = 14 + i * 46
        return (
          <g key={i}>
            <text x="8" y={y + 10} fontSize="12" fontWeight="800" fontFamily="ui-monospace, monospace" fill="#1c2434">
              {pw}
            </text>
            <rect x="8" y={y + 16} width="304" height="10" rx="5" fill="#e6f0f8" />
            <rect x="8" y={y + 16} width={WIDTH[i]} height="10" rx="5" fill={COLOR[i]} />
            <text x="8" y={y + 40} fontSize="10.5" fontWeight="600" fill="#5b6b82">
              {note}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
