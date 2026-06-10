import { describe, it, expect } from 'vitest'
import { filterConferences } from './ConferencesFunctions'
import type { Conference } from './Conference'

const conferences: Conference[] = [
  { name: 'Devoxx France' },
  { name: 'Devoxx Belgium' },
  { name: 'Nantes JUG' },
  { name: 'BDX I/O' },
]

describe('filterConferences', () => {
  it('should return all conferences when term is empty', () => {
    expect(filterConferences(conferences, '')).toHaveLength(4)
  })

  it('should filter by name', () => {
    expect(filterConferences(conferences, 'Nantes')).toEqual([{ name: 'Nantes JUG' }])
  })

  it('should match multiple results', () => {
    expect(filterConferences(conferences, 'Devoxx')).toHaveLength(2)
  })

  it('should be case-insensitive', () => {
    expect(filterConferences(conferences, 'devoxx france')).toEqual([{ name: 'Devoxx France' }])
  })

  it('should return empty array when no match', () => {
    expect(filterConferences(conferences, 'SnowCamp')).toHaveLength(0)
  })
})
