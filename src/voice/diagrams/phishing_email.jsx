/* A phishing email with its three tells, labelled in the session language.
   Inline SVG, no external images (brief Phase 5). */
const L = {
  ka: { from: 'გამომგზავნი: bank-secure-ge.com', fromTell: 'ყალბი დომენი', subject: 'თქვენი ბარათი დაიბლოკა — 2 საათი გაქვთ!', subjectTell: 'აჩქარება', link: 'შედით ბმულით ›', linkTell: 'უცნობი ბმული', title: 'ფიშინგის სამი ნიშანი' },
  en: { from: 'From: bank-secure-ge.com', fromTell: 'fake domain', subject: 'Your card is blocked — 2 hours left!', subjectTell: 'urgency', link: 'Log in via this link ›', linkTell: 'unknown link', title: 'Three signs of phishing' },
}

export default function PhishingEmail({ lang = 'ka' }) {
  const t = L[lang] || L.ka
  return (
    <svg className="voice-diagram" viewBox="0 0 320 190" role="img" aria-label={t.title}>
      <title>{t.title}</title>
      <rect x="8" y="8" width="214" height="174" rx="12" fill="#fff" stroke="#dfe6ef" strokeWidth="2" />
      <rect x="8" y="8" width="214" height="34" rx="12" fill="#e6f0f8" />
      <text x="20" y="30" fontSize="11" fontWeight="700" fill="#1e5b86">
        {t.from}
      </text>
      <text x="20" y="66" fontSize="11" fontWeight="800" fill="#1c2434">
        {t.subject}
      </text>
      <rect x="20" y="84" width="150" height="6" rx="3" fill="#dfe6ef" />
      <rect x="20" y="98" width="180" height="6" rx="3" fill="#dfe6ef" />
      <rect x="20" y="112" width="120" height="6" rx="3" fill="#dfe6ef" />
      <rect x="20" y="132" width="132" height="26" rx="8" fill="#ea5f5f" />
      <text x="86" y="149" fontSize="11" fontWeight="800" fill="#fff" textAnchor="middle">
        {t.link}
      </text>
      {[
        [25, t.fromTell],
        [62, t.subjectTell],
        [145, t.linkTell],
      ].map(([y, label], i) => (
        <g key={i}>
          <line x1="224" y1={y} x2="244" y2={y} stroke="#d24a4a" strokeWidth="2" />
          <circle cx="222" cy={y} r="4" fill="#d24a4a" />
          <text x="248" y={y + 4} fontSize="11" fontWeight="700" fill="#d24a4a">
            {label}
          </text>
        </g>
      ))}
    </svg>
  )
}
