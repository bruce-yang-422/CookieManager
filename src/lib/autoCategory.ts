import type { MessageKey } from '../i18n'

/**
 * 內建基本分類與自動分類規則。
 * 只用於「使用者沒有手動指定」的網站；手動指定的分類永遠優先。
 */

export interface BuiltinCategory {
  id: string
  nameKey: MessageKey
  color: string
}

/** 內建分類（顏色使用 Apple 系統色），順序即側邊欄顯示順序 */
export const BUILTIN_CATEGORIES: BuiltinCategory[] = [
  { id: 'work', nameKey: 'category.work', color: '#007aff' },
  { id: 'social', nameKey: 'category.social', color: '#ff2d55' },
  { id: 'shopping', nameKey: 'category.shopping', color: '#ff9500' },
  { id: 'entertainment', nameKey: 'category.entertainment', color: '#af52de' },
  { id: 'news', nameKey: 'category.news', color: '#5856d6' },
  { id: 'search', nameKey: 'category.search', color: '#32ade6' },
  { id: 'dev', nameKey: 'category.dev', color: '#34c759' },
  { id: 'finance', nameKey: 'category.finance', color: '#ffcc00' },
  { id: 'gov', nameKey: 'category.gov', color: '#00c7be' },
  { id: 'local', nameKey: 'category.local', color: '#a2845e' },
  { id: 'ads', nameKey: 'category.ads', color: '#8e8e93' },
]

