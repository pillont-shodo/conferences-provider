import type { ApiProvider, ProviderResponse } from 'promptfoo'
import { getAllSpeakers } from '../../src/collects/get-all-speakers/get-all-speakers.js'

export default class GetAllSpeakersProvider implements ApiProvider {
  id() { return 'getAllSpeakers' }

  async callApi(): Promise<ProviderResponse> {
    const speakers = await getAllSpeakers(['Devoxx France', 'BreizhCamp', 'Sunny Tech'])
    return { output: speakers }
  }
}
