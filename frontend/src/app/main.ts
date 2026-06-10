import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { FakeConferencesClient } from '../infrastructure/FakeConferencesClient.ts'
import { HttpConferencesClient } from '../infrastructure/HttpConferencesClient.ts'
import { conferencesClientKey } from './injectionKeys'

const app = createApp(App)

const client = import.meta.env.DEV ? new FakeConferencesClient() : new HttpConferencesClient()
app.provide(conferencesClientKey, client)

app.mount('#app')
