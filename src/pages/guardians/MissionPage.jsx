import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MISSIONS, missionById, missionMax } from '../../content/guardians/index.js'
import BranchRound from '../../games/BranchRound.jsx'
import BuilderRound from '../../games/BuilderRound.jsx'
import ChoiceRound from '../../games/ChoiceRound.jsx'
import FlagsRound from '../../games/FlagsRound.jsx'
import { useI18n } from '../../i18n/I18nContext.jsx'
import { useProgress } from '../../store/progress.jsx'

const ROUND_COMPONENTS = {
  choice: ChoiceRound,
  flags: FlagsRound,
  builder: BuilderRound,
  branch: BranchRound,
}

export default function MissionPage() {
  const { missionId } = useParams()
  const { t, tx } = useI18n()
  const { progress, recordMission } = useProgress()
  const [phase, setPhase] = useState('brief') // 'brief' | round index | 'debrief'
  const [score, setScore] = useState(0)

  // The route keeps this component mounted when only :missionId changes
  // (e.g. the "next mission" button) — reset the run state explicitly.
  useEffect(() => {
    setPhase('brief')
    setScore(0)
  }, [missionId])

  const mission = missionById[missionId]
  if (!mission) return <Navigate to="/guardians" replace />

  const coreDone = MISSIONS.filter((m) => !m.final).every(
    (m) => progress.guardians.missions[m.id]?.done,
  )
  if (mission.final && !coreDone) return <Navigate to="/guardians" replace />

  const max = missionMax(mission)
  const passed = !mission.passRatio || score >= Math.ceil(max * mission.passRatio)
  const next = MISSIONS.find((m) => m.order === mission.order + 1)

  const handleRoundDone = (earned) => {
    const newScore = score + earned
    setScore(newScore)
    if (phase + 1 < mission.rounds.length) {
      setPhase(phase + 1)
      window.scrollTo({ top: 0 })
    } else {
      const finalPassed = !mission.passRatio || newScore >= Math.ceil(max * mission.passRatio)
      if (finalPassed) recordMission(mission.id, { score: newScore, total: max })
      setPhase('debrief')
      window.scrollTo({ top: 0 })
    }
  }

  const helpStrip = mission.helpStrip && (
    <div className="help-strip" role="note">
      💛 {tx(mission.helpStrip)}
    </div>
  )

  let body
  if (phase === 'brief') {
    body = (
      <div className="brief-card" style={{ '--c': mission.color }}>
        <div className="b-label">{t('guardians.briefingTitle')}</div>
        <p>{tx(mission.brief)}</p>
        {mission.passRatio && (
          <p style={{ marginTop: 10, fontWeight: 700 }}>{t('guardians.exam.passMark')}</p>
        )}
        {helpStrip}
        <div className="actions">
          <button type="button" className="btn-solid" onClick={() => setPhase(0)}>
            {t('guardians.beginMission')} →
          </button>
        </div>
      </div>
    )
  } else if (phase === 'debrief') {
    body = (
      <div className="debrief">
        <div className="brief-card" style={{ '--c': mission.color }}>
          <div className="b-label">
            {mission.passRatio
              ? passed
                ? `✅ ${t('guardians.exam.passed')}`
                : t('guardians.exam.failedTitle')
              : t('guardians.debriefTitle')}
          </div>
          <p className="score-line">
            {t('guardians.yourScore')}: {score} / {max} ⚡
          </p>
          {mission.passRatio && !passed && <p>{t('guardians.exam.failedText')}</p>}
          <div className="takeaways">
            <h3>{t('guardians.keyTakeaways')}</h3>
            <ul>
              {mission.takeaways.map((item, i) => (
                <li key={i}>{tx(item)}</li>
              ))}
            </ul>
          </div>
          {helpStrip}
          {mission.article && (
            <p style={{ marginTop: 14 }}>
              {t('guardians.forParents')}{' '}
              <Link to={`/parents/${mission.article}`} style={{ color: '#9db9ff', fontWeight: 700 }}>
                {t('guardians.openParentGuide')} →
              </Link>
            </p>
          )}
          <div className="debrief-actions">
            {mission.passRatio && !passed && (
              <button
                type="button"
                className="btn-solid"
                onClick={() => {
                  setScore(0)
                  setPhase('brief')
                }}
              >
                ↻ {t('guardians.replay')}
              </button>
            )}
            {mission.passRatio && passed && (
              <Link to="/guardians/certificate" className="btn-solid">
                🏆 {t('guardians.getCert')}
              </Link>
            )}
            {!mission.passRatio && next && (
              <Link to={`/guardians/mission/${next.id}`} className="btn-solid" onClick={() => { setScore(0); setPhase('brief') }}>
                {t('guardians.nextMission')}: {tx(next.name)} →
              </Link>
            )}
            <Link to="/guardians" className="pill-link">
              {t('guardians.backToMap')}
            </Link>
          </div>
        </div>
      </div>
    )
  } else {
    const round = mission.rounds[phase]
    const Round = ROUND_COMPONENTS[round.type]
    body = (
      <>
        <div className="round-dots" aria-hidden="true">
          {mission.rounds.map((_, i) => (
            <span key={i} className={i <= phase ? 'hit' : ''} style={{ '--c': mission.color, background: i <= phase ? mission.color : undefined }} />
          ))}
        </div>
        <p className="round-ind">
          {t('guardians.round')} {phase + 1} {t('guardians.of')} {mission.rounds.length} · ⚡ {score}
        </p>
        <Round key={phase} round={round} timer={mission.timer || 0} onDone={handleRoundDone} />
        {helpStrip}
      </>
    )
  }

  return (
    <div className="play-wrap fade-in" style={{ '--c': mission.color }}>
      <Link to="/guardians" className="back-btn">
        ← {t('guardians.backToMap')}
      </Link>
      <div className="play-head">
        <h1>
          <span aria-hidden="true">{mission.emoji}</span> {tx(mission.name)}
        </h1>
      </div>
      {body}
    </div>
  )
}
