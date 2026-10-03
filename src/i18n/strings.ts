import type { Weekday } from '@/content/types'
import type { Lang } from './lang'

/*
 * Interface text. Business content (services, settings, FAQs) lives in the database;
 * only fixed UI labels belong here. New Arabic copy is marked `// review-ar`.
 */

const ar = {
  skipToContent: 'تخطَّ إلى المحتوى', // review-ar
  nav: {
    home: 'الرئيسية',
    services: 'الخدمات',
    ourWork: 'أعمالنا',
    reviews: 'آراء العملاء',
    about: 'من نحن',
    contact: 'تواصل معنا',
    products: 'المنتجات',
    privacy: 'سياسة الخصوصية',
  },
  menu: 'القائمة',
  mainNav: 'القائمة الرئيسية',
  switchLang: { label: 'English', aria: 'View this page in English' },

  cta: {
    whatsapp: 'واتساب',
    whatsappUs: 'راسلنا على واتساب',
    call: 'اتصل',
    callNow: 'اتصل الآن',
    directions: 'الاتجاهات على الخريطة', // review-ar
    priceOnWhatsapp: 'السعر عبر واتساب',
  },

  hero: {
    // Approved copy, PROJECT_BRIEF.md §9.
    title: 'صيانة منزلك بثقة — القطع متوفرة والفني جاهز',
    sub: 'سباكة، كهرباء، وكاميرات مراقبة — من محلنا في غرناطة إلى بيتك، منذ 1999.',
  },

  trust: {
    since: (year: number) => `منذ ${year}`,
    technicians: (n: number) => `+${n} فنيين`,
    emergency: 'طوارئ 24/7',
    parts: 'القطع من محلنا',
  },

  footer: {
    tagline:
      'محل أدوات صحية وكهربائية في حي غرناطة منذ 1999، ومعه فريق من أكثر من 10 فنيين لخدمة بيتك.', // review-ar
    services: 'خدماتنا', // review-ar
    links: 'روابط', // review-ar
    contact: 'تواصل معنا',
    hours: 'ساعات العمل', // review-ar
    follow: 'تابعنا', // review-ar
    rights: 'جميع الحقوق محفوظة.',
  },

  days: {
    sat: 'السبت',
    sun: 'الأحد',
    mon: 'الاثنين',
    tue: 'الثلاثاء',
    wed: 'الأربعاء',
    thu: 'الخميس',
    fri: 'الجمعة',
  } satisfies Record<Weekday, string>,
  am: 'ص',
  pm: 'م',

  pages: {
    homeTitle: 'رياض هوم سوليوشن | سباكة وكهرباء وكاميرات في غرناطة، الرياض', // review-ar
    homeDescription:
      'محل وفنيون من فريقنا في حي غرناطة بالرياض منذ 1999: سباكة وكهرباء وكاميرات مراقبة، والقطع متوفرة في محلنا. السعر عبر واتساب وطوارئ 24/7.', // review-ar
    servicesTitle: 'خدماتنا',
    servicesDescription:
      'جميع خدمات الصيانة المنزلية في الرياض: سباكة، كهرباء وإنارة، كاميرات وإنتركم وشبكات، دهانات، بلاط، وتنظيف.', // review-ar
    productsTitle: 'المنتجات',
    productsDescription:
      'أدوات صحية وكهربائية وإنارة وكاميرات ومواد بناء متوفرة في محلنا بحي غرناطة. اسألنا عبر واتساب.', // review-ar
    ourWorkTitle: 'أعمالنا',
    ourWorkDescription: 'صور من أعمال فنيينا في بيوت الرياض: سباكة وكهرباء وكاميرات وغيرها.', // review-ar
    reviewsTitle: 'آراء العملاء',
    reviewsDescription: 'تقييمات عملائنا على Google وفي موقعنا، وشاركنا رأيك بعد الخدمة.', // review-ar
    aboutTitle: 'من نحن',
    aboutDescription:
      'منذ 1999 في نفس المبنى بحي غرناطة: محل لمواد السباكة والكهرباء وفريق من أكثر من 10 فنيين.', // review-ar
    contactTitle: 'تواصل معنا',
    contactDescription:
      'راسلنا على واتساب أو اتصل بنا أو زر محلنا في حي غرناطة بالرياض. خدمة الطوارئ على مدار الساعة.', // review-ar
    privacyTitle: 'سياسة الخصوصية',
    privacyDescription: 'ما البيانات التي نجمعها عبر نماذج الموقع، وكيف نستخدمها، وكيف تطلب حذفها.', // review-ar
  },

  notFound: {
    title: 'الصفحة غير موجودة', // review-ar
    body: 'ربما تغيّر رابط الصفحة. اختر إحدى خدماتنا أو راسلنا على واتساب.', // review-ar
    backHome: 'العودة إلى الرئيسية', // review-ar
  },

  breadcrumb: 'مسار التنقل', // review-ar
  describeService: {
    title: 'لم تجد خدمتك؟ صفها لنا',
    body: 'أرسل لنا وصف العمل عبر واتساب ونرد عليك بالتفاصيل والسعر.', // review-ar
  },
  details: 'التفاصيل',
  messagePreview: 'الرسالة التي ستصلنا', // review-ar
}

