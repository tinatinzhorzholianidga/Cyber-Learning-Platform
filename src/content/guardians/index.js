// Mission registry: merges card metadata (meta.js) with gameplay data (g*.js).
//
// Gameplay data contract (one file per mission, default export):
//   {
//     brief: {en,ka},                    // scenario setup, 2nd person, no lecture
//     helpStrip: {en,ka},                // optional — sensitive missions only
//     timer: seconds, passRatio: 0..1,   // optional — final exam only
//     rounds: [
//       { type:'choice', card?, q, options:[{label,correct}], explain }   // max 10
//       { type:'flags', prompt, items:[{from?,text,flag,explain}], explain } // max 5×flags
//       { type:'builder', prompt, target, meterLow, meterHigh,
//         options:[{label,note?,value}], explain, explainNegative? }      // max 15
//       { type:'branch', start, max, nodes:{ id:{chat?,scene?,choices?|end} } } // max declared
//     ],
//     takeaways: [{en,ka}, …]            // 3–5 debrief bullets
//   }
// All text leaves are {en,ka} objects.
import { MISSION_META } from './meta.js'
import g1 from './g1.js'
import g2 from './g2.js'
import g3 from './g3.js'
import g4 from './g4.js'
import g5 from './g5.js'
import g6 from './g6.js'
import g7 from './g7.js'
import g8 from './g8.js'
import g9 from './g9.js'
import g10 from './g10.js'

const GAME_DATA = { g1, g2, g3, g4, g5, g6, g7, g8, g9, g10 }

export const MISSIONS = MISSION_META.map((meta) => ({ ...meta, ...GAME_DATA[meta.id] }))

export const missionById = Object.fromEntries(MISSIONS.map((m) => [m.id, m]))

export function roundMax(round) {
  if (round.type === 'choice') return 10
  if (round.type === 'flags') return round.items.filter((i) => i.flag).length * 5
  if (round.type === 'builder') return 15
  if (round.type === 'branch') return round.max
  return 0
}

export function missionMax(mission) {
  return mission.rounds.reduce((sum, r) => sum + roundMax(r), 0)
}
