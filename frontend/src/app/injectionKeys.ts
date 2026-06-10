import type { InjectionKey } from 'vue'
import type { IConferencesClient } from '../infrastructure/IConferencesClient'

export const conferencesClientKey: InjectionKey<IConferencesClient> = Symbol('conferencesClient')
