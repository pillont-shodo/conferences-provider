import type { Conference } from '../domain/conferences/Conference'
import type { IConferencesClient } from './IConferencesClient'

const CONFERENCES: Conference[] = [
  { name: 'Devoxx France test' },
  { name: 'BreizhCamp' },
  { name: 'BDX I/O' },
  { name: 'Sunny Tech' },
  { name: 'Human Talks Nantes' },
  { name: 'Nantes JUG' },
  { name: 'Codeurs en Seine' },
  { name: 'Touraine Tech' },
  { name: 'SnowCamp' },
  { name: 'MixIT' },
  { name: 'DevFest Nantes' },
  { name: 'Agile Tour Bordeaux' },
  { name: 'Riviera DEV' },
  { name: 'Voxxed' },
]

export class FakeConferencesClient implements IConferencesClient {
  async getConferences(): Promise<Conference[]> {
    return [...CONFERENCES]
  }
}
