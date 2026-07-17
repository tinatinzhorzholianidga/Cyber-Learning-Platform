/* IO's (იო) face, drawn on a 2D canvas that is mapped onto the curved
   "screen" cap on the front of the robot. Everything uses the Candy Clay
   palette so the mascot reads as part of the design system.
   The little details (DGA plate, corner hatches, "+" mark) are carried
   over from the original mascot render. */

export const FACE_SIZE = 512

const INK = '#2b2350'
const VIOLET = '#6c5ce7'
const VIOLET_SOFT = '#e5dffa'
const SCREEN = '#ffffff'

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/* one vertical capsule eye; openness 0..1 (0 = closed) */
function eye(ctx, cx, cy, open, pupilX, pupilY) {
  const w = 52
  const hFull = 132
  const h = Math.max(hFull * open, 14)
  const x = cx + pupilX * 13 - w / 2
  const y = cy + pupilY * 11 - h / 2
  if (open < 0.14) {
    // closed: a happy downward arc
    ctx.strokeStyle = INK
    ctx.lineWidth = 14
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(cx + pupilX * 13, cy - 14, 30, Math.PI * 0.15, Math.PI * 0.85)
    ctx.stroke()
    return
  }
  ctx.fillStyle = INK
  roundRect(ctx, x, y, w, h, w / 2)
  ctx.fill()
  // shine
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.beginPath()
  ctx.arc(x + w * 0.32, y + h * 0.22, 8, 0, Math.PI * 2)
  ctx.fill()
}

function happyArcEye(ctx, cx, cy) {
  ctx.strokeStyle = INK
  ctx.lineWidth = 15
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, cy + 16, 32, Math.PI * 1.12, Math.PI * 1.88)
  ctx.stroke()
}

