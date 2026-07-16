import a1 from './articles/a1.js'
import a2 from './articles/a2.js'
import a3 from './articles/a3.js'
import a4 from './articles/a4.js'
import a5 from './articles/a5.js'
import a6 from './articles/a6.js'
import a7 from './articles/a7.js'
import b1 from './articles/b1.js'
import b2 from './articles/b2.js'
import b3 from './articles/b3.js'
import b4 from './articles/b4.js'
import b5 from './articles/b5.js'
import c1 from './articles/c1.js'
import c2 from './articles/c2.js'
import c3 from './articles/c3.js'
import c4 from './articles/c4.js'

export const ARTICLES = [a1, a2, a3, a4, a5, a6, a7, b1, b2, b3, b4, b5, c1, c2, c3, c4]

export const articleById = Object.fromEntries(ARTICLES.map((a) => [a.id, a]))

export const SHELVES = ['A', 'B', 'C']

export function articlesInShelf(shelf) {
  return ARTICLES.filter((a) => a.shelf === shelf).sort((x, y) => x.order - y.order)
}
