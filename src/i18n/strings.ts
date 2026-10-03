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

  common: {
    seeAll: 'عرض الكل', // review-ar
    askOnWhatsapp: 'اسأل على واتساب', // review-ar
    ownTechnicians: 'فنيون من فريقنا',
    partsInStock: 'القطع متوفرة في محلنا',
    servicesCount: (n: number) => (n === 1 ? 'خدمة واحدة' : n === 2 ? 'خدمتان' : n <= 10 ? `${n} خدمات` : `${n} خدمة`), // review-ar
    shop: 'محلنا', // review-ar
    close: 'إغلاق', // review-ar
    previous: 'السابق', // review-ar
    next: 'التالي', // review-ar
    faqTitle: 'أسئلة شائعة', // review-ar
    areasNoteIntro: 'نخدم', // review-ar
    mapApprox: 'المواقع تقريبية', // review-ar
    north: 'ش', // review-ar
  },

  home: {
    servicesTitle: 'خدماتنا', // review-ar
    servicesLead: 'اختر الخدمة وراسلنا على واتساب، ونؤكد لك السعر والموعد قبل أن يبدأ الفني.', // review-ar
    allServices: 'كل الخدمات', // review-ar
    whyTitle: 'لماذا رياض هوم سوليوشن؟', // review-ar
    workTitle: 'من أعمالنا', // review-ar
    workLead: 'صور حقيقية من بيوت عملائنا في الرياض.', // review-ar
    allWork: 'كل الأعمال', // review-ar
    reviewsTitle: 'آراء عملائنا', // review-ar
    areasTitle: 'الأحياء التي نخدمها', // review-ar
    areasLead: 'فريقنا ينطلق من محلنا في غرناطة إلى الأحياء القريبة.', // review-ar
    ctaTitle: 'تحتاج فنيًا؟ نحن جاهزون', // review-ar
    ctaBody: 'راسلنا على واتساب ونرد عليك بالسعر والموعد، أو اتصل بنا مباشرة.', // review-ar
    sceneLabel: 'رسم توضيحي لغرفة فيها إضاءة سقف ومغسلة وكاميرا مراقبة، وفني من فريقنا مع صندوق العدة', // review-ar
  },

  why: [
    {
      title: 'فنيون من فريقنا',
      body: 'أكثر من 10 فنيين يعملون معنا يوميًا، وليسوا عمالة من جهات خارجية.', // review-ar
    },
    {
      title: 'القطع متوفرة في محلنا',
      body: 'يحضر الفني القطعة من محلنا في غرناطة، فينتهي العمل غالبًا في زيارة واحدة.', // review-ar
    },
    {
      title: 'منذ 1999',
      body: 'أكثر من 20 عامًا في نفس المبنى بحي غرناطة، فتعرف دائمًا أين تجدنا.', // review-ar
    },
    {
      title: 'طوارئ على مدار الساعة',
      body: 'تسريب أو انقطاع كهرباء؟ اتصل بنا في أي وقت ونرسل فنيًا في أقرب وقت.', // review-ar
    },
  ],

  steps: {
    title: 'كيف نعمل', // review-ar
    items: [
      { title: 'راسلنا على واتساب', body: 'أرسل الخدمة التي تحتاجها، ومعها صورة إن أمكن.' }, // review-ar
      { title: 'نؤكد السعر والموعد', body: 'تعرف السعر قبل أن يبدأ أي عمل.' }, // review-ar
      { title: 'يصل الفني ومعه القطع', body: 'القطع من محلنا، فلا انتظار ولا زيارة ثانية غالبًا.' }, // review-ar
      { title: 'ننهي العمل ونجرّبه', body: 'نجرّب كل شيء أمامك قبل أن نغادر.' }, // review-ar
    ],
  },

  category: {
    servicesIn: (name: string) => `خدمات ${name}`, // review-ar
    about: 'عن الخدمة', // review-ar
    covers: 'ماذا تشمل', // review-ar
    other: 'خدمات أخرى', // review-ar
    allCategoriesLead: 'كل خدمات الصيانة المنزلية التي يقدمها فريقنا في الرياض.', // review-ar
  },

  servicesHub: {
    gridLabel: 'أقسام الخدمات', // review-ar
    viewAll: (n: number) => `عرض كل الخدمات (${n})`, // review-ar
    more: (n: number) => `+${n} أخرى`, // review-ar
  },

  service: {
    options: 'المقاسات والخيارات', // review-ar
    includes: 'ماذا يشمل العمل', // review-ar
    excludes: 'لا يشمل', // review-ar
    parts: 'قطع متوفرة في محلنا', // review-ar
    related: 'خدمات ذات صلة', // review-ar
    previewNote: 'عند الضغط على زر واتساب تُفتح هذه الرسالة جاهزة، ويمكنك تعديلها أو إضافة التفاصيل قبل الإرسال.', // review-ar
    readyTitle: 'اطلب الخدمة الآن', // review-ar
  },

  products: {
    lead: 'أدوات صحية وكهربائية وإنارة وكاميرات ومواد بناء متوفرة في محلنا بحي غرناطة.', // review-ar
    noPrices: 'لا نعرض الأسعار في الموقع. اسألنا على واتساب ونرد عليك بالسعر والتوفر.', // review-ar
    askCategory: (name: string) => `اسأل عن ${name}`, // review-ar
    emptyCategory: 'نضيف منتجات هذا القسم قريبًا. اسألنا عن أي قطعة تحتاجها.', // review-ar
    sections: 'الأقسام', // review-ar
  },

  work: {
    lead: 'صور من أعمال فنيينا في بيوت الرياض.', // review-ar
    filterLabel: 'تصفية حسب الخدمة', // review-ar
    all: 'الكل',
    before: 'قبل',
    after: 'بعد',
    compare: 'اسحب للمقارنة بين قبل وبعد', // review-ar
    empty: 'نضيف صور أعمالنا قريبًا. تابعنا أو راسلنا على واتساب لتطلب صورًا لأعمال مشابهة.', // review-ar
    emptyFilter: 'لا توجد صور لهذه الخدمة بعد.', // review-ar
    open: 'عرض الصورة', // review-ar
  },

  reviews: {
    lead: 'تقييمات عملائنا على Google وفي موقعنا.', // review-ar
    googleRating: 'تقييمنا على Google', // review-ar
    basedOn: (n: number) => `من ${n} تقييم`, // review-ar
    fromGoogle: 'تقييمات من Google', // review-ar
    seeOnGoogle: 'كل التقييمات على Google', // review-ar
    writeOnGoogle: 'اكتب تقييمك على Google', // review-ar
    siteReviews: 'تقييمات من موقعنا', // review-ar
    none: 'لا توجد تقييمات منشورة بعد. كن أول من يشاركنا رأيه.', // review-ar
    stars: (n: number) => `${n} من 5 نجوم`, // review-ar
    service: 'الخدمة', // review-ar
  },

  reviewForm: {
    title: 'شاركنا رأيك', // review-ar
    lead: 'رأيك يساعدنا ويساعد جيرانك على الاختيار. يظهر التقييم في الموقع بعد مراجعته.', // review-ar
    name: 'الاسم', // review-ar
    phone: 'رقم الجوال', // review-ar
    phoneHint: 'رقمك لن يظهر للزوار، نستخدمه فقط للتأكد من صحة الرأي.',
    phoneInvalid: 'أدخل رقم جوال صحيحًا مثل 05XXXXXXXX، أو رقمًا دوليًا مع رمز الدولة.', // review-ar
    area: 'الحي', // review-ar
    areaOther: 'حي آخر', // review-ar
    choose: 'اختر', // review-ar
    service: 'الخدمة التي حصلت عليها', // review-ar
    rating: 'تقييمك', // review-ar
    body: 'تعليقك', // review-ar
    photo: 'صورة للعمل (اختياري)', // review-ar
    photoHint: 'صورة واحدة، وسنصغّر حجمها تلقائيًا قبل الإرسال.', // review-ar
    consent: 'بإرسال التقييم توافق على نشر اسمك وحيّك وتعليقك في الموقع بعد المراجعة.', // review-ar
    submit: 'إرسال التقييم', // review-ar
    sending: 'جارٍ الإرسال…', // review-ar
    thanks: 'شكرًا لك! سيظهر تقييمك بعد مراجعته.', // review-ar
    another: 'إرسال تقييم آخر', // review-ar
    required: 'هذا الحقل مطلوب', // review-ar
    ratingRequired: 'اختر عدد النجوم', // review-ar
    tooLong: (max: number) => `الحد الأقصى ${max} حرفًا`, // review-ar
    photoType: 'اختر ملف صورة', // review-ar
    photoTooBig: 'الصورة كبيرة جدًا (الحد 10 ميجابايت)', // review-ar
    failed: 'تعذّر إرسال التقييم. حاول مرة أخرى أو راسلنا على واتساب.', // review-ar
    unavailable: 'إرسال التقييمات غير متاح حاليًا. راسلنا على واتساب.', // review-ar
  },

  about: {
    lead: 'محل أدوات صحية وكهربائية، وفريق من الفنيين، في نفس المبنى بحي غرناطة منذ أكثر من 20 عامًا.', // review-ar
    storyTitle: 'قصتنا', // review-ar
    stats: {
      since: 'سنة التأسيس', // review-ar
      years: 'عامًا في نفس المبنى', // review-ar
      technicians: 'فنيًا في فريقنا', // review-ar
      areas: 'أحياء نخدمها', // review-ar
    },
    shopTitle: 'محلنا في غرناطة', // review-ar
    shopBody: 'أدوات صحية وكهربائية وإنارة ومواد بناء، ومنه يأخذ الفني القطعة التي يحتاجها بيتك.', // review-ar
    teamTitle: 'فريقنا', // review-ar
    teamBody: 'أكثر من 10 فنيين في السباكة والكهرباء والكاميرات يعملون معنا يوميًا.', // review-ar
    whereTitle: 'أين نحن', // review-ar
    plusCode: 'الرمز الموقعي', // review-ar
    mapTitle: 'موقع رياض هوم سوليوشن على خرائط Google', // review-ar
    showMap: 'عرض الخريطة', // review-ar
  },

  contact: {
    whatsappBody: 'الأسرع: أرسل الخدمة وصورة إن أمكن، ونرد عليك بالسعر والموعد.', // review-ar
    callTitle: 'اتصل بنا', // review-ar
    callBody: 'للطوارئ والاستفسارات على مدار الساعة.', // review-ar
    visitTitle: 'زر المحل', // review-ar
    formTitle: 'اطلب زيارة فني', // review-ar
    formLead: 'املأ البيانات، وسيفتح واتساب برسالة جاهزة ترسلها لنا.', // review-ar
    name: 'الاسم', // review-ar
    district: 'الحي', // review-ar
    service: 'الخدمة', // review-ar
    description: 'وصف المشكلة', // review-ar
    descriptionHint: 'مثال: تسريب تحت مغسلة المطبخ منذ يومين', // review-ar
    submit: 'متابعة على واتساب', // review-ar
    note: 'لا نحفظ هذه البيانات في الموقع، فهي تصلنا فقط عبر واتساب.', // review-ar
    otherService: 'خدمة أخرى', // review-ar
    hoursTitle: 'ساعات العمل', // review-ar
  },
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

  common: {
    seeAll: 'See all',
    askOnWhatsapp: 'Ask on WhatsApp',
    ownTechnicians: 'Our own technicians',
    partsInStock: 'Parts in stock at our shop',
    servicesCount: (n: number) => (n === 1 ? '1 service' : `${n} services`),
    shop: 'Our shop',
    close: 'Close',
    previous: 'Previous',
    next: 'Next',
    faqTitle: 'Frequently asked questions',
    areasNoteIntro: 'We cover',
    mapApprox: 'Locations are approximate',
    north: 'N',
  },

  home: {
    servicesTitle: 'Our services',
    servicesLead: 'Pick a service and message us on WhatsApp — we confirm the price and time before the technician starts.',
    allServices: 'All services',
    whyTitle: 'Why Riyadh Home Solution?',
    workTitle: 'Our work',
    workLead: 'Real photos from our customers’ homes in Riyadh.',
    allWork: 'See all our work',
    reviewsTitle: 'What our customers say',
    areasTitle: 'Areas we cover',
    areasLead: 'Our team heads out from our shop in Ghirnatah to the districts around it.',
    ctaTitle: 'Need a technician? We’re ready',
    ctaBody: 'Message us on WhatsApp and we’ll reply with the price and time — or call us directly.',
    sceneLabel: 'Illustration of a room with ceiling spotlights, a basin and a security camera, and one of our technicians with a toolbox',
  },

  why: [
    { title: 'Our own technicians', body: 'More than 10 technicians who work with us every day — not outsourced workers.' },
    { title: 'Parts in stock at our shop', body: 'The technician brings the part from our Ghirnatah shop, so the job is usually done in one visit.' },
    { title: 'Since 1999', body: 'Over 20 years in the same building in Ghirnatah — you always know where to find us.' },
    { title: 'Emergency service 24/7', body: 'A leak or a power cut? Call us any time and we send a technician as soon as possible.' },
  ],

  steps: {
    title: 'How we work',
    items: [
      { title: 'Message us on WhatsApp', body: 'Tell us what you need, with a photo if you can.' },
      { title: 'We confirm price and time', body: 'You know the price before any work starts.' },
      { title: 'The technician arrives with the parts', body: 'Parts come from our shop — no waiting, usually no second visit.' },
      { title: 'We finish and test', body: 'We test everything with you before we leave.' },
    ],
  },

  category: {
    servicesIn: (name: string) => `${name} services`,
    about: 'About the service',
    covers: 'What it covers',
    other: 'Other services',
    allCategoriesLead: 'Every home maintenance service our team offers in Riyadh.',
  },

  servicesHub: {
    gridLabel: 'Service categories',
    viewAll: (n: number) => `View all ${n} services`,
    more: (n: number) => `+${n} more`,
  },

  service: {
    options: 'Sizes and options',
    includes: 'What’s included',
    excludes: 'Not included',
    parts: 'Parts we stock',
    related: 'Related services',
    previewNote: 'Tapping WhatsApp opens this message ready to send — you can edit it or add details first.',
    readyTitle: 'Book this service',
  },

  products: {
    lead: 'Sanitary ware, electrical supplies, lighting, cameras and building materials in stock at our Ghirnatah shop.',
    noPrices: 'We don’t list prices on the site — ask on WhatsApp and we’ll reply with price and availability.',
    askCategory: (name: string) => `Ask about ${name.toLowerCase()}`,
    emptyCategory: 'Items for this section are being added. Ask us about any part you need.',
    sections: 'Sections',
  },

  work: {
    lead: 'Photos of our technicians’ work in Riyadh homes.',
    filterLabel: 'Filter by service',
    all: 'All',
    before: 'Before',
    after: 'After',
    compare: 'Drag to compare before and after',
    empty: 'Photos of our work are coming soon. Message us on WhatsApp to see examples of similar jobs.',
    emptyFilter: 'No photos for this service yet.',
    open: 'View photo',
  },

  reviews: {
    lead: 'What our customers say on Google and on our website.',
    googleRating: 'Our Google rating',
    basedOn: (n: number) => `from ${n} reviews`,
    fromGoogle: 'Reviews from Google',
    seeOnGoogle: 'See all reviews on Google',
    writeOnGoogle: 'Write a review on Google',
    siteReviews: 'Reviews from our website',
    none: 'No published reviews yet — be the first to share yours.',
    stars: (n: number) => `${n} out of 5 stars`,
    service: 'Service',
  },

  reviewForm: {
    title: 'Share your experience',
    lead: 'Your feedback helps us and your neighbours. Reviews appear on the site after we check them.',
    name: 'Name',
    phone: 'Mobile number',
    phoneHint: 'Your number won’t be shown to visitors — we only use it to check the review is genuine.',
    phoneInvalid: 'Enter a valid mobile number, e.g. 05XXXXXXXX, or an international number with its country code.',
    area: 'Area',
    areaOther: 'Another area',
    choose: 'Choose',
    service: 'Service you had',
    rating: 'Your rating',
    body: 'Your review',
    photo: 'Photo of the work (optional)',
    photoHint: 'One photo — we shrink it automatically before sending.',
    consent: 'By sending, you agree we may publish your name, area and review on this site after checking it.',
    submit: 'Send review',
    sending: 'Sending…',
    thanks: 'Thanks — your review will appear after approval.',
    another: 'Send another review',
    required: 'This field is required',
    ratingRequired: 'Please choose a star rating',
    tooLong: (max: number) => `Maximum ${max} characters`,
    photoType: 'Please choose an image file',
    photoTooBig: 'That photo is too large (10 MB max)',
    failed: 'We couldn’t send your review. Please try again or message us on WhatsApp.',
    unavailable: 'Reviews can’t be sent right now. Please message us on WhatsApp.',
  },

  about: {
    lead: 'A plumbing and electrical supplies shop and a team of technicians — in the same Ghirnatah building for over 20 years.',
    storyTitle: 'Our story',
    stats: {
      since: 'Founded',
      years: 'years in the same building',
      technicians: 'technicians on our team',
      areas: 'districts covered',
    },
    shopTitle: 'Our shop in Ghirnatah',
    shopBody: 'Plumbing, electrical, lighting and building supplies — where our technicians pick up the parts your home needs.',
    teamTitle: 'Our team',
    teamBody: 'More than 10 technicians in plumbing, electrical and CCTV who work with us every day.',
    whereTitle: 'Where we are',
    plusCode: 'Plus Code',
    mapTitle: 'Riyadh Home Solution on Google Maps',
    showMap: 'Show map',
  },

  contact: {
    whatsappBody: 'Fastest: send the service and a photo if you can — we reply with the price and time.',
    callTitle: 'Call us',
    callBody: 'For emergencies and questions, around the clock.',
    visitTitle: 'Visit the shop',
    formTitle: 'Request a visit',
    formLead: 'Fill this in and WhatsApp opens with a ready-to-send message.',
    name: 'Name',
    district: 'Area',
    service: 'Service',
    description: 'Describe the problem',
    descriptionHint: 'e.g. leak under the kitchen sink for two days',
    submit: 'Continue on WhatsApp',
    note: 'We don’t store this form — it only reaches us through WhatsApp.',
    otherService: 'Something else',
    hoursTitle: 'Opening hours',
  },
}

export const strings: Record<Lang, Strings> = { ar, en }
export type { Strings }