type Strings = typeof ar

const en: Strings = {
  skipToContent: 'Skip to content',
  nav: {
    home: 'Home',
    services: 'Services',
    ourWork: 'Our Work',
    reviews: 'Reviews',
    about: 'About',
    contact: 'Contact',
    products: 'Products',
    privacy: 'Privacy Policy',
  },
  menu: 'Menu',
  mainNav: 'Main navigation',
  switchLang: { label: 'العربية', aria: 'عرض هذه الصفحة بالعربية' },

  cta: {
    whatsapp: 'WhatsApp',
    whatsappUs: 'Message us on WhatsApp',
    call: 'Call',
    callNow: 'Call now',
    directions: 'Get directions',
    priceOnWhatsapp: 'Price on WhatsApp',
  },

  hero: {
    title: 'Home maintenance you can trust — parts in stock, technician ready',
    sub: 'Plumbing, electrical and CCTV — from our shop in Ghirnatah to your home, since 1999.',
  },

  trust: {
    since: (year: number) => `Since ${year}`,
    technicians: (n: number) => `${n}+ technicians`,
    emergency: '24/7 emergency',
    parts: 'Parts from our shop',
  },

  footer: {
    tagline:
      'A plumbing and electrical supplies shop in Ghirnatah since 1999, with a team of more than 10 technicians to look after your home.',
    services: 'Our services',
    links: 'Links',
    contact: 'Contact us',
    hours: 'Opening hours',
    follow: 'Follow us',
    rights: 'All rights reserved.',
  },

  days: { sat: 'Sat', sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' },
  am: 'AM',
  pm: 'PM',

  pages: {
    homeTitle: 'Riyadh Home Solution | Plumbing, Electrical & CCTV',
    homeDescription:
      'Our own shop and technicians in Ghirnatah, Riyadh since 1999: plumbing, electrical and CCTV with parts in stock. Price on WhatsApp, 24/7 emergency.',
    servicesTitle: 'Our services',
    servicesDescription:
      'Every home maintenance service we offer in Riyadh: plumbing, electrical and lighting, CCTV, intercom and network, painting, tiles and cleaning.',
    productsTitle: 'Products',
    productsDescription:
      'Sanitary ware, electrical supplies, lighting, cameras and building materials in stock at our Ghirnatah shop. Ask us on WhatsApp.',
    ourWorkTitle: 'Our work',
    ourWorkDescription: 'Photos of our technicians’ work in Riyadh homes: plumbing, electrical, CCTV and more.',
    reviewsTitle: 'Reviews',
    reviewsDescription: 'What our customers say on Google and on our site — and share your own after a job.',
    aboutTitle: 'About us',
    aboutDescription:
      'In the same Ghirnatah building since 1999: a plumbing and electrical supplies shop with a team of more than 10 technicians.',
    contactTitle: 'Contact us',
    contactDescription:
      'Message us on WhatsApp, call, or visit our shop in Ghirnatah, Riyadh. Emergency service around the clock.',
    privacyTitle: 'Privacy Policy',
    privacyDescription: 'What data our website forms collect, how we use it, and how to ask us to delete it.',
  },

  notFound: {
    title: 'Page not found',
    body: 'The link may have changed. Pick one of our services or message us on WhatsApp.',
    backHome: 'Back to home',
  },

  breadcrumb: 'Breadcrumb',
  describeService: {
    title: "Didn't find your service? Describe it to us",
    body: 'Send us a short description on WhatsApp and we’ll reply with the details and price.',
  },
  details: 'Details',
  messagePreview: 'The message we’ll receive',
}

export const strings: Record<Lang, Strings> = { ar, en }
export type { Strings }
