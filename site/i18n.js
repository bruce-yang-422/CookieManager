// Cookie Manager 介紹網站的語言切換（首頁與隱私權政策共用）
// 繁體中文直接取自頁面原文；英文與日文由各頁面傳入字典。
// 語言選擇存在 localStorage，切換頁面時會保留。
;(function () {
  const STORAGE_KEY = 'cm-site-lang'
  const HTML_LANG = { 'zh-TW': 'zh-Hant', en: 'en', ja: 'ja' }

  window.initI18n = function (translations) {
    const nodes = document.querySelectorAll('[data-i18n]')
    const zh = {}
    nodes.forEach((n) => {
      zh[n.dataset.i18n] = n.innerHTML
    })
    // <meta> 等以 content 屬性翻譯的節點
    const attrNodes = document.querySelectorAll('[data-i18n-content]')
    attrNodes.forEach((n) => {
      zh[n.dataset.i18nContent] = n.getAttribute('content')
    })
    const dicts = Object.assign({ 'zh-TW': zh }, translations)
    const select = document.getElementById('lang')

    function detect() {
      const q = new URLSearchParams(location.search).get('lang')
      if (q && dicts[q]) return q
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved && dicts[saved]) return saved
      } catch (e) {
        /* 無法存取時忽略 */
      }
      const nav = (navigator.language || '').toLowerCase()
      if (nav.startsWith('zh')) return 'zh-TW'
      if (nav.startsWith('ja')) return 'ja'
      return 'en'
    }

    function apply(lang) {
      const dict = dicts[lang]
      nodes.forEach((n) => {
        const v = dict[n.dataset.i18n]
        if (v != null) n.innerHTML = v
        else console.warn('[i18n] missing', lang, n.dataset.i18n)
      })
      attrNodes.forEach((n) => {
        const v = dict[n.dataset.i18nContent]
        if (v != null) n.setAttribute('content', v)
      })
      document.documentElement.lang = HTML_LANG[lang]
      if (select) select.value = lang
    }

    if (select) {
      select.addEventListener('change', () => {
        apply(select.value)
        try {
          localStorage.setItem(STORAGE_KEY, select.value)
        } catch (e) {
          /* 忽略 */
        }
      })
    }

    apply(detect())
  }
})()
