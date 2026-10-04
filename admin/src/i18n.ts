import { createContext, useContext } from 'react'

export type Lang = 'en' | 'ar'

const en = {
  appName: 'RHS Admin',
  otherLang: 'عربي',
  loading: 'Loading…',
  notConfigured: 'This build has no Supabase settings (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
  offline: 'No connection. Check the internet and try again.',
  retry: 'Try again',
  somethingWrong: 'Something went wrong. Please try again.',
  tooMany: 'Too many attempts. Wait a few minutes and try again.',
  wait: (s: number) => `Too many wrong tries. Wait ${s} seconds.`,

  signInTitle: 'Sign in',
  email: 'Email',
  password: 'Password',
  signIn: 'Sign in',
  wrongPassword: 'Wrong email or password.',
  notAdmin: 'This account has no access to the admin panel, so it was signed out.',

  codeTitle: 'Authenticator code',
  codeHelp: 'Open Google Authenticator on your phone and type the 6-digit code for Riyadh Home Solution.',
  whichApp: 'Which authenticator?',
  code: '6-digit code',
  verify: 'Verify',
  wrongCode: 'Wrong code. Type the code shown right now (it changes every 30 seconds), and make sure the time on your phone is set automatically.',
  otherAccount: 'Use another account',

  enrollTitle: 'Set up Google Authenticator',
  enrollIntro: 'For safety, signing in needs a code from your phone as well as the password.',
  enrollStep1: 'Install Google Authenticator on your phone, tap +, then “Scan a QR code”.',
  enrollStep2: 'Scan this code. If you can’t scan it, choose “Enter a setup key” and type the key below.',
  enrollStep3: 'Type the 6-digit code the app now shows.',
  qrAlt: 'QR code for Google Authenticator',
  setupKey: 'Setup key',
  copy: 'Copy',
  copied: 'Copied',
  keyWarning: 'Save this key somewhere safe; you need it if you lose your phone.',
  firstAppName: 'Main phone',

  dashboard: 'Dashboard',
  security: 'Security',
  logOut: 'Log out',
  step1Done: 'Step 1 done',
  step1Text: 'Secure sign-in is ready: password + authenticator code, checked by the database. The content screens come in the next steps.',

  apps: 'Authenticator apps',
  appsHelp: 'Any of these apps can give the sign-in code.',
  added: (date: string) => `Added ${date}`,
  remove: 'Remove',
  removeConfirm: (name: string) => `Remove “${name}”? Its codes will stop working.`,
  removeHint: 'An authenticator can be removed only while another one remains.',
  addApp: 'Add another authenticator (backup phone)',
  addAppHelp: 'Set up Google Authenticator on a second phone, so you can still sign in if you lose the first one.',
  addAppButton: 'Add authenticator',
  nameLabel: 'Name',
  backupName: 'Backup phone',
  start: 'Start',
  cancel: 'Cancel',
  added_ok: 'Authenticator added.',
  removed_ok: 'Authenticator removed.',
  sessions: 'Signing out',
  signedInAs: (email: string) => `Signed in as ${email}`,
  logOutHelp: '“Log out” signs out this browser only.',
  logOutEverywhere: 'Log out everywhere',
  logOutEverywhereHelp: '“Log out everywhere” signs out every phone and computer at once.',
  logOutEverywhereConfirm: 'Log out on every device, including this one?',
}

export type Strings = typeof en

