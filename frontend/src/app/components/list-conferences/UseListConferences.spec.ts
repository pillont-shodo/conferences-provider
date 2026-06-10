// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { createApp, defineComponent, ref, type Ref } from 'vue'
import { useListConferences } from './UseListConferences'
import { conferencesClientKey } from '../../injectionKeys'
import type { IConferencesClient } from '../../../infrastructure/IConferencesClient'
import type { Conference } from '../../../domain/conferences/Conference'

const fakeConferences: Conference[] = [
  { name: 'Devoxx France' },
  { name: 'Nantes JUG' },
  { name: 'BDX I/O' },
]

const fakeClient: IConferencesClient = {
  getConferences: async () => fakeConferences,
}


describe('useListConferences', () => {
  let term: Ref<string>
  let result: ReturnType<typeof useListConferences>

  beforeEach(async () => {
    term = ref('')
  
    const app = createApp(defineComponent({
      setup() {
        result = useListConferences(term)
        return () => null
      },
    }))
    app.provide(conferencesClientKey, fakeClient)
    app.mount(document.createElement('div'))    
})

  it('should return all conferences when term is empty', async () => {
    expect(result.value).toHaveLength(3)
  })

  it('should filter conferences by term', async () => {
    term.value = 'Devoxx'
    
    expect(result.value).toEqual([{ name: 'Devoxx France' }])
  })

  it('should react to term change', async () => {
    expect(result.value).toHaveLength(3)

    term.value = 'Nantes'

    expect(result.value).toEqual([{ name: 'Nantes JUG' }])
  })

  it('should return empty list when no match', async () => {
    term.value = 'SnowCamp'

    expect(result.value).toHaveLength(0)
  })
})