/** 已知網域 → 分類 */
const DOMAINS: Record<string, string[]> = {
  ads: [
    // 廣告聯播、競價、追蹤與分析
    '2mdn.net', '33across.com', '360yield.com', '3lift.com', '4dex.io', 'a-mo.net', 'a-mx.com', 'abr.ge',
    'acuityplatform.com', 'ad-m.asia', 'ad-stir.com', 'ad2iction.com', 'adform.net', 'adingo.jp', 'adition.com',
    'adnxs.com', 'adroll.com', 'adsafeprotected.com', 'adsrvr.org', 'adsymptotic.com', 'advertising.com',
    'agkn.com', 'amazon-adsystem.com', 'amplitude.com', 'appier.net', 'appsflyer.com', 'adjust.com', 'awin1.com',
    'bidswitch.net', 'bluekai.com', 'branch.io', 'brand-display.com', 'bttrack.com', 'cadent.tv', 'casalemedia.com',
    'ccgateway.net', 'chartbeat.com', 'chartbeat.net', 'clarity.ms', 'clickforce.com.tw', 'contextweb.com',
    'crazyegg.com', 'criteo.com', 'criteo.net', 'crwdcntrl.net', 'cxense.com', 'demdex.net', 'dotomi.com',
    'doubleclick.net', 'doubleverify.com', 'everesttech.net', 'exelator.com', 'eyeota.net', 'fullstory.com',
    'google-analytics.com', 'googleadservices.com', 'googlesyndication.com', 'googletagmanager.com',
    'googletagservices.com', 'gumgum.com', 'hotjar.com', 'hotjar.io', 'i-mobile.co.jp', 'id5-sync.com',
    'imrworldwide.com', 'indexww.com', 'inmobi.com', 'ipredictive.com', 'krxd.net', 'ladsp.com', 'liadm.com',
    'lijit.com', 'likr.tw', 'linksynergy.com', 'mathtag.com', 'media.net', 'mediamath.com', 'mfadsrv.com',
    'microad.jp', 'mixpanel.com', 'ml314.com', 'moatads.com', 'mookie1.com', 'mouseflow.com', 'omtrdc.net',
    'onetag-sys.com', 'openx.net', 'optimizely.com', 'outbrain.com', 'owneriq.net', 'pubmatic.com',
    'quantserve.com', 'rfihub.com', 'rlcdn.com', 'rubiconproject.com', 'scorecardresearch.com', 'scupio.com',
    'segment.com', 'segment.io', 'serving-sys.com', 'sharethrough.com', 'simpli.fi', 'sitescout.com',
    'smartadserver.com', 'sonobi.com', 'spotxchange.com', 'stackadapt.com', 'taboola.com', 'tapad.com',
    'teads.tv', 'tenmax.io', 'tremorhub.com', 'triplelift.com', 'turn.com', 'unrulymedia.com', 'yieldmo.com',
    'zemanta.com', 'ads-twitter.com', 'adsco.re', 'bing.net', 'nr-data.net', '1rx.io', 'cadent.com',
    'chocolateplatform.com', 'vidazoo.com', 'seedtag.com', 'kargo.com', 'undertone.com', 'connatix.com',
  ],
  social: [
    'facebook.com', 'facebook.net', 'fbcdn.net', 'messenger.com', 'instagram.com', 'threads.net', 'twitter.com',
    'x.com', 't.co', 'twimg.com', 'linkedin.com', 'licdn.com', 'reddit.com', 'redditmedia.com', 'redditstatic.com',
    'pinterest.com', 'tiktok.com', 'tiktokcdn.com', 'line.me', 'line-scdn.net', 'discord.com', 'discord.gg',
    'telegram.org', 't.me', 'whatsapp.com', 'whatsapp.net', 'snapchat.com', 'tumblr.com', 'dcard.tw', 'ptt.cc',
    'plurk.com', 'weibo.com', 'quora.com', 'medium.com', 'bsky.app', 'mastodon.social', 'pixnet.net',
  ],
  shopping: [
    'amazon.com', 'amazon.co.jp', 'ebay.com', 'shopee.tw', 'shopee.com', 'shopee.co.th', 'shopee.sg',
    'momoshop.com.tw', 'pchome.com.tw', 'ruten.com.tw', 'books.com.tw', 'etmall.com.tw', 'rakuten.com.tw',
    'rakuten.co.jp', 'taobao.com', 'tmall.com', 'aliexpress.com', 'alibaba.com', 'costco.com', 'costco.com.tw',
    'ikea.com', 'uniqlo.com', 'carrefour.com.tw', 'pxmart.com.tw', '7-11.com.tw', 'family.com.tw',
    'coupang.com', 'etsy.com', 'walmart.com', 'target.com', 'bestbuy.com', 'shopline.tw', 'shopify.com',
    'myshopify.com', '91app.io', '91app.com', 'cyberbiz.io', 'cyberbiz.co', 'friday.tw', 'yahoo-shopping.tw',
    'zozo.jp', 'mercari.com', 'kkday.com', 'klook.com', 'agoda.com', 'booking.com', 'airbnb.com', 'trip.com',
    'expedia.com', 'hotels.com',
  ],
  entertainment: [
    'youtube.com', 'ytimg.com', 'googlevideo.com', 'youtube-nocookie.com', 'netflix.com', 'nflxvideo.net',
    'twitch.tv', 'spotify.com', 'kkbox.com', 'disneyplus.com', 'hulu.com', 'primevideo.com', 'bilibili.com',
    'nicovideo.jp', 'vimeo.com', 'dailymotion.com', 'kktv.me', 'litv.tv', 'linetv.tw', 'myvideo.net.tw',
    'catchplay.com', 'iqiyi.com', 'iq.com', 'steampowered.com', 'steamcommunity.com', 'epicgames.com',
    'playstation.com', 'xbox.com', 'nintendo.com', 'gamer.com.tw', 'soundcloud.com', 'crunchyroll.com',
    'abema.tv', 'tver.jp', 'kktix.com', 'tixcraft.com',
  ],
  news: [
    'udn.com', 'ltn.com.tw', 'chinatimes.com', 'ettoday.net', 'setn.com', 'tvbs.com.tw', 'cna.com.tw',
    'storm.mg', 'thenewslens.com', 'businessweekly.com.tw', 'businesstoday.com.tw', 'cw.com.tw', 'nownews.com',
    'mirrormedia.mg', 'ebc.net.tw', 'cnyes.com', 'technews.tw', 'inside.com.tw', 'bnext.com.tw', 'twreporter.org',
    'nytimes.com', 'bbc.com', 'bbc.co.uk', 'cnn.com', 'theguardian.com', 'reuters.com', 'bloomberg.com',
    'wsj.com', 'ft.com', 'washingtonpost.com', 'apnews.com', 'nikkei.com', 'asahi.com', 'yomiuri.co.jp',
    'nhk.or.jp', 'japantimes.co.jp', 'techcrunch.com', 'theverge.com', 'engadget.com', 'wired.com',
    'arstechnica.com', 'forbes.com', 'cnbc.com',
  ],
  search: [
    'google.com', 'google.com.tw', 'google.co.jp', 'bing.com', 'yahoo.com', 'yahoo.co.jp', 'baidu.com',
    'duckduckgo.com', 'naver.com', 'msn.com', 'yandex.com', 'ecosia.org', 'wikipedia.org',
  ],
  work: [
    'microsoft.com', 'microsoftonline.com', 'live.com', 'office.com', 'office.net', 'sharepoint.com',
    'outlook.com', 'slack.com', 'notion.so', 'notion.com', 'zoom.us', 'atlassian.net', 'atlassian.com',
    'trello.com', 'asana.com', 'monday.com', 'figma.com', 'canva.com', 'dropbox.com', 'box.com', 'airtable.com',
    'salesforce.com', 'hubspot.com', 'zendesk.com', 'miro.com', 'clickup.com', 'larksuite.com', 'chatgpt.com',
    'openai.com', 'claude.ai', 'anthropic.com', 'perplexity.ai', '1password.com', '1passwordservices.com',
    'lastpass.com', 'bitwarden.com', 'docusign.net', 'docusign.com', 'adobe.com', 'grammarly.com', 'deepl.com',
    'calendly.com', 'webex.com', 'evernote.com', 'todoist.com', '104.com.tw', '1111.com.tw', '518.com.tw',
    'yourator.co', 'cakeresume.com', 'indeed.com', 'glassdoor.com',
  ],
  dev: [
    'github.com', 'githubusercontent.com', 'github.io', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com',
    'stackexchange.com', 'npmjs.com', 'vercel.com', 'vercel.app', 'netlify.com', 'netlify.app', 'cloudflare.com',
    'digitalocean.com', 'heroku.com', 'amazonaws.com', 'azure.com', 'firebaseapp.com', 'supabase.com',
    'supabase.co', 'docker.com', 'huggingface.co', 'jsdelivr.net', 'unpkg.com', 'cdnjs.com', 'codepen.io',
    'replit.com', 'jetbrains.com', 'visualstudio.com', 'mozilla.org', 'w3schools.com', 'dev.to',
    'readthedocs.io', 'sentry.io', 'newrelic.com', 'datadoghq.com', 'postman.com', 'gitbook.io', 'pypi.org',
    'chrome.com', 'web.dev', 'google.dev', 'developer.mozilla.org',
  ],
  finance: [
    'paypal.com', 'stripe.com', 'visa.com', 'mastercard.com', 'cathaybk.com.tw', 'ctbcbank.com',
    'esunbank.com.tw', 'fubon.com', 'taishinbank.com.tw', 'megabank.com.tw', 'landbank.com.tw', 'sinopac.com',
    'firstbank.com.tw', 'hncb.com.tw', 'tcb-bank.com.tw', 'jkopay.com', 'binance.com', 'coinbase.com',
    'tradingview.com', 'investing.com', 'wise.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com',
    'mufg.jp', 'smbc.co.jp', 'rakuten-bank.co.jp', 'linepay.tw',
  ],
}

