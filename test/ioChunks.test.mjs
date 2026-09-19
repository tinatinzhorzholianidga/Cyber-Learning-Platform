import { test } from 'node:test'
import assert from 'node:assert/strict'
import { collectLeaves, buildChunks, buildCourseChunks } from '../scripts/lib/ioChunks.mjs'

const long = (s) => `${s} `.repeat(4).trim()

const MISSION = {
  id: 'g1',
  name: { en: 'Phishing Hunter', ka: 'ფიშინგზე მონადირე' },
  desc: { en: long('Real or phish, you decide.'), ka: long('ნამდვილია თუ ფიშინგი, თქვენ წყვეტთ.') },
  theory: [{ en: long('Check the sender address.'), ka: long('შეამოწმეთ გამგზავნის მისამართი.') }, { en: 'short', ka: 'მოკლე' }],
  rounds: [
    {
      explain: { en: long('The link goes to a fake site.'), ka: long('ბმული ყალბ საიტზე მიდის.') },
      explainNegative: { en: long('A real bank never asks for a code by SMS.'), ka: long('ნამდვილი ბანკი კოდს ესემესით არ ითხოვს.') },
      options: [{ explain: { en: long('Option explanation here.'), ka: long('ვარიანტის ახსნა აქ.') } }],
      items: [{ explain: { en: long('Item explanation here.'), ka: long('ელემენტის ახსნა აქ.') } }],
    },
  ],
  takeaways: [{ en: long('When in doubt, do not click.'), ka: long('თუ ეჭვი გაქვთ, არ დააწკაპუნოთ.') }],
}
const ARTICLE = {
  id: 'a2',
  title: { en: 'Phishing & scams', ka: 'ფიშინგი და თაღლითობა' },
  teaser: { en: long('How to spot them.'), ka: long('როგორ ამოვიცნოთ.') },
  body: [
    { type: 'p', text: { en: long('Scammers create urgency.'), ka: long('თაღლითები სასწრაფოობას ქმნიან.') } },
    { type: 'list', items: [{ en: long('Check the address.'), ka: long('შეამოწმეთ მისამართი.') }, { en: long('Call the bank yourself.'), ka: long('თავად დაურეკეთ ბანკს.') }] },
  ],
}
const TIPS = [{ en: long('Update your phone tonight.'), ka: long('დღესვე განაახლეთ ტელეფონი.') }, { en: 'tiny', ka: 'პატარა' }]

test('collectLeaves finds every { en, ka } leaf in a body item', () => {
  const leaves = collectLeaves(ARTICLE.body[1])
  assert.equal(leaves.length, 2)
  assert.equal(leaves[1].ka, long('თავად დაურეკეთ ბანკს.'))
  assert.deepEqual(collectLeaves(null), [])
  assert.deepEqual(collectLeaves('text'), [])
})

test('buildChunks tags missions, guides and tips and drops fragments under 40 characters', () => {
  const chunks = buildChunks({ missions: [MISSION], articles: [ARTICLE], tips: TIPS })
  const by = chunks.reduce((acc, c) => ((acc[c.source] = (acc[c.source] || 0) + 1), acc), {})
  // mission: intro + 1 theory (the short one dropped) + explain + explainNegative + option + item + takeaway
  assert.deepEqual(by, { mission: 7, guide: 3, tip: 1 })
  const intro = chunks[0]
  assert.deepEqual(intro.title, { en: 'Mission: Phishing Hunter', ka: 'მისია: ფიშინგზე მონადირე' })
  assert.equal(intro.ref, 'g1')
  assert.ok(intro.en.startsWith('Phishing Hunter. Real or phish'))
  assert.ok(!/\s{2,}/.test(intro.ka), 'whitespace collapsed')
  const guide = chunks.find((c) => c.source === 'guide')
  assert.deepEqual(guide.title, { en: 'Guide: Phishing & scams', ka: 'გზამკვლევი: ფიშინგი და თაღლითობა' })
  const list = chunks.filter((c) => c.source === 'guide').at(-1)
  assert.ok(list.en.includes('Check the address.') && list.en.includes('Call the bank yourself.'), 'list items joined into one chunk')
  const tip = chunks.find((c) => c.source === 'tip')
  assert.deepEqual(tip, { source: 'tip', ref: 'tip-1', title: { en: 'IO tip', ka: 'იოს რჩევა' }, en: long('Update your phone tonight.'), ka: long('დღესვე განაახლეთ ტელეფონი.') })
  assert.deepEqual(buildChunks({}), [])
})

test('buildCourseChunks handles Georgian string sections and bilingual leaf sections', () => {
  const course = {
    sections: [
      { id: 3, en: 'Email security', ka: 'ელფოსტის უსაფრთხოება', chunks: [long('ფიშინგური წერილი სასწრაფოობას ქმნის.'), 'მოკლე'] },
      { title: { en: 'Passwords', ka: 'პაროლები' }, items: Array.from({ length: 12 }, (_, i) => ({ en: long(`Password rule ${i}.`), ka: long(`პაროლის წესი ${i}.`) })) },
    ],
  }
  const chunks = buildCourseChunks(course)
  assert.equal(chunks[0].source, 'course')
  assert.equal(chunks[0].ref, 'basic-3')
  assert.deepEqual(chunks[0].title, { en: 'Basic Course, topic 3: Email security', ka: 'საბაზისო კურსი, თემა 3: ელფოსტის უსაფრთხოება' })
  assert.equal(chunks[0].en, '')
  assert.equal(chunks.filter((c) => c.ref === 'basic-3').length, 1, 'the short string is dropped')
  const second = chunks.filter((c) => c.ref === 'basic-1')
  assert.ok(second.length >= 2, 'long sections are split around 700 characters')
  assert.equal(second[0].title.en, 'Basic Course, topic 1: Passwords')
  assert.ok(second.every((c) => c.en.length <= 900 && c.ka.length <= 900))
  assert.deepEqual(buildCourseChunks(null), [])
})