function roundEye(ctx, cx, cy, r, pupilX, pupilY) {
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(cx + pupilX * 10, cy + pupilY * 8, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.arc(cx + pupilX * 10 - r * 0.3, cy + pupilY * 8 - r * 0.35, r * 0.28, 0, Math.PI * 2)
  ctx.fill()
}

function starEye(ctx, cx, cy, r) {
  ctx.fillStyle = INK
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42
    const a = (i * Math.PI) / 4 - Math.PI / 2
    const px = cx + Math.cos(a) * rad
    const py = cy + Math.sin(a) * rad
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

function smile(ctx, cx, cy, w, open) {
  // filled smile; `open` 0..1 grows it into an open mouth
  const depth = 26 + 44 * open
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, cy)
  ctx.quadraticCurveTo(cx, cy + depth * 2, cx + w / 2, cy)
  ctx.quadraticCurveTo(cx, cy + depth * 0.55, cx - w / 2, cy)
  ctx.closePath()
  ctx.fill()
  if (open > 0.25) {
    ctx.fillStyle = '#ef5d8a' // little tongue
    ctx.beginPath()
    ctx.ellipse(cx, cy + depth * 1.05, w * 0.22, depth * 0.4, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function frown(ctx, cx, cy, w) {
  ctx.strokeStyle = INK
  ctx.lineWidth = 13
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, cy + 16)
  ctx.quadraticCurveTo(cx, cy - 18, cx + w / 2, cy + 16)
  ctx.stroke()
}

function flatMouth(ctx, cx, cy, w) {
  ctx.strokeStyle = INK
  ctx.lineWidth = 13
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, cy)
  ctx.lineTo(cx + w / 2, cy)
  ctx.stroke()
}

function nose(ctx, cx, cy) {
  // the little "7" nose from the original render
  ctx.strokeStyle = INK
  ctx.lineWidth = 11
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - 11, cy - 10)
  ctx.lineTo(cx + 9, cy - 10)
  ctx.lineTo(cx - 2, cy + 14)
  ctx.stroke()
}

function decorations(ctx) {
  // corner hatch marks
  ctx.strokeStyle = 'rgba(43,35,80,0.30)'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  for (let i = 0; i < 7; i++) {
    const h = 26 - Math.abs(i - 3) * 4
    ctx.beginPath()
    ctx.moveTo(88 + i * 11, 116)
    ctx.lineTo(88 + i * 11 - 6, 116 + h)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(350 + i * 11, 116)
    ctx.lineTo(350 + i * 11 - 6, 116 + h)
    ctx.stroke()
  }
  // "+" mark near the right eye
  ctx.strokeStyle = INK
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(400, 178)
  ctx.lineTo(400, 206)
  ctx.moveTo(386, 192)
  ctx.lineTo(414, 192)
  ctx.stroke()
}

/**
 * Draw the whole face.
 * state = { emotion, blink 0..1 (1 = closed), pupilX -1..1, pupilY -1..1,
 *           mouthOpen 0..1 }
 */
export function drawFace(ctx, state) {
  const { emotion = 'happy', blink = 0, pupilX = 0, pupilY = 0, mouthOpen = 0 } = state
  const S = FACE_SIZE
  ctx.clearRect(0, 0, S, S)

  // screen plate with violet bezel
  ctx.fillStyle = SCREEN
  roundRect(ctx, 22, 22, S - 44, S - 44, 108)
  ctx.fill()
  ctx.strokeStyle = VIOLET
  ctx.lineWidth = 16
  roundRect(ctx, 30, 30, S - 60, S - 60, 100)
  ctx.stroke()
  ctx.strokeStyle = VIOLET_SOFT
  ctx.lineWidth = 4
  roundRect(ctx, 48, 48, S - 96, S - 96, 86)
  ctx.stroke()

  // DGA plate on the forehead
  ctx.fillStyle = INK
  ctx.font = '800 46px "Noto Sans Georgian Variable", "Arial Black", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('D G A', S / 2, 122)

  decorations(ctx)

  const eyeY = 248
  const eyeL = 188
  const eyeR = 324
  const open = 1 - blink
  const mouthY = 386

  switch (emotion) {
    case 'excited':
      starEye(ctx, eyeL + pupilX * 10, eyeY + pupilY * 8, 42)
      starEye(ctx, eyeR + pupilX * 10, eyeY + pupilY * 8, 42)
      smile(ctx, 256, mouthY - 6, 132, Math.max(0.55, mouthOpen))
      break
    case 'wink':
      eye(ctx, eyeL, eyeY, open, pupilX, pupilY)
      happyArcEye(ctx, eyeR, eyeY - 12)
      smile(ctx, 256, mouthY, 116, mouthOpen)
      break
    case 'celebrate':
      happyArcEye(ctx, eyeL, eyeY - 12)
      happyArcEye(ctx, eyeR, eyeY - 12)
      smile(ctx, 256, mouthY - 6, 138, Math.max(0.6, mouthOpen))
      break
    case 'funny':
      // laughing: one eye winked, big open smile with tongue
      happyArcEye(ctx, eyeL, eyeY - 12)
      eye(ctx, eyeR, eyeY, open, pupilX, pupilY)
      smile(ctx, 256, mouthY - 4, 148, Math.max(0.75, mouthOpen))
      ctx.fillStyle = VIOLET
      ctx.font = '800 34px "Noto Sans Georgian Variable", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('HA', 416, 236)
      ctx.font = '800 26px "Noto Sans Georgian Variable", sans-serif'
      ctx.fillText('HA', 436, 268)
      break
    case 'thinking': {
      // eyes drift up and to the side, one raised brow, small flat mouth
      ctx.strokeStyle = INK
      ctx.lineWidth = 12
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(eyeR - 34, eyeY - 96)
      ctx.quadraticCurveTo(eyeR, eyeY - 116, eyeR + 34, eyeY - 100)
      ctx.stroke()
      eye(ctx, eyeL, eyeY, open, -0.55, -0.75)
      eye(ctx, eyeR, eyeY, open, -0.55, -0.75)
      flatMouth(ctx, 282, mouthY + 4, 62)
      break
    }
    case 'surprised':
      roundEye(ctx, eyeL, eyeY, 36, pupilX, pupilY)
      roundEye(ctx, eyeR, eyeY, 36, pupilX, pupilY)
      ctx.fillStyle = INK
      ctx.beginPath()
      ctx.ellipse(256, mouthY + 14, 26, 34, 0, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'sleepy': {
      // heavy lids
      ctx.strokeStyle = INK
      ctx.lineWidth = 14
      ctx.lineCap = 'round'
      for (const cx of [eyeL, eyeR]) {
        ctx.beginPath()
        ctx.arc(cx, cy_(eyeY), 30, Math.PI * 0.1, Math.PI * 0.9)
        ctx.stroke()
      }
      flatMouth(ctx, 256, mouthY + 8, 46)
      ctx.fillStyle = VIOLET
      ctx.font = '800 44px "Noto Sans Georgian Variable", sans-serif'
      ctx.fillText('z', 396, 226)
      ctx.font = '800 30px "Noto Sans Georgian Variable", sans-serif'
      ctx.fillText('z', 424, 194)
      break
    }
    case 'sad': {
      ctx.strokeStyle = INK
      ctx.lineWidth = 11
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(eyeL - 34, eyeY - 92)
      ctx.lineTo(eyeL + 26, eyeY - 76)
      ctx.moveTo(eyeR + 34, eyeY - 92)
      ctx.lineTo(eyeR - 26, eyeY - 76)
      ctx.stroke()
      eye(ctx, eyeL, eyeY + 8, open * 0.8, pupilX, pupilY + 0.3)
      eye(ctx, eyeR, eyeY + 8, open * 0.8, pupilX, pupilY + 0.3)
      frown(ctx, 256, mouthY + 10, 86)
      break
    }
    default:
      // happy
      eye(ctx, eyeL, eyeY, open, pupilX, pupilY)
      eye(ctx, eyeR, eyeY, open, pupilX, pupilY)
      smile(ctx, 256, mouthY, 120, mouthOpen)
  }

  if (emotion !== 'surprised' && emotion !== 'sleepy') nose(ctx, 256, 330)
}

/* sleepy eyes sit a touch lower */
function cy_(y) {
  return y + 10
}

/* Quantized key so we only repaint the canvas when something visible
   actually changed (texture uploads are the expensive part). */
export function faceKey(state) {
  const q = (v) => Math.round(v * 24)
  return `${state.emotion}|${q(state.blink)}|${q(state.pupilX)}|${q(state.pupilY)}|${q(state.mouthOpen)}`
}
