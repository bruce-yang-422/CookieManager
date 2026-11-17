import type { MessageKey } from '../i18n'

/**
 * 內建基本分類與自動分類規則。
 * 只用於「使用者沒有手動指定」的網站；手動指定的分類永遠優先。
 */

export interface BuiltinCategory {
  id: string
  nameKey: MessageKey
  color: string
  /** 從哪個資料版本開始內建（升級時只補新版本加入的分類，不會把使用者刪掉的舊分類加回來） */
  since: number
}

/** 內建分類（顏色使用 Apple 系統色），順序即側邊欄顯示順序 */
export const BUILTIN_CATEGORIES: BuiltinCategory[] = [
  { id: 'work', nameKey: 'category.work', color: '#007aff', since: 1 },
  { id: 'social', nameKey: 'category.social', color: '#ff2d55', since: 1 },
  { id: 'shopping', nameKey: 'category.shopping', color: '#ff9500', since: 1 },
  { id: 'entertainment', nameKey: 'category.entertainment', color: '#af52de', since: 2 },
  { id: 'news', nameKey: 'category.news', color: '#5856d6', since: 2 },
  { id: 'search', nameKey: 'category.search', color: '#32ade6', since: 2 },
  { id: 'dev', nameKey: 'category.dev', color: '#34c759', since: 2 },
  { id: 'tech', nameKey: 'category.tech', color: '#5f7d95', since: 3 },
  { id: 'lifestyle', nameKey: 'category.lifestyle', color: '#30b0c7', since: 3 },
  { id: 'finance', nameKey: 'category.finance', color: '#ffcc00', since: 2 },
  { id: 'gov', nameKey: 'category.gov', color: '#00c7be', since: 2 },
  { id: 'local', nameKey: 'category.local', color: '#a2845e', since: 2 },
  { id: 'ads', nameKey: 'category.ads', color: '#8e8e93', since: 2 },
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
    'adbro.me', 'adentifi.com', 'adgeek.net', 'adkernel.com', 'admanmedia.com', 'admatic.de', 'admixer.net',
    'adotmob.com', 'adscale.de', 'adserv-us.com', 'adtarget.com.tr', 'adtdp.com', 'adthrive.com',
    'adventori.com', 'advividnetwork.com', 'advolve.io', 'adzerk.net', 'ambientdsp.com', 'amnet.tw',
    'adhigh.net', 'adtelligent.com', 'adlightning.com', 'adpushup.com', 'betweendigital.com', 'bidr.io',
    'btloader.com', 'cootlogix.com', 'creativecdn.com', 'dable.io', 'dynalyst.jp', 'e-planning.net',
    'eskimi.com', 'gammaplatform.com', 'geoedge.be', 'inner-active.mobi', 'intentiq.com', 'iponweb.net',
    'justpremium.com', 'lkqd.net', 'loopme.me', 'mediago.io', 'mgid.com', 'mxptint.net', 'nativo.com',
    'omnitagjs.com', 'onead.com.tw', 'popin.cc', 'postrelease.com', 'presage.io', 'quantcount.com',
    'rhythmone.com', 'richaudience.com', 'rtbhouse.com', 's-onetag.com', 'sascdn.com', 'semasio.net',
    'smaato.net', 'smadex.com', 'tagtoo.co', 'tribalfusion.com', 'uidapi.com', 'urad.com.tw', 'w55c.net',
    'yieldlab.net', 'zeotap.com', 'zqtk.net', 'adsmoloco.com', 'adtrafficquality.google',
    'amx1.net', 'aniview.com', 'appsflyersdk.com', 'aralego.com', 'ay.delivery', 'bfmio.com', 'blismedia.com',
    'cognitivlabs.com', 'company-target.com', 'connectad.io', 'cpmstar.com', 'csdata3.com', 'ctnsnet.com',
    'deepintent.com', 'digitaleast.mobi', 'doceree.com', 'eagle-insight.com', 'flashtalking.com', 'fout.jp',
    'fwmrm.net', 'getpublica.com', 'getrockerbox.com', 'gsspat.jp', 'gssprt.jp', 'html-load.com', 'hybrid.ai',
    'igaw.io', 'impact-ad.jp', 'infolinks.com', 'ingage.tech', 'insightexpressai.com', 'invol.co', 'iqm.com',
    'jivox.com', 'krushmedia.com', 'likr.com.tw', 'logly.co.jp', 'marketiq.com', 'mediagotechnology.com',
    'metaxads.com', 'missena.io', 'mobon.net', 'moloco.com', 'monetixads.com', 'mygaru.com', 'nativendo.de',
    'netinsight.co.kr', 'nextmillmedia.com', 'nexx360.io', 'nitropay.com', 'nrich.ai', 'omnisegment.com',
    'onaudience.com', 'openwebmp.com', 'optidigital.com', 'pacvue.com', 'pangle-ads.com', 'pbsadverxo.com',
    'pgammedia.com', 'pippio.com', 'pixfuture.com', 'playdigo.com', 'primis.tech', 'pro-market.net',
    'proxistore.com', 'resetdigital.co', 'rqtrk.eu', 'sharethis.com', 'shb-sync.com', 'smartclip.net',
    'socdm.com', 'sparteo.com', 'sportradarserving.com', 'stape.biz', 'startappnetwork.com', 'sundaysky.com',
    'syncingbridge.com', 't13.io', 'technoratimedia.com', 'the-ozone-project.com', 'thrtle.com',
    'travelaudience.com', 'treasuredata.com', 'trustedstack.com', 'truvidplayer.com', 'tynt.com',
    'udmserve.net', 'userreport.com', 'vm5apis.com', 'widerplanet.com', 'ymmobi.com', 'zucks.net', 'tpmn.co.kr',
    'tpmn.io', 'trafficguard.ai', 'app.link', 'onelink.me', 'nhnace.com', 'copper6.com', 'floxis.tech',
    'voisetech.com', 'uncn.jp', 'pacplatform.net', 'omgrmn.tw', 'im-apps.net', 'bricks-co.com',
  ],
  social: [
    'facebook.com', 'facebook.net', 'fbcdn.net', 'messenger.com', 'instagram.com', 'threads.net', 'twitter.com',
    'x.com', 't.co', 'twimg.com', 'linkedin.com', 'licdn.com', 'reddit.com', 'redditmedia.com', 'redditstatic.com',
    'pinterest.com', 'tiktok.com', 'tiktokcdn.com', 'line.me', 'line-scdn.net', 'discord.com', 'discord.gg',
    'telegram.org', 't.me', 'whatsapp.com', 'whatsapp.net', 'snapchat.com', 'tumblr.com', 'dcard.tw', 'ptt.cc',
    'plurk.com', 'weibo.com', 'quora.com', 'medium.com', 'bsky.app', 'mastodon.social', 'pixnet.net',
    'threads.com', 'kakao.com', 'disqus.com', 'meta.com', 'vocus.cc', 'mobile01.com', 'vuukle.net',
  ],
  shopping: [
    'amazon.com', 'amazon.co.jp', 'ebay.com', 'shopee.tw', 'shopee.com', 'shopee.co.th', 'shopee.sg',
    'momoshop.com.tw', 'pchome.com.tw', 'ruten.com.tw', 'books.com.tw', 'etmall.com.tw', 'rakuten.com.tw',
    'rakuten.co.jp', 'taobao.com', 'tmall.com', 'aliexpress.com', 'alibaba.com', 'costco.com', 'costco.com.tw',
    'ikea.com', 'uniqlo.com', 'carrefour.com.tw', 'pxmart.com.tw', '7-11.com.tw', 'family.com.tw',
    'coupang.com', 'etsy.com', 'walmart.com', 'target.com', 'bestbuy.com', 'shopline.tw', 'shopify.com',
    'myshopify.com', '91app.io', '91app.com', 'cyberbiz.io', 'cyberbiz.co', 'friday.tw', 'yahoo-shopping.tw',
    'zozo.jp', 'mercari.com', 'kkday.com', 'klook.com', 'agoda.com', 'booking.com', 'airbnb.com', 'trip.com',
    'expedia.com', 'hotels.com', 'biggo.com', 'biggo.com.tw', 'biggo.co.in', 'biggo.co.th', 'biggo.com.au',
    'biggo.com.br', 'biggo.hk', 'biggo.id', 'biggo.jp', 'biggo.mx', 'biggo.my', 'biggo.ph', 'biggo.sg',
    'coolpc.com.tw', 'decathlon.tw', 'elifemall.com.tw', 'eslite.com', 'findprice.com.tw', 'foodpanda.com.tw',
    'nidin.shop', 'openpoint.com.tw', 'pinkoi.com', 'poyabuy.com.tw', 'rakuten.com', 'rentalcars.com',
    'tk3c.com', 'ubereats.com', 'wayfair.com', 'oneboy.com.tw', 'trplus.com.tw', 'polywell.com.tw',
    '3c3c.com.tw', 'ansin168.com', 'easy.co', 'easystore.co', 'gztoy.tw', 'herzpet.com', 'isunfar.com.tw',
    'longtai.com.tw', 'tcfumbrella.com', 'petchic.com.tw', 'perandpro.com.tw', 'xrage-nakama.com',
  ],
  entertainment: [
    'youtube.com', 'ytimg.com', 'googlevideo.com', 'youtube-nocookie.com', 'netflix.com', 'nflxvideo.net',
    'twitch.tv', 'spotify.com', 'kkbox.com', 'disneyplus.com', 'hulu.com', 'primevideo.com', 'bilibili.com',
    'nicovideo.jp', 'vimeo.com', 'dailymotion.com', 'kktv.me', 'litv.tv', 'linetv.tw', 'myvideo.net.tw',
    'catchplay.com', 'iqiyi.com', 'iq.com', 'steampowered.com', 'steamcommunity.com', 'epicgames.com',
    'playstation.com', 'xbox.com', 'nintendo.com', 'gamer.com.tw', 'soundcloud.com', 'crunchyroll.com',
    'abema.tv', 'tver.jp', 'kktix.com', 'tixcraft.com', 'leagueofgraphs.com', 'leagueoflegends.com',
    'hero-wars.com', 'oncehuman.game', 'fandom.com', 'streamtheworld.com', 'astroworldmc.com', 'metabot.gg',
    'hpfl.net',
  ],
  news: [
    'udn.com', 'ltn.com.tw', 'chinatimes.com', 'ettoday.net', 'setn.com', 'tvbs.com.tw', 'cna.com.tw',
    'storm.mg', 'thenewslens.com', 'businessweekly.com.tw', 'businesstoday.com.tw', 'cw.com.tw', 'nownews.com',
    'mirrormedia.mg', 'ebc.net.tw', 'cnyes.com', 'technews.tw', 'inside.com.tw', 'bnext.com.tw', 'twreporter.org',
    'nytimes.com', 'bbc.com', 'bbc.co.uk', 'cnn.com', 'theguardian.com', 'reuters.com', 'bloomberg.com',
    'wsj.com', 'ft.com', 'washingtonpost.com', 'apnews.com', 'nikkei.com', 'asahi.com', 'yomiuri.co.jp',
    'nhk.or.jp', 'japantimes.co.jp', 'techcrunch.com', 'theverge.com', 'engadget.com', 'wired.com',
    'arstechnica.com', 'forbes.com', 'cnbc.com', 'am730.com.hk', 'hk01.com', 'mingpao.com', 'scmp.com',
    'hket.com', 'rthk.hk', 'rti.org.tw', 'pts.org.tw', 'ctwant.com', 'ctee.com.tw', 'upmedia.mg', 'newtalk.tw',
    'nextapple.com', 'msn.cn', 'bnextmedia.com.tw', 'dailyview.tw', 'ithome.com.tw', 'knews.com.tw',
    'managertoday.com.tw', 'eprice.com.tw', 'elle.com', 'harpersbazaar.com', 'vogue.com.tw', 'popdaily.com.tw',
    'kocpc.com.tw', 'womany.net', 'applealmond.com', 'tech-girlz.com', 'btoday.cc', 'helloislander.cc',
    'steachs.com', 'eventsinfocus.org', 'worldmonitor.app',
  ],
  search: [
    'google.com', 'google.com.tw', 'google.co.jp', 'bing.com', 'yahoo.com', 'yahoo.co.jp', 'baidu.com',
    'duckduckgo.com', 'naver.com', 'msn.com', 'yandex.com', 'ecosia.org', 'wikipedia.org', 'daum.net',
    'yandex.ru', 'qq.com', 'sohu.com', 'wp.pl', 'wikimedia.org', 'wikisource.org', 'grokipedia.com', '8s8s.com',
  ],
  work: [
    'microsoft.com', 'microsoftonline.com', 'live.com', 'office.com', 'office.net', 'sharepoint.com',
    'outlook.com', 'slack.com', 'notion.so', 'notion.com', 'zoom.us', 'atlassian.net', 'atlassian.com',
    'trello.com', 'asana.com', 'monday.com', 'figma.com', 'canva.com', 'dropbox.com', 'box.com', 'airtable.com',
    'salesforce.com', 'hubspot.com', 'zendesk.com', 'miro.com', 'clickup.com', 'larksuite.com', 'chatgpt.com',
    'openai.com', 'claude.ai', 'anthropic.com', 'perplexity.ai', '1password.com', '1passwordservices.com',
    'lastpass.com', 'bitwarden.com', 'docusign.net', 'docusign.com', 'adobe.com', 'grammarly.com', 'deepl.com',
    'calendly.com', 'webex.com', 'evernote.com', 'todoist.com', '104.com.tw', '1111.com.tw', '518.com.tw',
    'yourator.co', 'cakeresume.com', 'indeed.com', 'glassdoor.com', '123rf.com', 'shutterstock.com',
    'freepik.com', 'unsplash.com', 'pexels.com', 'gettyimages.com', 'istockphoto.com', 'pixabay.com',
    // AI 與生產力工具
    'claude.com', 'antigravity.google', 'gamma.app', 'gitmind.com', 'napkin.ai', 'notion.site', 'meta.ai',
    'grok.com', 'grokusercontent.com', 'x.ai', 'kling.ai', 'klingai.com', 'pictographic.ai', 'tripo3d.ai',
    'artguru.ai', 'mermaid.ai', 'comfy.org', 'immersivetranslate.com', 'imagetranslator.com', 'icons8.com',
    'dribbble.com', 'pantone.com', 'nipponcolors.com', 'zhongguose.com', 'zcool.com.cn', 'eagle.cool',
    'api2convert.com', 'convertico.com', 'fliphtml5.com', 'qr-code-generator.com', 'quickmark.com.tw',
    'similarweb.com', 'surveycake.com', 'teamviewer.com', 'ticktick.com', 'line.biz', 'respond.io',
    'jasonsavard.com', 'bit.ly', 'reurl.cc', 'lihi.cc', 'lihi.io', 'lihi1.me', 'pse.is', 'flova.ai',
    'pixzens.com', 'shotki.app', 'hgprint.com.tw', 'blueco.com.tw', 'relab.cc', 'top-mango.com', 'aguije.jp', 'onotakehiko.com',
  ],
  dev: [
    'github.com', 'githubusercontent.com', 'github.io', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com',
    'stackexchange.com', 'npmjs.com', 'vercel.com', 'vercel.app', 'netlify.com', 'netlify.app', 'cloudflare.com',
    'digitalocean.com', 'heroku.com', 'amazonaws.com', 'azure.com', 'firebaseapp.com', 'supabase.com',
    'supabase.co', 'docker.com', 'huggingface.co', 'jsdelivr.net', 'unpkg.com', 'cdnjs.com', 'codepen.io',
    'replit.com', 'jetbrains.com', 'visualstudio.com', 'mozilla.org', 'w3schools.com', 'dev.to',
    'readthedocs.io', 'sentry.io', 'newrelic.com', 'datadoghq.com', 'postman.com', 'gitbook.io', 'pypi.org',
    'chrome.com', 'web.dev', 'google.dev', 'developer.mozilla.org', 'cloud.google', 'dbdiagram.io',
    'lovable.dev', 'holistics.io', 'smartbear.com', 'apilayer.com', 'avaloniaui.net', 'gitbook.com',
    'thef2e.com', 'markdown.tw', 'recaptcha.net', 'bleachbit.org', 'realnewbie.com', 'toast.com',
    'nhncloud.com', 'nss.com.tw',
  ],
  tech: [
    // 3C、軟硬體品牌
    'apple.com', 'icloud.com', 'android.com', 'mi.com', 'xiaomi.com', 'samsung.com', 'asus.com', 'acer.com',
    'msi.com', 'gigabyte.com', 'sony.com', 'sony.com.tw', 'lg.com', 'panasonic.com', 'philips.com', 'dell.com',
    'hp.com', 'lenovo.com', 'huawei.com', 'oppo.com', 'vivo.com', 'realme.com', 'oneplus.com', 'nothing.tech',
    'logitech.com', 'logi.com', 'razer.com', 'tp-link.com', 'asus.com.tw', 'synology.com', 'qnap.com',
    'nvidia.com', 'amd.com', 'intel.com', 'opera.com', 'kaspersky.com', 'norton.com', 'avast.com', 'eset.com',
    'trendmicro.com', 'aoscdn.com', 'dyson.com', 'dyson.com.tw', 'ghtinc.com', 'jantek.com.tw',
    'homeplus.net.tw',
    // 電信業者
    'cht.com.tw', 'hinet.net', 'fetnet.net', 'taiwanmobile.com', 'tstartel.com', 'gt.com.tw', 'docomo.ne.jp',
    'softbank.jp', 'kddi.com', 'au.com', 'rakuten-mobile.co.jp', 'att.com', 'verizon.com', 't-mobile.com',
  ],
  lifestyle: [
    // 交通、外送、訂位、點餐、汽機車
    'uber.com', 'lalamove.com', 'inline.app', 'imomomenu.com', 'eztable.com', 'opentable.com', 'grab.com',
    'gogoro.com', 'wemoscooter.com', 'irentcar.com.tw', 'thsrc.com.tw', 'railway.gov.tw', 'toyota.com.tw',
    'kymco.com.tw', 'yamaha-motor.com.tw', 'honda-taiwan.com.tw', 'nissan.com.tw', 'ford.com.tw', 'tesla.com',
    'bmw.com.tw', 'mercedes-benz.com.tw', 'sym.com.tw',
    // 餐廳、生活工具、旅遊與生活部落格、公益團體
    'jhujian.com.tw', 'powerofmeat.com.tw', 'umai.tw', 'postpal.tw', 'rentkeeper.com.tw', 'ddm.org.tw',
    'irenelife.com', 'tianya.tw', 'itwmap.com', 'rodentscare.org',
  ],
  finance: [
    'paypal.com', 'stripe.com', 'visa.com', 'mastercard.com', 'cathaybk.com.tw', 'ctbcbank.com',
    'esunbank.com.tw', 'fubon.com', 'taishinbank.com.tw', 'megabank.com.tw', 'landbank.com.tw', 'sinopac.com',
    'firstbank.com.tw', 'hncb.com.tw', 'tcb-bank.com.tw', 'jkopay.com', 'binance.com', 'coinbase.com',
    'tradingview.com', 'investing.com', 'wise.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com',
    'mufg.jp', 'smbc.co.jp', 'rakuten-bank.co.jp', 'linepay.tw', 'futunn.com',
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

/** 不在政府網域結尾內、但屬於政府或公營機構的網站 */
const GOV_DOMAINS = new Set([
  'newtaipei.travel', 'taiwantrip.com.tw', 'transportdata.tw', 'taipower.com.tw', 'cambridge.org', 'prepedu.com',
])

/** 廣告與追蹤常見的網域命名（rtb＝即時競價、dsp／ssp＝廣告需求方／供應方平台） */
const ADS_PATTERN =
  /^ads?(-|$)|^adv-|^adserv|ads?(rv|srv|server|sys|system|tech|serving)|track|pixel|analytic|beacon|^bid|bid(s|der)?$|rtb|yield|retarget|.(dsp|ssp)$/

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

  if (GOV_SUFFIXES.some((suffix) => s.endsWith(suffix)) || GOV_DOMAINS.has(s)) return 'gov'

  if (ADS_PATTERN.test(parts[0])) return 'ads'

  return null
}
