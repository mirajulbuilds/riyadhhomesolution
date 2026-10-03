import type { SettingsValues } from '@/content/types'

// Business data from PROJECT_BRIEF.md §2. Arabic written for the site is marked `// review-ar`.
export const seedSettings: SettingsValues = {
  brand: { ar: 'رياض هوم سوليوشن', en: 'Riyadh Home Solution' },

  phone_display: '0500569163',
  phone_e164: '+966500569163',
  whatsapp_number: '966500569163',

  address: {
    street: { ar: 'شارع أبي جعفر المنصور', en: 'Abi Jafar Al Mansour St' },
    district: { ar: 'حي غرناطة', en: 'Ghirnatah' },
    city: { ar: 'الرياض', en: 'Riyadh' },
    postal_code: '13242',
    country: 'SA',
  },
  plus_code: 'QPWX+2JM Riyadh',
  maps_url: 'https://maps.app.goo.gl/DU7jN7hfts3gSaf66',
  // Centre of plus code QPWX+2JM (Riyadh), decoded with the Open Location Code algorithm.
  geo: { lat: 24.795088, lng: 46.749047 },

  hours: [
    { days: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'], opens: '08:00', closes: '23:30' },
    { days: ['fri'], opens: '12:30', closes: '23:30' },
  ],
  emergency: {
    ar: 'خدمة طوارئ على مدار الساعة',
    en: 'Emergency service 24/7',
  },

  since_year: 1999,
  years_in_building: 20,
  technicians: 10,

  service_areas: [
    { key: 'ghirnatah', ar: 'غرناطة', en: 'Ghirnatah' },
    { key: 'qurtubah', ar: 'قرطبة', en: 'Qurtubah' },
    { key: 'ash-shuhada', ar: 'الشهداء', en: 'Ash Shuhada' },
    { key: 'al-hamra', ar: 'الحمراء', en: 'Al Hamra' },
    { key: 'al-yarmuk', ar: 'اليرموك', en: 'Al Yarmuk' },
    { key: 'al-falah', ar: 'الفلاح', en: 'Al Falah' },
    { key: 'al-izdihar', ar: 'الازدهار', en: 'Al Izdihar' },
    { key: 'at-taawun', ar: 'التعاون', en: 'At Taawun' },
    { key: 'al-wadi', ar: 'الوادي', en: 'Al Wadi' },
  ],
  service_areas_note: {
    ar: 'والأحياء المجاورة، والأحياء الأبعد حسب نوع العمل', // review-ar
    en: 'and nearby districts; farther areas depending on the job',
  },

  // Each icon stays hidden until its URL is filled in from the admin panel.
  social: { facebook: '', instagram: '', tiktok: '', snapchat: '' },

  story: {
    // Arabic story text is the approved copy from PROJECT_BRIEF.md §9.
    ar: [
      'منذ عام 1999 ونحن نخدم بيوت الرياض.',
      'بدأنا محلًا لمواد السباكة والكهرباء، ومنذ أكثر من عشرين عامًا ونحن في نفس المبنى في حي غرناطة. مع الوقت صار عملاؤنا يطلبون منّا تركيب ما يشترونه، فكوّنّا فريقًا من أكثر من 10 فنيين يعملون معنا يوميًا.',
      'اليوم نجمع الاثنين: القطعة من محلنا، والفني من فريقنا — وخدمة الطوارئ متاحة على مدار الساعة.',
    ],
    en: [
      'We have been serving homes in Riyadh since 1999.',
      'We started as a plumbing and electrical supplies shop, and for more than twenty years we have been in the same building in Ghirnatah. Over time our customers began asking us to install what they bought, so we built a team of more than 10 technicians who work with us every day.',
      'Today we bring the two together: the part from our shop and the technician from our team — with emergency service available around the clock.',
    ],
  },

  google_place_id: '',

  home_faq: [
    {
      q_ar: 'هل الفنيون من فريقكم أم من جهات خارجية؟', // review-ar
      a_ar: 'جميع الفنيين من فريقنا ويعملون معنا يوميًا، وعددهم أكثر من 10 فنيين.', // review-ar
      q_en: 'Are the technicians your own staff?',
      a_en: 'Yes. Every technician is part of our own team — more than 10 of them work with us every day.',
    },
    {
      q_ar: 'كيف أعرف السعر قبل بدء العمل؟', // review-ar
      a_ar: 'أرسل لنا الخدمة المطلوبة عبر واتساب، ويُفضّل مع صورة، ونؤكد لك السعر والموعد قبل أن يبدأ الفني.', // review-ar
      q_en: 'How do I know the price before work starts?',
      a_en: 'Send us the service you need on WhatsApp, ideally with a photo, and we confirm the price and time before the technician starts.',
    },
    {
      q_ar: 'هل تحضرون القطع معكم؟', // review-ar
      a_ar: 'نعم، معظم القطع متوفرة في محلنا بحي غرناطة، فيحضرها الفني معه وينتهي العمل غالبًا في زيارة واحدة.', // review-ar
      q_en: 'Do you bring the parts?',
      a_en: 'Yes. Most parts are in stock at our shop in Ghirnatah, so the technician brings them along and the job is usually done in one visit.',
    },
    {
      q_ar: 'هل تعملون في الطوارئ وأيام الجمعة؟', // review-ar
      a_ar: 'نعم، خدمة الطوارئ متاحة على مدار الساعة طوال أيام الأسبوع بما فيها الجمعة، ومواعيد المحل موضحة أسفل الصفحة.', // review-ar
      q_en: 'Do you handle emergencies and work on Fridays?',
      a_en: 'Yes. Emergency service is available 24/7, Fridays included. The shop opening hours are at the bottom of the page.',
    },
    {
      q_ar: 'ما الأحياء التي تخدمونها؟', // review-ar
      a_ar: 'غرناطة، قرطبة، الشهداء، الحمراء، اليرموك، الفلاح، الازدهار، التعاون، الوادي والأحياء المجاورة، والأحياء الأبعد حسب نوع العمل.', // review-ar
      q_en: 'Which districts do you cover?',
      a_en: 'Ghirnatah, Qurtubah, Ash Shuhada, Al Hamra, Al Yarmuk, Al Falah, Al Izdihar, At Taawun, Al Wadi and nearby districts — farther areas depending on the job.',
    },
  ],
}
