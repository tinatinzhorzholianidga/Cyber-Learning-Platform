import { Link } from 'react-router-dom'
import { articlesInShelf } from '../../content/parents/index.js'
import { useI18n } from '../../i18n/I18nContext.jsx'

const SHELF_STYLE = {
  A: { color: '#5b8cff', title: 'parents.shelfA', desc: 'parents.shelfADesc' },
  B: { color: '#3ecf8e', title: 'parents.shelfB', desc: 'parents.shelfBDesc' },
  C: { color: '#ffb020', title: 'parents.shelfC', desc: 'parents.shelfCDesc' },
}

function ArticleCard({ article }) {
  const { t, tx } = useI18n()
  return (
    <Link to={`/parents/${article.id}`} className="article-card" style={{ '--c': article.color }}>
      <span className="top">
        <span className="emoji" aria-hidden="true">
          {article.emoji}
        </span>
        <span className="meta">
          {article.id.toUpperCase()} · {article.minutes} {t('parents.minRead')}
        </span>
        {article.priority && <span className="priority-chip">{t('parents.priority')}</span>}
      </span>
      <h3>{tx(article.title)}</h3>
      <span className="teaser">{tx(article.teaser)}</span>
    </Link>
  )
}

function Shelf({ shelf }) {
  const { t } = useI18n()
  const style = SHELF_STYLE[shelf]
  const list = articlesInShelf(shelf)
  return (
    <section className="shelf" aria-labelledby={`shelf-${shelf}`}>
      <div className="shelf-head">
        <h2 id={`shelf-${shelf}`}>
          <span className="shelf-ic" style={{ background: style.color }} aria-hidden="true">
            {shelf}
          </span>
          {t(style.title)}
        </h2>
        <p>{t(style.desc)}</p>
      </div>
      <div className="article-grid">
        {list.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}

export default function ParentsHubPage() {
  const { t } = useI18n()
  return (
    <div className="fade-in">
      <Link to="/" className="back-btn">
        ← {t('nav.back')}
      </Link>
      <div className="hub-head">
        <span className="emoji" aria-hidden="true">
          🧭
        </span>
        <h1>{t('parents.title')}</h1>
        <p>{t('parents.intro')}</p>
      </div>

      <Shelf shelf="A" />

      <div className="hub-cta">
        <span className="emoji" aria-hidden="true">
          📝
        </span>
        <div className="body">
          <h2>{t('parents.agreementCta')}</h2>
          <p>{t('parents.agreementCtaText')}</p>
        </div>
        <Link to="/parents/agreement" className="btn-solid amber">
          {t('parents.openAgreement')}
        </Link>
      </div>

      <Shelf shelf="B" />
      <Shelf shelf="C" />
    </div>
  )
}
