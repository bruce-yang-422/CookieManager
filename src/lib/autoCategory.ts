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
    // 日本：聯盟行銷、廣告聯播與分析
    'a8.net', 'accesstrade.net', 'afi-b.com', 'valuecommerce.com', 'valuecommerce.ne.jp', 'rentracks.jp',
    'moshimo.com', 'felmat.net', 'fluct.jp', 'gmossp-sp.jp', 'ad-cloud.jp', 'karte.io', 'ptengine.jp',
    'ptengine.com', 'smartnews-ads.com', 'yjtag.jp', 'adebis.jp', 'ebis.ne.jp',
    // 歐美：分析、行銷自動化與聯盟行銷
    'quantcast.com', 'comscore.com', 'kochava.com', 'singular.net', 'heap.io', 'heapanalytics.com', 'pendo.io',
    'logrocket.com', 'smartlook.com', 'posthog.com', 'plausible.io', 'matomo.cloud', 'statcounter.com',
    'addthis.com', 'addtoany.com', 'onesignal.com', 'braze.com', 'klaviyo.com', 'attentivemobile.com',
    'impact.com', 'cj.com', 'shareasale.com', 'skimlinks.com', 'viglink.com', 'bounceexchange.com',
    'wunderkind.co', 'permutive.com', 'liveramp.com', 'lotame.com', 'tealiumiq.com', 'adobedtm.com',
    'demandbase.com', '6sc.co', 'bizible.com', 'marketo.net', 'mktoresp.com', 'pardot.com', 'hs-analytics.net',
    'hs-scripts.com', 'hsadspixel.net', 'usbrowserspeed.com', 'tiqcdn.com', 'contentsquare.net', 'quantummetric.com',
  ],
  social: [
    'facebook.com', 'facebook.net', 'fbcdn.net', 'messenger.com', 'instagram.com', 'threads.net', 'twitter.com',
    'x.com', 't.co', 'twimg.com', 'linkedin.com', 'licdn.com', 'reddit.com', 'redditmedia.com', 'redditstatic.com',
    'pinterest.com', 'tiktok.com', 'tiktokcdn.com', 'line.me', 'line-scdn.net', 'discord.com', 'discord.gg',
    'telegram.org', 't.me', 'whatsapp.com', 'whatsapp.net', 'snapchat.com', 'tumblr.com', 'dcard.tw', 'ptt.cc',
    'plurk.com', 'weibo.com', 'quora.com', 'medium.com', 'bsky.app', 'mastodon.social', 'pixnet.net',
    'threads.com', 'kakao.com', 'disqus.com', 'meta.com', 'vocus.cc', 'mobile01.com', 'vuukle.net',
    'cdninstagram.com', 'redd.it', 'pinimg.com', 'tiktokv.com', 'signal.org', 'viber.com', 'band.us',
    'nextdoor.com', 'vk.com', 'ok.ru', 'xiaohongshu.com', 'douyin.com', 'wechat.com', 'substack.com',
    'wordpress.com', 'blogger.com', 'blogspot.com', 'flickr.com', 'deviantart.com', 'goodreads.com',
    'meetup.com', 'tinder.com', 'bumble.com', 'patreon.com', 'truthsocial.com', 'lemon8-app.com',
    'misskey.io', 'mixi.jp',
    // 日本：部落格、論壇與創作社群
    'ameblo.jp', 'ameba.jp', 'note.com', 'hatena.ne.jp', 'hatenablog.com', 'hatenablog.jp', 'hatenadiary.com',
    '5ch.net', 'livedoor.blog', 'blog.jp', 'fc2.com', 'pixiv.net', 'fanbox.cc', 'ci-en.net', 'seesaa.net',
    'togetter.com', 'peing.net', 'marshmallow-qa.com',
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
    // Amazon 各國站與資源網域
    'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.ca', 'amazon.com.au',
    'amazon.in', 'amazon.com.mx', 'amazon.sg', 'media-amazon.com', 'ssl-images-amazon.com', 'alicdn.com',
    // 日本
    'yodobashi.com', 'biccamera.com', 'kakaku.com', 'mercari.jp', 'qoo10.jp', 'lohaco.jp', 'askul.co.jp',
    'muji.com', 'nitori-net.jp', 'gu-global.com', 'donki.com', 'aeon.com', 'aeonnetshop.com', 'hmv.co.jp',
    'tower.jp', 'animate-onlineshop.jp', 'suruga-ya.jp', 'mandarake.co.jp', 'booth.pm', 'jalan.net',
    'ikyu.com', 'jtb.co.jp', 'his-j.com', 'joshinweb.jp', 'ksdenki.com',
    'edion.com', 'nojima.co.jp', 'sofmap.com', 'dinos.co.jp', 'belluna.net', 'felissimo.co.jp', 'cainz.com',
    'monotaro.com', 'tsutaya.co.jp', 'yamada-denkiweb.com',
    // 美國
    'homedepot.com', 'lowes.com', 'macys.com', 'nordstrom.com', 'kohls.com', 'samsclub.com', 'newegg.com',
    'bhphotovideo.com', 'chewy.com', 'instacart.com', 'temu.com', 'shein.com', 'wish.com', 'zappos.com',
    'nike.com', 'adidas.com', 'sephora.com', 'ulta.com', 'gap.com', 'cvs.com', 'walgreens.com', 'kroger.com',
    'overstock.com', 'poshmark.com', 'stockx.com', 'gumroad.com', 'qvc.com', 'dickssportinggoods.com',
    // 英國與歐洲
    'ebay.co.uk', 'ebay.de', 'argos.co.uk', 'tesco.com', 'sainsburys.co.uk', 'asda.com', 'johnlewis.com',
    'currys.co.uk', 'marksandspencer.com', 'boots.com', 'next.co.uk', 'ocado.com', 'very.co.uk', 'asos.com',
    'hm.com', 'zara.com', 'zalando.com', 'otto.de', 'bol.com', 'allegro.pl', 'vinted.com', 'depop.com',
    'farfetch.com', 'ssense.com', 'aliexpress.us', 'lidl.com', 'aldi.com',
    // 其他地區
    'mercadolibre.com', 'flipkart.com', 'lazada.com', 'tokopedia.com', 'gmarket.co.kr', '11st.co.kr',
    'jd.com', 'pinduoduo.com', 'hktvmall.com',
    // 旅遊、航空、飯店
    'kayak.com', 'skyscanner.net', 'skyscanner.com', 'tripadvisor.com', 'priceline.com', 'vrbo.com',
    'trivago.com', 'hostelworld.com', 'marriott.com', 'hilton.com', 'ihg.com', 'hyatt.com', 'accor.com',
    'united.com', 'delta.com', 'aa.com', 'britishairways.com', 'jal.co.jp', 'ana.co.jp', 'evaair.com',
    'china-airlines.com', 'cathaypacific.com', 'singaporeair.com', 'emirates.com', 'ryanair.com',
    'easyjet.com', 'starlux-airlines.com', 'tigerairtw.com', 'flypeach.com', 'jetstar.com',
    'ezfly.com', 'liontravel.com', 'colatour.com.tw', 'eztravel.com.tw',
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
    // 影音串流與音樂
    'max.com', 'hbomax.com', 'paramountplus.com', 'peacocktv.com', 'pluto.tv', 'tubitv.com', 'roku.com',
    'sling.com', 'fubo.tv', 'dazn.com', 'nflxext.com', 'nflximg.net', 'nflxso.net', 'disney.com', 'disney.co.jp',
    'disneyplus.jp', 'u-next.jp', 'unext.jp', 'hulu.jp', 'telasa.jp', 'nimg.jp',
    'nicochannel.jp', 'showroom-live.com', 'twitcasting.tv', 'openrec.tv', 'radiko.jp',
    'deezer.com', 'tidal.com', 'pandora.com', 'iheart.com', 'audible.com', 'audible.co.jp', 'last.fm',
    'genius.com', 'bandcamp.com', 'mixcloud.com', 'spotifycdn.com', 'scdn.co', 'kick.com', 'rumble.com',
    'itv.com', 'channel4.com', 'imdb.com', 'rottentomatoes.com', 'letterboxd.com',
    'myanimelist.net', 'anilist.co', '9gag.com', 'imgur.com', 'giphy.com', 'tenor.com', 'dmm.com', 'dmm.co.jp',
    'dlsite.com', 'eplus.jp', 'pia.jp', 'ticketmaster.com', 'ticketmaster.co.uk', 'stubhub.com',
    'livenation.com', 'eventbrite.com',
    // 運動
    'espn.com', 'nba.com', 'nfl.com', 'mlb.com', 'nhl.com', 'fifa.com', 'uefa.com', 'premierleague.com',
    'npb.jp', 'jleague.jp', 'cpbl.com.tw', 'sportsnavi.com', 'theathletic.com',
    // 漫畫、輕小說
    'shonenjump.com', 'comic-walker.com', 'piccoma.com', 'cmoa.jp', 'webtoons.com', 'syosetu.com',
    'kakuyomu.jp', 'wattpad.com', 'mangaplus-sp.com', 'shueisha.co.jp', 'kodansha.co.jp',
    // 遊戲
    'roblox.com', 'minecraft.net', 'ea.com', 'ubisoft.com', 'blizzard.com', 'battle.net', 'riotgames.com',
    'gog.com', 'itch.io', 'humblebundle.com', 'square-enix.com', 'capcom.com', 'bandainamcoent.co.jp',
    'konami.com', 'sega.jp', 'sega.com', 'hoyoverse.com', 'mihoyo.com', 'hoyolab.com', 'nexon.com',
    'cygames.co.jp', 'game8.jp', 'gamewith.jp', '4gamer.net', 'famitsu.com', 'ign.com', 'gamespot.com',
    'polygon.com', 'kotaku.com', 'pcgamer.com', 'steamstatic.com', 'nintendo.co.jp', 'nintendo.net',
    'playstation.net', 'rockstargames.com', 'xboxlive.com', 'chess.com', 'lichess.org',
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
    // 日本
    'mainichi.jp', 'sankei.com', 'nikkansports.com', 'sponichi.co.jp', 'hochi.news', 'jiji.com', 'kyodonews.jp',
    'tokyo-np.co.jp', 'toyokeizai.net', 'diamond.jp', 'president.jp', 'itmedia.co.jp', 'impress.co.jp',
    'gigazine.net', 'gizmodo.jp', 'lifehacker.jp', 'businessinsider.jp', 'huffingtonpost.jp', 'livedoor.com',
    'smartnews.com', 'gunosy.com', 'fnn.jp', 'tbs.co.jp', 'ntv.co.jp', 'tv-asahi.co.jp', 'fujitv.co.jp',
    'tv-tokyo.co.jp', 'nhk.jp', 'oricon.co.jp', 'natalie.mu', 'modelpress.jp', 'bunshun.jp', 'dailyshincho.jp',
    'newsweekjapan.jp', 'withnews.jp', 'nikkeibp.co.jp', 'j-cast.com', 'zakzak.co.jp', 'news-postseven.com',
    'nishinippon.co.jp', 'hokkaido-np.co.jp', 'chunichi.co.jp', 'kobe-np.co.jp',
    'ascii.jp', 'cinematoday.jp', 'eiga.com',
    // 美國
    'usatoday.com', 'latimes.com', 'nypost.com', 'foxnews.com', 'nbcnews.com', 'cbsnews.com', 'abcnews.com',
    'npr.org', 'pbs.org', 'politico.com', 'axios.com', 'thehill.com', 'theatlantic.com', 'newyorker.com',
    'time.com', 'newsweek.com', 'vox.com', 'vice.com', 'buzzfeed.com', 'slate.com', 'salon.com', 'huffpost.com',
    'nyt.com', 'nytimes.net', 'wsj.net', 'bwbx.io', 'foxbusiness.com', 'marketwatch.com', 'barrons.com',
    'fortune.com', 'fastcompany.com', 'inc.com', 'businessinsider.com', 'theinformation.com', 'semafor.com',
    'propublica.org', 'chicagotribune.com', 'bostonglobe.com', 'sfchronicle.com', 'nbcuni.com',
    // 英國與歐洲
    'bbci.co.uk', 'dailymail.co.uk', 'independent.co.uk', 'telegraph.co.uk', 'thetimes.co.uk', 'thesun.co.uk',
    'mirror.co.uk', 'express.co.uk', 'standard.co.uk', 'metro.co.uk', 'sky.com', 'guim.co.uk', 'economist.com',
    'newstatesman.com', 'spectator.co.uk', 'aljazeera.com', 'dw.com', 'france24.com', 'euronews.com',
    'lemonde.fr', 'lefigaro.fr', 'spiegel.de', 'zeit.de', 'faz.net', 'elpais.com', 'corriere.it',
    // 其他地區
    'abc.net.au', 'smh.com.au', 'news.com.au', 'cbc.ca', 'theglobeandmail.com', 'straitstimes.com',
    'channelnewsasia.com', 'koreaherald.com', 'koreatimes.co.kr', 'yna.co.kr', 'chosun.com', 'joongang.co.kr',
    'thestandard.com.hk', 'sinchew.com.my', 'zaobao.com', 'zaobao.com.sg',
    // 科技媒體與新聞閱讀器
    'zdnet.com', 'cnet.com', 'gizmodo.com', 'lifehacker.com', '9to5mac.com', '9to5google.com', 'macrumors.com',
    'androidauthority.com', 'tomshardware.com', 'theregister.com', 'venturebeat.com', 'mashable.com',
    'digitaltrends.com', 'howtogeek.com', 'pcmag.com', 'appleinsider.com', 'androidcentral.com',
    'xda-developers.com', 'neowin.net', 'bleepingcomputer.com', 'tomsguide.com', 'techradar.com',
    'feedly.com', 'flipboard.com', 'newsbreak.com', 'inoreader.com', 'producthunt.com', 'ycombinator.com',
  ],
  search: [
    'google.com', 'google.com.tw', 'google.co.jp', 'bing.com', 'yahoo.com', 'yahoo.co.jp', 'baidu.com',
    'duckduckgo.com', 'naver.com', 'msn.com', 'yandex.com', 'ecosia.org', 'wikipedia.org', 'daum.net',
    'yandex.ru', 'qq.com', 'sohu.com', 'wp.pl', 'wikimedia.org', 'wikisource.org', 'grokipedia.com', '8s8s.com',
    // Google 各國站
    'google.co.uk', 'google.ca', 'google.com.au', 'google.de', 'google.fr', 'google.com.hk', 'google.co.kr',
    'google.com.sg', 'google.co.in', 'google.es', 'google.it', 'google.com.br', 'google.com.mx',
    // 其他搜尋引擎與入口網站
    'yimg.jp', 'yimg.com', 'goo.ne.jp', 'excite.co.jp', 'startpage.com', 'qwant.com', 'kagi.com', 'you.com',
    'aol.com', 'ask.com', 'seznam.cz', 'sogou.com', 'so.com', '360.cn', 'yahoo.com.tw', 'yahoo.com.hk',
    // 百科、字典與參考資料
    'wolframalpha.com', 'archive.org', 'wiktionary.org', 'wikidata.org', 'wikiwand.com', 'britannica.com',
    'weblio.jp', 'kotobank.jp', 'dictionary.com', 'merriam-webster.com', 'thesaurus.com', 'urbandictionary.com',
    'oxfordlearnersdictionaries.com', 'collinsdictionary.com', 'jisho.org', 'moedict.tw', 'wikihow.com',
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
    // 協作、會議與雲端儲存
    'zoho.com', 'basecamp.com', 'smartsheet.com', 'wrike.com', 'linear.app', 'coda.io', 'quip.com', 'loom.com',
    'skype.com', 'goto.com', 'gotomeeting.com', 'ringcentral.com', 'office365.com', 'microsoft365.com',
    'onedrive.com', 'live.net', 'wetransfer.com', 'pcloud.com', 'mega.nz', 'mega.io', 'proton.me',
    'protonmail.com', 'fastmail.com', 'zohomail.com', 'typeform.com', 'surveymonkey.com', 'jotform.com',
    'mailchimp.com', 'intercom.com', 'intercom.io', 'freshworks.com', 'freshdesk.com', 'pipedrive.com',
    'docsend.com', 'pandadoc.com', 'hellosign.com', 'otter.ai', 'fireflies.ai', 'squarespace.com', 'wix.com',
    'webflow.com', 'framer.com', 'overleaf.com', 'excalidraw.com', 'lucid.app', 'lucidchart.com', 'draw.io',
    'diagrams.net', 'whimsical.com', 'obsidian.md', 'craft.do', 'xmind.net', 'xmind.app',
    // 日本：商務工具
    'chatwork.com', 'cybozu.com', 'kintone.com', 'backlog.com', 'backlog.jp', 'sansan.com', 'freee.co.jp',
    'smarthr.jp', 'jobcan.jp', 'kingoftime.jp', 'garoon.com', 'lineworks.jp', 'worksmobile.com',
    // 求職與接案
    'workday.com', 'myworkdayjobs.com', 'bamboohr.com', 'gusto.com', 'adp.com', 'greenhouse.io', 'lever.co',
    'ziprecruiter.com', 'monster.com', 'reed.co.uk', 'totaljobs.com', 'rikunabi.com', 'mynavi.jp', 'doda.jp',
    'en-japan.com', 'bizreach.jp', 'wantedly.com', 'townwork.net', 'baitoru.com', 'upwork.com', 'fiverr.com',
    'freelancer.com', 'lancers.jp', 'crowdworks.jp', 'coconala.com', 'tasker.com.tw',
    // AI 工具
    'mistral.ai', 'poe.com', 'character.ai', 'midjourney.com', 'runwayml.com',
    'elevenlabs.io', 'suno.com', 'cursor.com', 'deepseek.com', 'kimi.com', 'moonshot.cn', 'manus.im',
    'leonardo.ai', 'ideogram.ai', 'heygen.com', 'synthesia.io', 'jasper.ai', 'copy.ai', 'notebooklm.google',
  ],
  dev: [
    'github.com', 'githubusercontent.com', 'github.io', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com',
    'stackexchange.com', 'npmjs.com', 'vercel.com', 'vercel.app', 'netlify.com', 'netlify.app', 'cloudflare.com',
    'digitalocean.com', 'heroku.com', 'amazonaws.com', 'azure.com', 'firebaseapp.com', 'supabase.com',
    'supabase.co', 'docker.com', 'huggingface.co', 'jsdelivr.net', 'unpkg.com', 'cdnjs.com', 'codepen.io',
    'replit.com', 'jetbrains.com', 'visualstudio.com', 'mozilla.org', 'w3schools.com', 'dev.to',
    'readthedocs.io', 'sentry.io', 'newrelic.com', 'datadoghq.com', 'postman.com', 'gitbook.io', 'pypi.org',
    'chrome.com', 'web.dev', 'google.dev', 'cloud.google', 'dbdiagram.io',
    'lovable.dev', 'holistics.io', 'smartbear.com', 'apilayer.com', 'avaloniaui.net', 'gitbook.com',
    'thef2e.com', 'markdown.tw', 'recaptcha.net', 'bleachbit.org', 'realnewbie.com', 'toast.com',
    'nhncloud.com', 'nss.com.tw',
    // 雲端平台與 CDN
    'googleapis.com', 'awsstatic.com', 'cloudfront.net', 'azurewebsites.net', 'azureedge.net', 'windows.net',
    'herokuapp.com', 'render.com', 'fly.io', 'railway.app', 'pages.dev', 'workers.dev', 'deno.com', 'deno.dev',
    'linode.com', 'akamai.com', 'akamaihd.net', 'fastly.com', 'fastly.net', 'vultr.com', 'ovh.com',
    'hetzner.com', 'oracle.com', 'ibm.com', 'sakura.ad.jp', 'xserver.ne.jp', 'conoha.jp', 'onamae.com',
    'godaddy.com', 'namecheap.com', 'letsencrypt.org', 'digicert.com',
    // 語言、框架與套件庫
    'bun.sh', 'nodejs.org', 'python.org', 'rust-lang.org', 'go.dev', 'golang.org', 'crates.io', 'rubygems.org',
    'packagist.org', 'nuget.org', 'apache.org', 'kotlinlang.org', 'swift.org', 'typescriptlang.org',
    'react.dev', 'reactjs.org', 'vuejs.org', 'svelte.dev', 'angular.dev', 'angular.io', 'nextjs.org',
    'vitejs.dev', 'vite.dev', 'tailwindcss.com', 'getbootstrap.com', 'npmjs.org', 'yarnpkg.com', 'pnpm.io',
    'wordpress.org',
    // 開發社群、練習與線上編輯器
    'qiita.com', 'zenn.dev', 'teratail.com', 'connpass.com', 'hashnode.com', 'freecodecamp.org',
    'leetcode.com', 'hackerrank.com', 'kaggle.com', 'codesandbox.io', 'stackblitz.com', 'glitch.com',
    'jsfiddle.net', 'regex101.com', 'sourceforge.net', 'gitee.com', 'launchpad.net', 'githubassets.com',
    'ghcr.io', 'gitlab.io', 'atcoder.jp',
    // 作業系統與開源專案
    'debian.org', 'ubuntu.com', 'archlinux.org', 'fedoraproject.org', 'redhat.com', 'kernel.org',
    // 資料庫、維運與 API 服務
    'mongodb.com', 'mysql.com', 'postgresql.org', 'redis.io', 'elastic.co', 'grafana.com', 'hashicorp.com',
    'terraform.io', 'kubernetes.io', 'twilio.com', 'sendgrid.com', 'auth0.com', 'okta.com', 'algolia.com',
    'contentful.com', 'circleci.com', 'codecov.io', 'snyk.io', 'sonarcloud.io',
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
    'cdn-apple.com', 'apple-cloudkit.com', 'mzstatic.com', 'windowsupdate.com', 'firefox.com', 'brave.com',
    'vivaldi.com', 'motorola.com', 'nokia.com', 'honor.com', 'zte.com', 'tcl.com', 'hisense.com',
    // 日本品牌
    'canon.com', 'canon.jp', 'nikon.com', 'nikon-image.com', 'fujifilm.com', 'sharp.co.jp', 'jp.sharp',
    'toshiba.co.jp', 'hitachi.co.jp', 'nec.com', 'fujitsu.com', 'kyocera.co.jp', 'epson.com', 'epson.jp',
    'brother.co.jp', 'brother.com', 'ricoh.com', 'buffalo.jp', 'elecom.co.jp', 'iodata.jp',
    'audio-technica.com', 'sony.jp', 'sony.co.jp', 'panasonic.jp',
    // 周邊、音響與穿戴
    'anker.com', 'bose.com', 'sennheiser.com', 'jbl.com', 'garmin.com', 'fitbit.com', 'gopro.com', 'dji.com',
    'oculus.com', 'seagate.com', 'westerndigital.com', 'wd.com', 'sandisk.com', 'kingston.com', 'crucial.com',
    'corsair.com', 'hyperx.com', 'steelseries.com', 'benq.com', 'viewsonic.com',
    // 資安與 VPN
    'avg.com', 'mcafee.com', 'bitdefender.com', 'malwarebytes.com', 'sophos.com', 'nordvpn.com',
    'expressvpn.com', 'protonvpn.com', 'surfshark.com',
    // 電信業者
    'cht.com.tw', 'hinet.net', 'fetnet.net', 'taiwanmobile.com', 'tstartel.com', 'gt.com.tw', 'docomo.ne.jp',
    'softbank.jp', 'kddi.com', 'au.com', 'rakuten-mobile.co.jp', 'att.com', 'verizon.com', 't-mobile.com',
    'ntt.com', 'ntt-east.co.jp', 'ntt-west.co.jp', 'ntt.co.jp', 'ocn.ne.jp', 'biglobe.ne.jp', 'so-net.ne.jp',
    'nifty.com', 'ymobile.jp', 'uqwimax.jp', 'uqmobile.jp', 'povo.jp', 'ahamo.com', 'mineo.jp', 'iijmio.jp',
    'iij.ad.jp', 'vodafone.com', 'vodafone.co.uk', 'ee.co.uk', 'o2.co.uk', 'three.co.uk',
    'bt.com', 'virginmedia.com', 'xfinity.com', 'comcast.com', 'comcast.net', 'spectrum.com', 'spectrum.net',
    'cox.com', 'telstra.com.au', 'optus.com.au', 'rogers.com', 'bell.ca', 'telus.com', 'singtel.com',
    'csl.hk', 'hkt.com',
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
    // 美食、外送與食譜
    'tabelog.com', 'hotpepper.jp', 'gnavi.co.jp', 'gurunavi.com', 'retty.me', 'cookpad.com', 'kurashiru.com',
    'delishkitchen.tv', 'demae-can.com', 'wolt.com', 'doordash.com', 'grubhub.com', 'postmates.com',
    'deliveroo.co.uk', 'just-eat.co.uk', 'justeat.com', 'yelp.com', 'allrecipes.com', 'foodnetwork.com',
    'seriouseats.com', 'bonappetit.com', 'starbucks.com', 'starbucks.co.jp', 'starbucks.com.tw',
    'mcdonalds.com', 'mcdonalds.co.jp', 'dominos.com', 'dominos.jp', 'pizzahut.com', 'kfc.com', 'sukiya.jp',
    'yoshinoya.com', 'mos.jp', 'skylark.co.jp',
    // 交通、地圖與天氣
    'lyft.com', 'navitime.co.jp', 'jorudan.co.jp', 'ekitan.com', 'jreast.co.jp', 'jr-central.co.jp',
    'jr-odekake.net', 'smart-ex.jp', 'eki-net.com', 'nationalrail.co.uk', 'thetrainline.com', 'amtrak.com',
    'citymapper.com', 'waze.com', 'tenki.jp', 'weathernews.jp', 'weather.com', 'accuweather.com',
    'windy.com', 'times-info.net', 'akippa.com',
    // 汽車
    'toyota.jp', 'toyota.com', 'honda.com', 'honda.co.jp', 'nissan.co.jp', 'nissanusa.com', 'mazda.com',
    'mazda.co.jp', 'subaru.jp', 'subaru.com', 'suzuki.co.jp', 'ford.com', 'gm.com', 'chevrolet.com',
    'hyundai.com', 'kia.com', 'volkswagen.com', 'vw.com', 'bmw.com', 'mercedes-benz.com', 'audi.com',
    'porsche.com', 'volvocars.com', 'carsensor.net', 'goo-net.com', 'autotrader.com', 'autotrader.co.uk',
    'cars.com', 'carvana.com', 'kbb.com', 'edmunds.com',
    // 房屋、分類廣告與到府服務
    'suumo.jp', 'homes.co.jp', 'athome.co.jp', 'zillow.com', 'redfin.com', 'realtor.com', 'trulia.com',
    'rightmove.co.uk', 'zoopla.co.uk', 'apartments.com', 'craigslist.org', 'gumtree.com', 'jmty.jp',
    'thumbtack.com', 'taskrabbit.com', 'angi.com', 'care.com', '591.com.tw', 'sinyi.com.tw',
    // 醫療健康
    'webmd.com', 'mayoclinic.org', 'healthline.com', 'zocdoc.com', 'goodrx.com', 'epark.jp',
    // 物流與郵務
    'ups.com', 'fedex.com', 'usps.com', 'dhl.com', 'royalmail.com', 'japanpost.jp', 'kuronekoyamato.co.jp',
    'sagawa-exp.co.jp', 'evri.com',
  ],
  finance: [
    'paypal.com', 'stripe.com', 'visa.com', 'mastercard.com', 'cathaybk.com.tw', 'ctbcbank.com',
    'esunbank.com.tw', 'fubon.com', 'taishinbank.com.tw', 'megabank.com.tw', 'landbank.com.tw', 'sinopac.com',
    'firstbank.com.tw', 'hncb.com.tw', 'tcb-bank.com.tw', 'jkopay.com', 'binance.com', 'coinbase.com',
    'tradingview.com', 'investing.com', 'wise.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com',
    'mufg.jp', 'smbc.co.jp', 'rakuten-bank.co.jp', 'linepay.tw', 'futunn.com',
    // 美國：銀行、券商、支付與信用
    'americanexpress.com', 'discover.com', 'capitalone.com', 'citi.com', 'citibank.com', 'usbank.com',
    'schwab.com', 'fidelity.com', 'vanguard.com', 'etrade.com', 'robinhood.com', 'venmo.com', 'cash.app',
    'zellepay.com', 'sofi.com', 'creditkarma.com', 'intuit.com', 'turbotax.com', 'quickbooks.com',
    'nerdwallet.com', 'interactivebrokers.com', 'webull.com', 'moomoo.com', 'squareup.com', 'square.com',
    'affirm.com', 'afterpay.com', 'klarna.com', 'experian.com', 'equifax.com', 'transunion.com',
    // 英國與歐洲
    'hsbc.com', 'hsbc.co.uk', 'barclays.co.uk', 'lloydsbank.com', 'natwest.com', 'santander.co.uk',
    'nationwide.co.uk', 'monzo.com', 'revolut.com', 'starlingbank.com', 'n26.com', 'adyen.com',
    // 日本
    'mizuhobank.co.jp', 'mizuho-fg.co.jp', 'smbc-card.com', 'resonabank.co.jp', 'jp-bank.jp', 'sbisec.co.jp',
    'sbinetbank.co.jp', 'rakuten-sec.co.jp', 'rakuten-card.co.jp', 'monex.co.jp', 'matsui.co.jp',
    'nomura.co.jp', 'daiwa.jp', 'paypay.ne.jp', 'paypay-card.co.jp', 'paypay-bank.co.jp', 'merpay.com',
    'jcb.co.jp', 'jcb.jp', 'saisoncard.co.jp', 'orico.co.jp', 'aeon.co.jp', 'moneyforward.com', 'zaim.net',
    'kabutan.jp', 'minkabu.jp', 'morningstar.co.jp', 'bitflyer.com', 'coincheck.com',
    // 投資資訊、加密貨幣與跨境匯款
    'morningstar.com', 'seekingalpha.com', 'fool.com', 'zacks.com', 'finviz.com', 'stocktwits.com',
    'coinmarketcap.com', 'coingecko.com', 'kraken.com', 'bybit.com', 'okx.com', 'crypto.com', 'metamask.io',
    'etherscan.io', 'payoneer.com', 'remitly.com', 'westernunion.com', 'xe.com', 'wealthsimple.com',
    // 香港與新加坡
    'hangseng.com', 'bochk.com', 'dbs.com', 'dbs.com.sg', 'ocbc.com', 'uob.com.sg',
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
  '.ed.jp', '.police.uk', '.sch.uk', '.gov.au', '.edu.au', '.gc.ca', '.govt.nz', '.ac.nz', '.go.kr', '.ac.kr',
  '.gov.in', '.ac.in', '.gouv.fr', '.gob.mx', '.gov.br', '.gov.my', '.edu.my', '.go.th', '.ac.th', '.gov.ph',
  '.edu.ph', '.gov.mo', '.edu.mo',
]

