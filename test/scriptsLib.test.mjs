import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDotenv, mask, parseArgs, keyDescription, table } from '../scripts/lib/env.mjs'
import { wavHeader, pcmToWav, pcmDurationSec } from '../scripts/lib/wav.mjs'

const KEY = 'AIza' + 'k'.repeat(35)

test('parseDotenv handles comments, quotes and trailing comments', () => {
  const env = parseDotenv(`# comment\nIO_GEMINI_KEY=${KEY}\nVITE_A="quoted value" \nVITE_B='single'\nVITE_C=plain # trailing\n\nBROKEN\n=nokey\n`)
  assert.deepEqual(env, { IO_GEMINI_KEY: KEY, VITE_A: 'quoted value', VITE_B: 'single', VITE_C: 'plain' })
})

test('mask hides the key, key shapes and URL credentials', () => {
  assert.equal(mask(`bad ${KEY} here`, KEY), 'bad *** here')
  assert.equal(mask(`shape ${'AIza' + 'z'.repeat(35)}`), 'shape AIza***')
  assert.equal(mask('wss://host/ws?key=secret&x=1'), 'wss://host/ws?key=***&x=1')
  assert.equal(mask('https://h/p?access_token=tok'), 'https://h/p?access_token=***')
  assert.equal(mask(undefined), '')
})

test('keyDescription never contains the key', () => {
  const d = keyDescription(KEY)
  assert.ok(!d.includes(KEY))
  assert.match(d, /39 chars, AI Studio key shape/)
  assert.equal(keyDescription(''), 'none')
  assert.match(keyDescription('short'), /unexpected shape/)
})

test('parseArgs', () => {
  assert.deepEqual(parseArgs(['--live', '--voices=a,b', '--delay', '10', 'pos', '--json']), { _: ['pos'], live: true, voices: 'a,b', delay: '10', json: true })
})

test('table pads columns', () => {
  assert.equal(table([['a', 'bb']], ['h1', 'h2']), 'h1  h2\n--  --\na   bb')
})

test('wav header and duration', () => {
  const wav = pcmToWav([new Uint8Array([1, 2]), new Uint8Array([3, 4, 5, 6])], { sampleRate: 24000 })
  assert.equal(wav.length, 44 + 6)
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF')
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE')
  assert.equal(wav.readUInt32LE(4), 36 + 6)
  assert.equal(wav.readUInt16LE(22), 1)
  assert.equal(wav.readUInt32LE(24), 24000)
  assert.equal(wav.readUInt32LE(28), 48000)
  assert.equal(wav.readUInt16LE(34), 16)
  assert.equal(wav.readUInt32LE(40), 6)
  assert.deepEqual([...wav.subarray(44)], [1, 2, 3, 4, 5, 6])
  assert.equal(wavHeader({ dataBytes: 0 }).length, 44)
  assert.equal(pcmDurationSec(48000), 1)
  assert.equal(pcmDurationSec(32000, 16000), 1)
})
