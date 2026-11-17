import type zhTW from './locales/zh-TW'

export type MessageKey = keyof typeof zhTW
/** 每個語言都必須提供全部 key，少一個就會型別錯誤 */
export type Dictionary = Record<MessageKey, string>
