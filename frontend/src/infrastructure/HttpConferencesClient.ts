import type { Conference } from '../domain/conferences/Conference'
import type { IConferencesClient } from './IConferencesClient'

export class HttpConferencesClient implements IConferencesClient {
  async getConferences(): Promise<Conference[]> {
    const response = await fetch('/api/conferences')
    return response.json()
  }
}
