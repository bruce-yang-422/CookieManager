// Cookie Manager 介紹網站的語言切換（首頁與隱私權政策共用）
// 繁體中文直接取自頁面原文；其他語言由各頁面傳入字典。
// 語言選擇存在 localStorage，切換頁面時會保留。
;(function () {
  const STORAGE_KEY = 'cm-site-lang'
  const HTML_LANG = { 'zh-TW': 'zh-Hant', 'zh-CN': 'zh-Hans', en: 'en', ja: 'ja', de: 'de', ko: 'ko', fr: 'fr', ru: 'ru', es: 'es' }

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
    // 圖片等可隨語言切換的 src 屬性
    const srcNodes = document.querySelectorAll('[data-i18n-src]')
    srcNodes.forEach((n) => {
      zh[n.dataset.i18nSrc] = n.getAttribute('src')
    })
    const hrefNodes = document.querySelectorAll('[data-i18n-href]')
    hrefNodes.forEach((n) => {
      zh[n.dataset.i18nHref] = n.getAttribute('href')
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
      if (nav.startsWith('zh-cn') || nav.startsWith('zh-sg') || nav.startsWith('zh-hans')) return 'zh-CN'
      if (nav.startsWith('zh')) return 'zh-TW'
      if (nav.startsWith('ja')) return 'ja'
      if (nav.startsWith('de')) return 'de'
      if (nav.startsWith('ko')) return 'ko'
      if (nav.startsWith('fr')) return 'fr'
      if (nav.startsWith('ru')) return 'ru'
      if (nav.startsWith('es')) return 'es'
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
      srcNodes.forEach((n) => {
        const v = dict[n.dataset.i18nSrc]
        if (v != null) n.setAttribute('src', v)
      })
      hrefNodes.forEach((n) => {
        const v = dict[n.dataset.i18nHref]
        if (v != null) n.setAttribute('href', v)
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
