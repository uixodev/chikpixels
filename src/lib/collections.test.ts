import { describe, expect, it } from 'vitest'
import { collectionName, collections, library } from './art'

describe('collections', () => {
  it('puts every picture in a collection and counts them', () => {
    expect(library.every((a) => typeof a.collection === 'string' && a.collection.length > 0)).toBe(true)
    expect(collections.reduce((n, c) => n + c.count, 0)).toBe(library.length)
  })
  it('has a Simpsons collection with the six character pictures', () => {
    const simpsons = library.filter((a) => a.collection === 'simpsons').map((a) => a.id).sort()
    expect(simpsons).toEqual(['bart', 'homer', 'lisa', 'maggie', 'marge', 'shop'])
    expect(collections[0]).toMatchObject({ id: 'simpsons', name: 'The Simpsons', count: 6 })
  })
  it('keeps the original starter pictures in their own collection', () => {
    expect(library.filter((a) => a.collection === 'originals').map((a) => a.id).sort()).toEqual(['cup', 'heart', 'star'])
  })
  it('names unknown collections tidily', () => {
    expect(collectionName('pets')).toBe('Pets')
  })
})
