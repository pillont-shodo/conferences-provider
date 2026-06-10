import { ref, inject, onMounted, type Ref, computed, type ComputedRef } from 'vue'
import { conferencesClientKey } from '../../injectionKeys'
import type { Conference } from '../../../domain/conferences/Conference'
import { filterConferences } from '../../../domain/conferences/filter/FilterConferencesFunctions'

export function useListConferences(term: Ref<string>): ComputedRef<Conference[]> {
  const client = inject(conferencesClientKey)!
  const list = ref<Conference[]>([])

  onMounted(async () => {
    list.value = await client.getConferences()
  })

  return computed(() => filterConferences(list.value, term.value))
}