const ar: Strings = {
  appName: 'لوحة RHS',
  otherLang: 'English',
  loading: 'جارٍ التحميل…',
  notConfigured: 'هذه النسخة بدون إعدادات Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
  offline: 'لا يوجد اتصال. تأكد من الإنترنت وحاول مرة أخرى.',
  retry: 'حاول مرة أخرى',
  somethingWrong: 'حدث خطأ. حاول مرة أخرى.',
  tooMany: 'محاولات كثيرة. انتظر بضع دقائق ثم حاول مرة أخرى.',
  wait: (s: number) => `محاولات خاطئة كثيرة. انتظر ${s} ثانية.`,

  signInTitle: 'تسجيل الدخول',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  signIn: 'دخول',
  wrongPassword: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  notAdmin: 'هذا الحساب ليس له صلاحية الدخول إلى لوحة التحكم، لذلك تم تسجيل خروجه.',

  codeTitle: 'رمز التحقق',
  codeHelp: 'افتح تطبيق Google Authenticator في جوالك واكتب الرمز المكوّن من 6 أرقام الخاص بـ Riyadh Home Solution.',
  whichApp: 'أي تطبيق تحقق؟',
  code: 'الرمز (6 أرقام)',
  verify: 'تحقق',
  wrongCode: 'الرمز غير صحيح. اكتب الرمز الظاهر الآن (يتغير كل 30 ثانية)، وتأكد أن الوقت في جوالك مضبوط تلقائيًا.',
  otherAccount: 'الدخول بحساب آخر',

  enrollTitle: 'إعداد Google Authenticator',
  enrollIntro: 'للأمان، يحتاج الدخول إلى رمز من جوالك بالإضافة إلى كلمة المرور.',
  enrollStep1: 'ثبّت تطبيق Google Authenticator في جوالك، اضغط +، ثم «مسح رمز QR».',
  enrollStep2: 'امسح هذا الرمز. إذا لم تستطع مسحه، اختر «إدخال مفتاح الإعداد» واكتب المفتاح الموجود بالأسفل.',
  enrollStep3: 'اكتب الرمز المكوّن من 6 أرقام الذي يظهر الآن في التطبيق.',
  qrAlt: 'رمز QR لتطبيق Google Authenticator',
  setupKey: 'مفتاح الإعداد',
  copy: 'نسخ',
  copied: 'تم النسخ',
  keyWarning: 'احفظ هذا المفتاح في مكان آمن؛ ستحتاجه إذا فقدت جوالك.',
  firstAppName: 'الجوال الرئيسي',

  dashboard: 'الرئيسية',
  security: 'الأمان',
  logOut: 'تسجيل الخروج',
  step1Done: 'تمت الخطوة 1',
  step1Text: 'تسجيل الدخول الآمن جاهز: كلمة المرور + رمز التحقق، وقاعدة البيانات تتحقق منهما. شاشات المحتوى تأتي في الخطوات التالية.',

  apps: 'تطبيقات التحقق',
  appsHelp: 'أي تطبيق من هذه يعطيك رمز الدخول.',
  added: (date: string) => `أضيف في ${date}`,
  remove: 'حذف',
  removeConfirm: (name: string) => `حذف «${name}»؟ ستتوقف رموزه عن العمل.`,
  removeHint: 'يمكن حذف تطبيق تحقق فقط إذا بقي تطبيق آخر.',
  addApp: 'إضافة تطبيق تحقق آخر (جوال احتياطي)',
  addAppHelp: 'جهّز Google Authenticator على جوال ثانٍ، حتى تستطيع الدخول إذا فقدت الجوال الأول.',
  addAppButton: 'إضافة تطبيق تحقق',
  nameLabel: 'الاسم',
  backupName: 'الجوال الاحتياطي',
  start: 'ابدأ',
  cancel: 'إلغاء',
  added_ok: 'تمت إضافة تطبيق التحقق.',
  removed_ok: 'تم حذف تطبيق التحقق.',
  sessions: 'تسجيل الخروج',
  signedInAs: (email: string) => `مسجّل الدخول باسم ${email}`,
  logOutHelp: '«تسجيل الخروج» يخرجك من هذا المتصفح فقط.',
  logOutEverywhere: 'تسجيل الخروج من كل الأجهزة',
  logOutEverywhereHelp: '«تسجيل الخروج من كل الأجهزة» يخرجك من كل جوال وكمبيوتر فورًا.',
  logOutEverywhereConfirm: 'تسجيل الخروج من كل الأجهزة، ومنها هذا الجهاز؟',
}

export const strings: Record<Lang, Strings> = { en, ar }

const STORAGE_KEY = 'rhs-admin-lang'

export function initialLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en'
  } catch {
    return 'en'
  }
}

export function applyLang(lang: Lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Private mode: the choice just isn't remembered.
  }
}

export const LangContext = createContext<{ lang: Lang; t: Strings; toggle: () => void }>({
  lang: 'en',
  t: en,
  toggle: () => {},
})

export const useT = () => useContext(LangContext)
