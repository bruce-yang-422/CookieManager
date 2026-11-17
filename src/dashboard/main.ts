import { createApp, h } from 'vue'
import AppShell from '../lib/AppShell.vue'
import Dashboard from './Dashboard.vue'
import '../styles/base.css'

createApp({ render: () => h(AppShell, null, { default: () => h(Dashboard) }) }).mount('#app')
