import type { Dictionary } from '../types'

const ja: Dictionary = {
  // 共通
  'common.cancel': 'キャンセル',
  'common.delete': '削除',
  'common.deleteAll': 'すべて削除',
  'common.save': '保存',
  'common.add': '追加',
  'common.copy': 'コピー',
  'common.copied': 'コピーしました',
  'common.copyFailed': 'コピーに失敗しました',
  'common.download': 'ダウンロード',
  'common.back': '戻る',
  'common.import': 'インポート',
  'common.export': 'エクスポート',
  'common.uncategorized': '未分類',
  'common.session': 'セッション',
  'common.cookieCount': 'Cookie {n} 件',
  'common.language': '言語',
  'common.languageAuto': 'ブラウザーの設定',
  'common.openDashboard': '管理画面を開く',
  'common.confirmDeleteName': '{name} を削除しますか？',
  'common.deletedName': '{name} を削除しました',
  'common.deletedCount': 'Cookie を {n} 件削除しました',
  'common.credentialWarning':
    'Cookie ファイルにはログイン情報が含まれています。ファイルを入手した人があなたのアカウントにログインできる可能性があります。大切に保管し、他人と共有しないでください。',
  'common.credentialWarningShort': 'Cookie にはログイン情報が含まれています。他人と共有しないでください。',
  'theme.toLight': 'ライトモードに切り替え',
  'theme.toDark': 'ダークモードに切り替え',

  // 既定の分類
  'category.work': '仕事',
  'category.shopping': 'ショッピング',
  'category.social': 'SNS',

  // 管理画面
  'dash.search': 'サイト、Cookie 名、ドメインを検索',
  'dash.refresh': '更新',
  'dash.refreshed': '更新しました',
  'dash.backup': '分類をバックアップ',
  'dash.backupTip': '分類データのバックアップをダウンロード（Cookie は含まれません）',
  'dash.backupDone': '分類をバックアップしました',
  'dash.restore': '分類を復元',
  'dash.restoreTip': 'バックアップファイルから分類を復元',
  'dash.restoreTitle': '分類を復元',
  'dash.restoreSummary': 'バックアップには {c} 件の分類と {a} 件のサイト割り当てが含まれています。',
  'dash.restoreHow': '「結合」は現在の設定を残してバックアップを追加します。「置換」は現在の分類を消去します。',
  'dash.merge': '結合',
  'dash.replace': '置換',
  'dash.restoreDone': '復元しました',
  'dash.allSites': 'すべてのサイト',
  'dash.manageCategories': '分類を管理',
  'dash.selected': '{n} 件のサイトを選択中',
  'dash.moveTo': '分類に移動…',
  'dash.setUncategorized': '（未分類にする）',
  'dash.exportCookies': 'Cookie をエクスポート',
  'dash.batchDelete': '一括削除',
  'dash.clearSelection': '選択を解除',
  'dash.summary': '{sites} サイト · Cookie {cookies} 件',
  'dash.colSite': 'サイト',
  'dash.colCategory': '分類',
  'dash.colCount': 'Cookie 数',
  'dash.colActions': '操作',
  'dash.details': '詳細',
  'dash.confirmDeleteSite': '{site} の Cookie {n} 件を削除しますか？',
  'dash.batchDeleteContent': '選択した {n} 件のサイトの Cookie をすべて削除しますか？これらのサイトからログアウトされます。',
  'dash.movedTo': '{n} 件のサイトを分類に移動しました',
  'dash.setUncategorizedDone': '{n} 件のサイトを未分類にしました',
  'dash.categoriesUpdated': '分類を更新しました',

  // バックアップのエラー
  'backup.errJson': 'ファイルが有効な JSON ではありません',
  'backup.errApp': 'Cookie Manager のバックアップファイルではありません',
  'backup.errIncomplete': 'バックアップファイルが不完全です',

  // Cookie の詳細
  'drawer.search': '名前、ドメイン、値を検索',
  'drawer.deleteAll': 'このサイトの Cookie をすべて削除',
  'drawer.confirmDeleteAll': '{site} の Cookie {n} 件をすべて削除しますか？',
  'drawer.colName': '名前',
  'drawer.colValue': '値',
  'drawer.colDomainPath': 'ドメイン / パス',
  'drawer.colExpires': '有効期限',
  'drawer.colFlags': '属性',
  'drawer.empty': '（空）',

  // 分類の管理
  'cat.note': '分類を削除すると、その分類のサイトは「未分類」になります。Cookie には影響しません。',
  'cat.pickColor': '色を選択',
  'cat.namePlaceholder': '分類名',
  'cat.add': '＋ 分類を追加',
  'cat.errEmpty': '分類名を入力してください',

  // エクスポート
  'export.titleOne': '{site} をエクスポート',
  'export.titleMany': '{n} 件のサイトをエクスポート',
  'export.summary': '{sites} サイト、Cookie {cookies} 件',
  'export.format': '形式',
  'export.filename': 'ファイル名',
  'export.copyToClipboard': 'クリップボードにコピー',
  'export.exported': 'Cookie を {n} 件エクスポートしました',
  'export.copiedCount': 'Cookie を {n} 件コピーしました',
  'export.downloaded': 'ダウンロードしました',

  // 形式
  'fmt.header': 'ヘッダー文字列',
  'fmt.jsonHint': '一般的な Cookie 編集拡張機能と互換性のある形式です。すべての属性を保持します。',
  'fmt.netscapeHint': 'cookies.txt 形式。curl、wget、yt-dlp などのコマンドラインツールで使用します。',
  'fmt.headerHint':
    'HTTP Cookie ヘッダー形式（name=value; …）。curl -H や API テストツールに貼り付けられます。名前と値のみを含みます。',

  // インポート
  'imp.hint':
    'JSON、Netscape（cookies.txt）、またはヘッダー文字列（name=value; …）を貼り付けてください。形式は自動で判別されます。ヘッダー文字列は {host} にインポートされます。',
  'imp.detected': '{format} 形式を検出しました（Cookie {n} 件）',
  'imp.chooseFile': 'ファイルを選択…',
  'imp.partial': '{ok} 件をインポート、{fail} 件失敗（{first}）',
  'imp.done': 'Cookie を {n} 件インポートしました',
  'imp.errEmpty': '内容がありません',
  'imp.errJson': 'JSON の形式が正しくありません',
  'imp.errNone': 'インポートできる Cookie が見つかりません',

  // 書き込みエラー
  'err.nameValueEmpty': '名前と値の両方を空にはできません',
  'err.domainEmpty': 'ドメインを入力してください',
  'err.sameSiteNone': 'SameSite=None には Secure が必要です',
  'err.rejected': 'ブラウザーがこの Cookie を拒否しました',

  // Cookie 編集フォーム
  'ed.name': '名前',
  'ed.namePh': 'Cookie 名',
  'ed.value': '値',
  'ed.valuePh': 'Cookie の値',
  'ed.domain': 'ドメイン',
  'ed.path': 'パス',
  'ed.expires': '有効期限',
  'ed.expiresSessionPh': 'ブラウザーを閉じると削除',
  'ed.expiresPh': '日時を選択',
  'ed.sameSiteUnspecified': '未指定',
  'ed.hostOnly': 'このホストのみ',

  // ポップアップ
  'pop.scopePage': 'このページ',
  'pop.scopeSite': 'サイト全体',
  'pop.scopePageTip': '現在のタブで使われている Cookie',
  'pop.scopeSiteTip': '{site} とすべてのサブドメイン',
  'pop.search': '名前または値を検索',
  'pop.noMatch': '一致する Cookie はありません',
  'pop.noCookies': 'Cookie はありません',
  'pop.noName': '（名前なし）',
  'pop.newTitle': 'Cookie を追加',
  'pop.importTitle': 'Cookie をインポート',
  'pop.exportTitle': 'Cookie をエクスポート',
  'pop.confirmDeleteAllPage': 'このページの Cookie {n} 件を削除しますか？サイトからログアウトされます。',
  'pop.confirmDeleteAllSite': 'サイト全体の Cookie {n} 件を削除しますか？サイトからログアウトされます。',
  'pop.saved': '{name} を保存しました',
  'pop.added': '{name} を追加しました',
  'pop.deletedAll': 'Cookie を {n} 件削除しました。ページを再読み込みすると反映されます。',
  'pop.notWebsite': 'このページは通常のウェブサイトではないため、Cookie はありません',
}

export default ja
