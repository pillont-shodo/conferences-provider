import type { ApiProvider, ProviderResponse } from 'promptfoo'
import { getConferences } from '../../src/collects/get-conferences/get-conferences.js'
import { getAllSpeakers } from '../../src/collects/get-all-speakers/get-all-speakers.js'
import { getSpeaks } from '../../src/collects/get-speaks/get-speaks.js'

export default class GetSpeaksProvider implements ApiProvider {
  id() {
    return 'getSpeaks'
  }

  async callApi(): Promise<ProviderResponse> {
    const conferences = await getConferences()
    const speakers = await getAllSpeakers()
    const speaks = getSpeaks(conferences, speakers)
    return { output: speaks }
  }
}
