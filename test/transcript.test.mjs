import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emptyTranscript, applyCaption, markInterrupted, dropEmptyUser, completedPart, lastTurns } from '../src/voice/transcript.js'
import { createStore } from '../src/voice/store.js'

test('completedPart cuts at the last sentence end', () => {
  assert.equal(completedPart('ერთი. ორი! სამი'), 'ერთი. ორი!')
  assert.equal(completedPart('ვერსია 1.5 არის კარგი'), '')
  assert.equal(completedPart('ბოლო…'), 'ბოლო…')
  assert.equal(completedPart(''), '')
})

test('user captions replace, IO captions append, sentences are announced once', () => {
  let tr = emptyTranscript()
  tr = applyCaption(tr, { role: 'user', text: 'გამარ', final: false })
  tr = applyCaption(tr, { role: 'user', text: 'გამარჯობა', final: true })
  assert.equal(tr.turns.length, 1)
  assert.deepEqual([tr.turns[0].role, tr.turns[0].text, tr.turns[0].final], ['user', 'გამარჯობა', true])
  tr = applyCaption(tr, { role: 'io', text: 'მე იო ვარ. ' })
  tr = applyCaption(tr, { role: 'io', text: 'რა გაინტე' })
  assert.deepEqual(tr.announced, ['მე იო ვარ.'])
  tr = applyCaption(tr, { role: 'io', text: 'რესებთ?', final: true })
  assert.equal(tr.turns[1].text, 'მე იო ვარ. რა გაინტერესებთ?')
  assert.deepEqual(tr.announced, ['მე იო ვარ.', 'რა გაინტერესებთ?'])
  // the next IO caption starts a new turn
  tr = applyCaption(tr, { role: 'io', text: 'კიდევ.' })
  assert.equal(tr.turns.length, 3)
  assert.equal(lastTurns(tr, 2).length, 2)
})

test('an empty final user caption removes the open turn; replace overwrites', () => {
  let tr = applyCaption(emptyTranscript(), { role: 'user', text: '', final: false })
  assert.equal(tr.turns.length, 1)
  tr = applyCaption(tr, { role: 'user', text: '', final: true })
  assert.equal(tr.turns.length, 0)
  tr = applyCaption(tr, { role: 'io', text: 'abc' })
  tr = applyCaption(tr, { role: 'io', text: 'xyz.', replace: true, final: true })
  assert.equal(tr.turns[0].text, 'xyz.')
})

test('markInterrupted closes the open IO turn; dropEmptyUser trims silence', () => {
  let tr = applyCaption(emptyTranscript(), { role: 'io', text: 'ნახევარი წინადადება' })
  tr = markInterrupted(tr)
  assert.equal(tr.turns[0].final, true)
  assert.equal(tr.turns[0].interrupted, true)
  assert.equal(markInterrupted(tr), tr, 'nothing open: same object')
  let tr2 = applyCaption(emptyTranscript(), { role: 'user', text: '', final: false })
  tr2 = dropEmptyUser(tr2)
  assert.equal(tr2.turns.length, 0)
  const withText = applyCaption(emptyTranscript(), { role: 'user', text: 'x', final: false })
  assert.equal(dropEmptyUser(withText), withText)
})

test('the store notifies subscribers and keeps unchanged slices stable', () => {
  const store = createStore({ a: 1, list: [1] })
  let calls = 0
  const off = store.subscribe(() => (calls += 1))
  const before = store.get().list
  store.set({ a: 2 })
  assert.equal(calls, 1)
  assert.equal(store.get().list, before)
  store.set((s) => s) // same object: no notification
  assert.equal(calls, 1)
  off()
  store.set({ a: 3 })
  assert.equal(calls, 1)
})
