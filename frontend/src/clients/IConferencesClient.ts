import type { Conference } from '../domain/conferences/Conference'

export interface IConferencesClient {
  getConferences(): Promise<Conference[]>
}
