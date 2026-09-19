import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SAFETY, hasPlaceholders, safetyText } from '../src/content/safety.js'

test('the shipped file holds placeholders and is therefore never read aloud', () => {
  assert.equal(hasPlaceholders(SAFETY), true)
  assert.equal(safetyText('ka'), null)
  assert.equal(safetyText('en'), null)
  for (const l of ['ka', 'en']) {
    assert.ok(SAFETY[l].intro.trim())
    assert.ok(SAFETY[l].resources.length >= 1)
    assert.ok(!/\d{3,}/.test(JSON.stringify(SAFETY)), 'no invented numbers')
  }
})

test('a filled-in file is read as intro plus one line per resource', () => {
  const filled = {
    ka: { intro: 'ეს თქვენი ბრალი არ არის.', resources: [{ name: 'ორგანიზაცია', contact: 'ბმული', note: 'ყოველდღე' }, { name: 'მეორე', contact: 'ტელეფონი' }] },
    en: { intro: 'It is not your fault.', resources: [{ name: 'Org', contact: 'link', note: 'daily' }] },
  }
  assert.equal(hasPlaceholders(filled), false)
  assert.equal(safetyText('ka', filled), 'ეს თქვენი ბრალი არ არის. ორგანიზაცია: ბმული (ყოველდღე) მეორე: ტელეფონი')
  assert.equal(safetyText('en', filled), 'It is not your fault. Org: link (daily)')
  assert.equal(safetyText('de', filled), safetyText('ka', filled), 'unknown languages fall back to Georgian')
  assert.equal(hasPlaceholders({ ka: { intro: 'TODO', resources: [] } }), true)
  assert.equal(hasPlaceholders({ ka: { intro: 'შესავსებია', resources: [] } }), true)
})