const DOMAIN_MAP = new Map<string, string>()
for (const [category, list] of Object.entries(DOMAINS)) {
  for (const d of list) DOMAIN_MAP.set(d, category)
}

/** 政府與教育機構的網域結尾 */
const GOV_SUFFIXES = [
  '.gov', '.gov.tw', '.edu', '.edu.tw', '.go.jp', '.ac.jp', '.lg.jp', '.gov.uk', '.ac.uk', '.gov.cn',
  '.edu.cn', '.gov.hk', '.edu.hk', '.gov.sg', '.edu.sg', '.mil', '.int',
]

/** 廣告與追蹤常見的網域命名 */
const ADS_PATTERN =
  /^ads?(-|$)|^adv-|ads?(rv|srv|server|sys|system|tech|serving)|track|pixel|analytic|beacon|bidder|^rtb|yield|retarget/

/** 依網域判斷建議的分類 id；判斷不出來時回傳 null */
export function autoCategoryOf(site: string): string | null {
  const s = site.toLowerCase()

  // 本機與區域網路
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(s) || s.includes(':') || !s.includes('.')) return 'local'
  if (/\.(local|lan|internal|home|localhost|test)$/.test(s)) return 'local'

  // 已知網域（含子網域）
  const parts = s.split('.')
  for (let i = 0; i < parts.length - 1; i++) {
    const hit = DOMAIN_MAP.get(parts.slice(i).join('.'))
    if (hit) return hit
  }

  if (GOV_SUFFIXES.some((suffix) => s.endsWith(suffix))) return 'gov'

  if (ADS_PATTERN.test(parts[0])) return 'ads'

  return null
}
