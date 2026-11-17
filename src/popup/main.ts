import { createApp, h } from 'vue'
import AppShell from '../lib/AppShell.vue'
import Popup from './Popup.vue'
import '../styles/base.css'

createApp({ render: () => h(AppShell, null, { default: () => h(Popup) }) }).mount('#app')
