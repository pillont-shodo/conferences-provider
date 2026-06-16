import type { ApiProvider, ProviderResponse } from 'promptfoo'
import { getConferences } from '../../src/collects/get-conferences/get-conferences.js'

export default class GetConferencesProvider implements ApiProvider {
  id() {
    return 'getConferences'
  }

  async callApi(): Promise<ProviderResponse> {
    const conferences = await getConferences()
    return { output: conferences.map((c) => c.name).join('\n') }
  }
}
