import { Link } from 'react-router-dom'
import agreement from '../../content/parents/agreement.js'
import { useI18n } from '../../i18n/I18nContext.jsx'

export default function AgreementPage() {
  const { t, tx } = useI18n()
  return (
    <div className="article-wrap fade-in">
      <Link to="/parents" className="back-btn">
        ← {t('parents.backToHub')}
      </Link>
      <div className="sheet">
        <h1>📝 {tx(agreement.title)}</h1>
        <p className="sub">{tx(agreement.sub)}</p>

        {agreement.sections.map((section, i) => (
          <section key={i}>
            <h2>{tx(section.title)}</h2>
            {section.clauses?.map((clause, j) => (
              <p className="clause" key={j}>
                {tx(clause)}
              </p>
            ))}
            {section.writeLines &&
              Array.from({ length: section.writeLines }, (_, j) => (
                <div className="write-line" key={j} aria-hidden="true" />
              ))}
          </section>
        ))}

        <div className="sig-row">
          <div>
            <div className="write-line" aria-hidden="true" />
            <div className="lbl">{tx(agreement.signatures.child)}</div>
          </div>
          <div>
            <div className="write-line" aria-hidden="true" />
            <div className="lbl">{tx(agreement.signatures.parent)}</div>
          </div>
          <div>
            <div className="write-line" aria-hidden="true" />
            <div className="lbl">{tx(agreement.signatures.date)}</div>
          </div>
        </div>
      </div>

      <div className="article-actions no-print" style={{ justifyContent: 'center', marginTop: 18 }}>
        <button type="button" className="btn-solid amber" onClick={() => window.print()}>
          🖨️ {t('parents.printThis')}
        </button>
      </div>
    </div>
  )
}
