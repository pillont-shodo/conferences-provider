import { createApp } from 'vue'
import './style.css'
import App from './app.vue'
import { FakeConferencesClient } from './clients/FakeConferencesClient'
import { HttpConferencesClient } from './clients/HttpConferencesClient'
import { conferencesClientKey } from './injectionKeys'

const app = createApp(App)

const client = import.meta.env.DEV ? new FakeConferencesClient() : new HttpConferencesClient()
app.provide(conferencesClientKey, client)

app.mount('#app')
