import type { InjectionKey } from 'vue'
import type { IConferencesClient } from './clients/IConferencesClient'

export const conferencesClientKey: InjectionKey<IConferencesClient> = Symbol('conferencesClient')
