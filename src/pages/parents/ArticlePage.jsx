import { Link, Navigate, useParams } from 'react-router-dom'
import { missionMetaById } from '../../content/guardians/meta.js'
import { articleById, articlesInShelf } from '../../content/parents/index.js'
import { useI18n } from '../../i18n/I18nContext.jsx'

const CALLOUT_ICON = {
  script: '💬',
  do: '✅',
  dont: '⛔',
  note: '📌',
  emergency: '🆘',
}

function Block({ block }) {
  const { tx } = useI18n()
  if (block.type === 'h2') return <h2>{tx(block.text)}</h2>
  if (block.type === 'p') return <p>{tx(block.text)}</p>
  if (block.type === 'list') {
    const items = block.items.map((item, i) => <li key={i}>{tx(item)}</li>)
    return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>
  }
  if (block.type === 'callout') {
    const items = block.items?.map((item, i) => <li key={i}>{tx(item)}</li>)
    return (
      <div className={`callout ${block.variant}`}>
        <div className="co-title">
          <span aria-hidden="true">{CALLOUT_ICON[block.variant]}</span>
          {tx(block.title)}
        </div>
        {block.ps?.map((p, i) => (
          <p key={i}>{tx(p)}</p>
        ))}
        {items && (block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>)}
      </div>
    )
  }
  return null
}

export default function ArticlePage() {
  const { articleId } = useParams()
  const { t, tx } = useI18n()
  const article = articleById[articleId]

  if (!article) return <Navigate to="/parents" replace />

  const mission = article.mission ? missionMetaById[article.mission] : null
  const shelfMates = articlesInShelf(article.shelf).filter((a) => a.id !== article.id)
  const idx = articlesInShelf(article.shelf).findIndex((a) => a.id === article.id)
  const nextReads = [...shelfMates.slice(idx), ...shelfMates.slice(0, idx)].slice(0, 2)

  return (
    <div className="article-wrap fade-in" style={{ '--c': article.color }}>
      <Link to="/parents" className="back-btn">
        ← {t('parents.backToHub')}
      </Link>
      <article className="article-paper">
        <div className="kicker">
          <span aria-hidden="true">{article.emoji}</span>
          <span>{article.id.toUpperCase()}</span>
          <span>
            {article.minutes} {t('parents.minRead')}
          </span>
          {article.priority && <span className="priority-chip">{t('parents.priority')}</span>}
        </div>
        <h1>{tx(article.title)}</h1>
        <p className="lead">{tx(article.lead)}</p>
        <div className="article-body">
          {article.body.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {mission && (
          <aside className="mission-link">
            <span className="emoji" aria-hidden="true">
              {mission.emoji}
            </span>
            <div className="body">
              <h3>
                {t('parents.relatedMission')}: {tx(mission.name)}
              </h3>
              <p>{t('parents.relatedMissionText')}</p>
            </div>
            <Link className="btn-solid" to={`/guardians/mission/${mission.id}`}>
              {t('parents.openMission')}
            </Link>
          </aside>
        )}

        <div className="article-actions">
          <button type="button" className="btn-ghost" onClick={() => window.print()}>
            🖨️ {t('parents.printThis')}
          </button>
        </div>

        {article.sources?.length > 0 && (
          <div className="stat-note">
            <strong>{t('parents.sources')}</strong>
            <ul>
              {article.sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {nextReads.length > 0 && (
        <div className="next-reads">
          <h2>{t('parents.nextRead')}</h2>
          <div className="article-grid">
            {nextReads.map((a) => (
              <Link key={a.id} to={`/parents/${a.id}`} className="article-card" style={{ '--c': a.color }}>
                <span className="top">
                  <span className="emoji" aria-hidden="true">
                    {a.emoji}
                  </span>
                  <span className="meta">
                    {a.id.toUpperCase()} · {a.minutes} {t('parents.minRead')}
                  </span>
                </span>
                <h3>{tx(a.title)}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