/** 不在政府網域結尾內、但屬於政府或公營機構的網站 */
const GOV_DOMAINS = new Set([
  'newtaipei.travel', 'taiwantrip.com.tw', 'transportdata.tw', 'taipower.com.tw', 'cambridge.org', 'prepedu.com',
  // 政府與國際組織
  'nhs.uk', 'europa.eu', 'un.org', 'oecd.org', 'worldbank.org', 'imf.org', 'redcross.org',
  // 線上課程與語言學習
  'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org', 'duolingo.com', 'quizlet.com', 'skillshare.com',
  'udacity.com', 'codecademy.com', 'brilliant.org', 'chegg.com', 'studocu.com', 'benesse.jp', 'studysapuri.jp',
  'schoo.jp', 'hahow.in', 'pressplay.cc', 'cambly.com', 'italki.com', 'preply.com', 'busuu.com', 'babbel.com',
  // 檢定考試
  'ets.org', 'toeic.or.jp', 'eiken.or.jp', 'britishcouncil.org', 'ielts.org', 'pearson.com', 'collegeboard.org',
  // 學術資料庫與論文
  'jstor.org', 'arxiv.org', 'nature.com', 'sciencedirect.com', 'elsevier.com', 'springer.com', 'wiley.com',
  'ieee.org', 'acm.org', 'researchgate.net', 'zotero.org', 'mendeley.com', 'ssrn.com', 'semanticscholar.org',
  'airitilibrary.com',
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
