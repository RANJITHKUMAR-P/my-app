import arabic from '../assets/data/locales/AP_Arabic.json'
import chinese from '../assets/data/locales/AP_Chinese.json'
import french from '../assets/data/locales/AP_French.json'
import german from '../assets/data/locales/AP_German.json'
import hindi from '../assets/data/locales/AP_Hindi.json'
import italian from '../assets/data/locales/AP_Italian.json'
import malayalam from '../assets/data/locales/AP_Malayalam.json'
import russian from '../assets/data/locales/AP_Russian.json'
import spanish from '../assets/data/locales/AP_Spanish.json'
import tagalog from '../assets/data/locales/AP_Tagalog.json'
import urdu from '../assets/data/locales/AP_Urdu.json'
import english from '../assets/data/locales/AP_EN.json'

const locale_languages = [
  {
    id: 'it',
    name: 'Italian',
    value: 'italiana',
    data: italian,
    googleLangCode: 'it',
  },
  {
    id: 'en',
    name: 'English',
    value: 'English',
    data: english,
    googleLangCode: 'en',
  },
  {
    id: 'ar',
    name: 'Arabic',
    value: 'عربى',
    data: arabic,
    googleLangCode: 'ar',
  },
  {
    id: 'ru',
    name: 'Russian',
    value: 'Россия',
    data: russian,
    googleLangCode: 'ru',
  },
  {
    id: 'zh',
    name: 'Chinese',
    value: '中国人',
    data: chinese,
    googleLangCode: 'zh-CN',
  },
  {
    id: 'fr',
    name: 'French',
    value: 'français',
    data: french,
    googleLangCode: 'fr',
  },
  {
    id: 'es',
    name: 'Spanish',
    value: 'Española',
    data: spanish,
    googleLangCode: 'es',
  },
  {
    id: 'de',
    name: 'German',
    value: 'Deutsche',
    data: german,
    googleLangCode: 'de',
  },
  {
    id: 'tl',
    name: 'Tagalog',
    value: 'Tagalog',
    data: tagalog,
    googleLangCode: 'tl',
  },
  {
    id: 'ur',
    name: 'Urdu',
    value: 'اردو',
    data: urdu,
    googleLangCode: 'ur',
  },
  {
    id: 'hi',
    name: 'Hindi',
    value: 'हिंदी',
    data: hindi,
    googleLangCode: 'hi',
  },
  {
    id: 'ml',
    name: 'Malayalam',
    value: 'മലയാളം',
    data: malayalam,
    googleLangCode: 'ml',
  },
]

const ar = require('antd/lib/locale/ar_EG').default
const zh = require('antd/lib/locale/zh_CN').default
const fr = require('antd/lib/locale/fr_FR').default
const de = require('antd/lib/locale/de_DE').default
const hi = require('antd/lib/locale/hi_IN').default
const it = require('antd/lib/locale/it_IT').default
const en = require('antd/lib/locale/en_US').default
const ru = require('antd/lib/locale/ru_RU').default

const antDLanguages = { ar: ar, zh: zh, fr: fr, de: de, hi: hi, it: it, ru: ru, en: en }

export const langClassName = {
  ml: 'malayalamLang',
  ar: 'arabicLang',
  ur: 'urduLang',
}

export const langList = {
  it: 'it',
  en: 'en',
  ar: 'ar',
  ru: 'ru',
  zh: 'zh',
  fr: 'fr',
  es: 'es',
  de: 'de',
  tl: 'tl',
  ur: 'ur',
  hi: 'hi',
  ml: 'ml',
}
export { antDLanguages, locale_languages }

export const googleLangCode = {
  'auto': 'Automatic',
  'af': 'Afrikaans',
  'sq': 'Albanian',
  'am': 'Amharic',
  'ar': 'Arabic',
  'hy': 'Armenian',
  'az': 'Azerbaijani',
  'eu': 'Basque',
  'be': 'Belarusian',
  'bn': 'Bengali',
  'bs': 'Bosnian',
  'bg': 'Bulgarian',
  'ca': 'Catalan',
  'ceb': 'Cebuano',
  'ny': 'Chichewa',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'co': 'Corsican',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'nl': 'Dutch',
  'en': 'English',
  'eo': 'Esperanto',
  'et': 'Estonian',
  'tl': 'Filipino',
  'fi': 'Finnish',
  'fr': 'French',
  'fy': 'Frisian',
  'gl': 'Galician',
  'ka': 'Georgian',
  'de': 'German',
  'el': 'Greek',
  'gu': 'Gujarati',
  'ht': 'Haitian Creole',
  'ha': 'Hausa',
  'haw': 'Hawaiian',
  'he': 'Hebrew',
  'iw': 'Hebrew',
  'hi': 'Hindi',
  'hmn': 'Hmong',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'ig': 'Igbo',
  'id': 'Indonesian',
  'ga': 'Irish',
  'it': 'Italian',
  'ja': 'Japanese',
  'jw': 'Javanese',
  'kn': 'Kannada',
  'kk': 'Kazakh',
  'km': 'Khmer',
  'ko': 'Korean',
  'ku': 'Kurdish (Kurmanji)',
  'ky': 'Kyrgyz',
  'lo': 'Lao',
  'la': 'Latin',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'lb': 'Luxembourgish',
  'mk': 'Macedonian',
  'mg': 'Malagasy',
  'ms': 'Malay',
  'ml': 'Malayalam',
  'mt': 'Maltese',
  'mi': 'Maori',
  'mr': 'Marathi',
  'mn': 'Mongolian',
  'my': 'Myanmar (Burmese)',
  'ne': 'Nepali',
  'no': 'Norwegian',
  'ps': 'Pashto',
  'fa': 'Persian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'pa': 'Punjabi',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sm': 'Samoan',
  'gd': 'Scots Gaelic',
  'sr': 'Serbian',
  'st': 'Sesotho',
  'sn': 'Shona',
  'sd': 'Sindhi',
  'si': 'Sinhala',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'so': 'Somali',
  'es': 'Spanish',
  'su': 'Sundanese',
  'sw': 'Swahili',
  'sv': 'Swedish',
  'tg': 'Tajik',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'cy': 'Welsh',
  'xh': 'Xhosa',
  'yi': 'Yiddish',
  'yo': 'Yoruba',
  'zu': 'Zulu',
}
