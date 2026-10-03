import type { SeedCategory } from './define'

// Category names are from PROJECT_BRIEF.md §11. Other Arabic text is new and marked `// review-ar`.
// image_url: the original category illustrations (design/illustrations → public/illustrations).
// wa_message_*: the WhatsApp text on each category page, as approved by the owner.
export const seedCategories: SeedCategory[] = [
  {
    slug: 'plumbing',
    name_ar: 'السباكة',
    name_en: 'Plumbing',
    headline_ar: 'سباك في الرياض — غرناطة والأحياء المجاورة',
    headline_en: 'Plumber in Riyadh — Ghirnatah and nearby districts',
    intro_ar:
      'خدمات سباكة في الرياض ينفذها فنيون من فريقنا، ومعهم القطع من محلنا في غرناطة: تركيب السخانات والخلاطات، وتغيير المحابس، وتسليك الانسدادات. نؤكد لك السعر عبر واتساب قبل البدء، وخدمة الطوارئ متاحة على مدار الساعة.', // review-ar
    intro_en:
      'Plumbing services in Riyadh by our own technicians, with parts from our shop in Ghirnatah: water heaters, mixer taps, valves and blockage clearing. We confirm the price on WhatsApp before we start, and emergency service is available 24/7.',
    meta_description_ar:
      'سباك في الرياض من فريقنا: تركيب سخانات وخلاطات وتسليك انسدادات، والقطع من محلنا في غرناطة. السعر عبر واتساب وخدمة طوارئ 24/7.', // review-ar
    meta_description_en:
      'Plumber in Riyadh from our own team: water heaters, mixers and blockage clearing, with parts from our Ghirnatah shop. Price on WhatsApp, 24/7 emergency.',
    covers_ar: [
      'تركيب وتغيير السخانات العادية والمخفية', // review-ar
      'تغيير الخلاطات والشطافات والمحابس', // review-ar
      'تسليك انسداد المغاسل والأحواض والصرف', // review-ar
      'تركيب المغاسل والكراسي والدشات', // review-ar
      'المضخات والغطاسات وعوامات الخزانات', // review-ar
      'تمديد وتوصيل الغسالات', // review-ar
    ],
    covers_en: [
      'Standard and concealed water heaters',
      'Mixer taps, bidet sprayers and valves',
      'Sink, basin and drain blockages',
      'Basins, toilets and showers',
      'Water pumps, submersible pumps and tank float valves',
      'Washing machine connections',
    ],
    faq: [
      {
        q_ar: 'متى يصل السباك؟', // review-ar
        a_ar: 'نحدد الموعد معك عبر واتساب حسب جدول الفنيين، وفي الحالات الطارئة مثل التسريب الكبير نرسل فنيًا في أقرب وقت على مدار الساعة.', // review-ar
        q_en: 'When can the plumber come?',
        a_en: 'We agree the time with you on WhatsApp based on the technicians’ schedule. For emergencies such as a major leak, we send a technician as soon as possible, day or night.',
      },
      {
        q_ar: 'هل القطع متوفرة لديكم؟', // review-ar
        a_ar: 'نعم، معظم قطع السباكة من سخانات وخلاطات ومحابس ولّيات متوفرة في محلنا بغرناطة، فيحضرها الفني معه وينتهي العمل غالبًا في زيارة واحدة.', // review-ar
        q_en: 'Do you have the parts?',
        a_en: 'Yes. Most plumbing parts — heaters, mixers, valves and hoses — are in stock at our Ghirnatah shop, so the technician brings them and the job is usually done in one visit.',
      },
      {
        q_ar: 'كيف أعرف السعر؟', // review-ar
        a_ar: 'أرسل لنا الخدمة المطلوبة عبر واتساب، ويُفضّل مع صورة، ونؤكد لك السعر قبل بدء العمل.', // review-ar
        q_en: 'How do I get the price?',
        a_en: 'Send us the service you need on WhatsApp, ideally with a photo, and we confirm the price before any work starts.',
      },
    ],
    icon: 'droplet',
    image_url: '/illustrations/plumbing.png',
    wa_message_ar: 'السلام عليكم، أحتاج فني سباكة.',
    wa_message_en: 'Hello, I need a plumber.',
    sort_order: 10,
    is_active: true,
    is_primary: true,
  },
  {
    slug: 'electrical',
    name_ar: 'الكهرباء والإنارة',
    name_en: 'Electrical & Lighting',
    headline_ar: 'كهربائي في الرياض — غرناطة والأحياء المجاورة', // review-ar
    headline_en: 'Electrician in Riyadh — Ghirnatah and nearby districts',
    intro_ar:
      'خدمات كهرباء وإنارة في الرياض ينفذها فنيون من فريقنا، ومعهم القطع من محلنا في غرناطة: سبوت لايت وبانيل ولمبات، وأفياش ومفاتيح، وطبلونات. نؤكد لك السعر عبر واتساب قبل البدء، وخدمة الطوارئ متاحة على مدار الساعة.', // review-ar
    intro_en:
      'Electrical and lighting services in Riyadh by our own technicians, with parts from our shop in Ghirnatah: spotlights, panel lights and bulbs, sockets and switches, and breaker panels. We confirm the price on WhatsApp before we start, and emergency service is available 24/7.',
    meta_description_ar:
      'كهربائي في الرياض من فريقنا: سبوت لايت وأفياش وطبلونات وفحص أعطال، والقطع من محلنا في غرناطة. السعر عبر واتساب وخدمة طوارئ 24/7.', // review-ar
    meta_description_en:
      'Electrician in Riyadh from our own team: spotlights, sockets, panels and fault finding, with parts from our Ghirnatah shop. Price on WhatsApp, 24/7.',
    covers_ar: [
      'تركيب وتغيير السبوت لايت والبانيل واللمبات', // review-ar
      'الأفياش ومفاتيح المكيفات والسخانات', // review-ar
      'مفاتيح الطبلون الرئيسي والفرعي وفحص الأعطال', // review-ar
      'الثريات وأشرطة الليد المخفية', // review-ar
      'الإنارة الخارجية والكشافات وأعمدة الإنارة', // review-ar
      'الشفاطات وأجراس الأبواب وتمديدات الغسالات', // review-ar
    ],
    covers_en: [
      'Spotlights, panel lights and bulbs',
      'Sockets and AC / water heater switches',
      'Main and sub-panel breakers, fault finding',
      'Chandeliers and hidden LED strips',
      'Outdoor lights, flood lights and pole lights',
      'Exhaust fans, doorbells and washer power points',
    ],
    faq: [
      {
        q_ar: 'المفتاح في الطبلون يفصل باستمرار، ماذا أفعل؟', // review-ar
        a_ar: 'لا تحاول تشغيله مرارًا. افصل الأجهزة عن الخط وتواصل معنا، ويفحص الفني سبب الفصل سواء كان حملًا زائدًا أو تماسًا أو مفتاحًا ضعيفًا.', // review-ar
        q_en: 'A breaker keeps tripping. What should I do?',
        a_en: 'Don’t keep switching it back on. Unplug the devices on that line and contact us; the technician will find whether it’s an overload, a short or a weak breaker.',
      },
      {
        q_ar: 'هل توفرون السبوت لايت والبانيل؟', // review-ar
        a_ar: 'نعم، السبوت لايت والبانيل واللمبات بمقاسات وألوان إضاءة مختلفة متوفرة في محلنا، ويحضرها الفني معه حسب طلبك.', // review-ar
        q_en: 'Do you supply the spotlights and panel lights?',
        a_en: 'Yes. Spotlights, panel lights and bulbs in many sizes and light colours are in stock at our shop, and the technician brings what you need.',
      },
      {
        q_ar: 'كيف أعرف السعر؟', // review-ar
        a_ar: 'أرسل لنا الخدمة والعدد أو المقاس عبر واتساب، ويُفضّل مع صورة، ونؤكد لك السعر قبل بدء العمل.', // review-ar
        q_en: 'How do I get the price?',
        a_en: 'Send us the service and the quantity or size on WhatsApp, ideally with a photo, and we confirm the price before any work starts.',
      },
    ],
    icon: 'zap',
    image_url: '/illustrations/electrical.png',
    wa_message_ar: 'السلام عليكم، أحتاج فني كهرباء.',
    wa_message_en: 'Hello, I need an electrician.',
    sort_order: 20,
    is_active: true,
    is_primary: true,
  },
  {
    slug: 'cctv-intercom-network',
    name_ar: 'الكاميرات والإنتركم والشبكات',
    name_en: 'CCTV, Intercom & Network',
    headline_ar: 'تركيب كاميرات مراقبة وإنتركم في الرياض', // review-ar
    headline_en: 'CCTV and intercom installation in Riyadh',
    intro_ar:
      'تركيب كاميرات المراقبة والإنتركم وتقوية الشبكات في الرياض بأيدي فنيين من فريقنا. نركّب جميع الأنواع حسب اختيار العميل، ونضبط التشغيل على جوالك قبل أن نغادر، ونؤكد لك السعر عبر واتساب قبل البدء.', // review-ar
    intro_en:
      'CCTV, intercom and home network installation in Riyadh by our own technicians. We install all types according to the customer’s choice, set everything up on your phone before we leave, and confirm the price on WhatsApp before we start.',
    meta_description_ar:
      'تركيب كاميرات مراقبة وإنتركم وتقوية شبكات في الرياض بأيدي فنيين من فريقنا، جميع الأنواع حسب اختيارك. السعر عبر واتساب.', // review-ar
    meta_description_en:
      'CCTV, intercom and Wi-Fi installation in Riyadh by our own technicians — all types, your choice of brand. Price confirmed on WhatsApp before work starts.',
    covers_ar: [
      'كاميرات المراقبة الداخلية والخارجية', // review-ar
      'كاميرات الأبواب والإنتركم: تركيب وإصلاح وتغيير', // review-ar
      'فحص ضعف الشبكة وتركيب الراوتر والمقويات', // review-ar
      'تمديد كابلات الشبكة وأجهزة الواي فاي', // review-ar
      'أنظمة التلفزيون والسماعات والسنترال', // review-ar
      'أنظمة المساعدة لذوي الاحتياجات الخاصة', // review-ar
    ],
    covers_en: [
      'Indoor and outdoor security cameras',
      'Door cameras and intercoms: install, repair, replace',
      'Weak network checks, routers and extenders',
      'Network cabling and Wi-Fi devices',
      'TV, speaker and PBX systems',
      'Assistance systems for people with special needs',
    ],
    faq: [
      {
        q_ar: 'ما أنواع الكاميرات التي تركبونها؟', // review-ar
        a_ar: 'نركّب جميع الأنواع حسب اختيار العميل، ويمكننا أن نقترح عليك الأنسب لمساحة البيت وعدد المداخل.', // review-ar
        q_en: 'Which camera brands do you install?',
        a_en: 'All brands, according to the customer’s choice. We can also suggest what suits the size of your home and the number of entrances.',
      },
      {
        q_ar: 'هل أستطيع مشاهدة الكاميرات من جوالي؟', // review-ar
        a_ar: 'نعم، نضبط التطبيق على جوالك قبل أن نغادر ونشرح لك طريقة المشاهدة والرجوع إلى التسجيلات.', // review-ar
        q_en: 'Can I watch the cameras on my phone?',
        a_en: 'Yes. We set up the app on your phone before we leave and show you how to view live video and recordings.',
      },
      {
        q_ar: 'كيف أعرف السعر؟', // review-ar
        a_ar: 'أرسل لنا عدد الكاميرات أو نوع الخدمة وصورًا للمكان عبر واتساب، ونؤكد لك السعر قبل بدء العمل.', // review-ar
        q_en: 'How do I get the price?',
        a_en: 'Send us the number of cameras or the service you need, with photos of the place, on WhatsApp and we confirm the price before work starts.',
      },
    ],
    icon: 'cctv',
    image_url: '/illustrations/cctv-intercom-network.png',
    wa_message_ar: 'السلام عليكم، أحتاج فني كاميرات وإنتركم وشبكات.',
    wa_message_en: 'Hello, I need a CCTV, intercom and network technician.',
    sort_order: 30,
    is_active: true,
    is_primary: true,
  },
  {
    slug: 'painting',
    name_ar: 'الدهانات',
    name_en: 'Painting',
    headline_ar: 'دهانات داخلية وخارجية في الرياض', // review-ar
    headline_en: 'Interior and exterior painting in Riyadh',
    intro_ar:
      'دهان الجدران الداخلية والواجهات الخارجية للشقق والفلل في الرياض. نحمي الأرضيات والأثاث قبل البدء، ونجهّز الجدار ونعالج الشقوق البسيطة قبل الدهان، ونؤكد لك السعر عبر واتساب بعد معرفة المساحة.', // review-ar
    intro_en:
      'Interior wall and exterior facade painting for apartments and villas in Riyadh. We protect floors and furniture first, prepare the walls and fill minor cracks before painting, and confirm the price on WhatsApp once we know the area.',
    meta_description_ar:
      'دهانات داخلية وخارجية للشقق والفلل في الرياض مع تجهيز الجدران وحماية الأرضيات. السعر عبر واتساب بعد معرفة المساحة.', // review-ar
    meta_description_en:
      'Interior and exterior painting for apartments and villas in Riyadh, with wall preparation and floor protection. Price on WhatsApp once we know the area.',
    covers_ar: [
      'تجهيز الجدران ومعالجة الشقوق البسيطة', // review-ar
      'دهانات داخلية للغرف والصالات', // review-ar
      'دهانات خارجية للواجهات والأسوار', // review-ar
      'حماية الأرضيات والأثاث أثناء العمل', // review-ar
    ],
    covers_en: [
      'Wall preparation and minor crack filling',
      'Interior painting for rooms and halls',
      'Exterior painting for facades and boundary walls',
      'Floor and furniture protection while we work',
    ],
    faq: [
      {
        q_ar: 'هل توفرون الدهان أم أشتريه بنفسي؟', // review-ar
        a_ar: 'يمكنك اختيار الدهان بنفسك، أو نخبرك بالكمية المناسبة لمساحتك قبل البدء.', // review-ar
        q_en: 'Do you supply the paint or should I buy it?',
        a_en: 'You can choose the paint yourself, or we tell you the right quantity for your area before we start.',
      },
    ],
    icon: 'paint-roller',
    image_url: '/illustrations/painting.png',
    wa_message_ar: 'السلام عليكم، أحتاج خدمة دهانات.',
    wa_message_en: 'Hello, I need a painting service.',
    sort_order: 40,
    is_active: true,
    is_primary: false,
  },
  {
    slug: 'tiles',
    name_ar: 'البلاط',
    name_en: 'Tiles',
    headline_ar: 'تركيب بلاط في الرياض', // review-ar
    headline_en: 'Tile installation in Riyadh',
    intro_ar:
      'تركيب بلاط الأرضيات والجدران، أو تكسير البلاط القديم وتركيب بلاط جديد مكانه، للمطابخ والحمامات والغرف. نحدد معك المساحة ونوع العمل عبر واتساب، ونؤكد لك السعر قبل البدء.', // review-ar
    intro_en:
      'Floor and wall tiling, or removing old tiles and laying new ones, for kitchens, bathrooms and rooms. We agree the area and type of work with you on WhatsApp and confirm the price before we start.',
    meta_description_ar:
      'تركيب بلاط أرضيات وجدران في الرياض، وتكسير البلاط القديم وتركيب جديد للمطابخ والحمامات والغرف. السعر عبر واتساب.', // review-ar
    meta_description_en:
      'Floor and wall tile installation in Riyadh, including removing old tiles and laying new ones for kitchens, bathrooms and rooms. Price on WhatsApp.',
    covers_ar: [
      'تركيب بلاط أرضيات جديد', // review-ar
      'تكسير البلاط القديم وتركيب جديد', // review-ar
      'بلاط جدران المطابخ والحمامات', // review-ar
      'ضبط المستوى والميول والترويب', // review-ar
    ],
    covers_en: [
      'New floor tiles',
      'Old tile removal and new tiling',
      'Kitchen and bathroom wall tiles',
      'Levelling, falls and grouting',
    ],
    faq: [
      {
        q_ar: 'هل توفرون البلاط؟', // review-ar
        a_ar: 'يمكنك اختيار البلاط بنفسك، ونخبرك بالكمية المناسبة بعد معرفة المساحة.', // review-ar
        q_en: 'Do you supply the tiles?',
        a_en: 'You can choose the tiles yourself, and we tell you the quantity you need once we know the area.',
      },
    ],
    icon: 'grid',
    image_url: '/illustrations/tiles.png',
    wa_message_ar: 'السلام عليكم، أحتاج فني تركيب بلاط.',
    wa_message_en: 'Hello, I need a tile installer.',
    sort_order: 50,
    is_active: true,
    is_primary: false,
  },
  {
    slug: 'cleaning',
    name_ar: 'التنظيف',
    name_en: 'Cleaning',
    headline_ar: 'تنظيف المنازل والخزانات في الرياض', // review-ar
    headline_en: 'Home and water tank cleaning in Riyadh',
    intro_ar:
      'تنظيف الخزانات الأرضية والعلوية، وتنظيف الشقق والفلل الجديدة والمفروشة، وإزالة بقع الدهان وغراء الموكيت من الأرضيات. نحدد معك نوع التنظيف والمساحة عبر واتساب، ونؤكد لك السعر قبل البدء.', // review-ar
    intro_en:
      'Ground and roof water tank cleaning, new and furnished apartment and villa cleaning, and removing paint stains and carpet glue from floors. We agree the type of cleaning and the area on WhatsApp and confirm the price before we start.',
    meta_description_ar:
      'تنظيف الخزانات والشقق والفلل في الرياض، وإزالة بقع الدهان وغراء الموكيت من الأرضيات. السعر عبر واتساب قبل البدء.', // review-ar
    meta_description_en:
      'Water tank, apartment and villa cleaning in Riyadh, plus paint stain and carpet glue removal from floors. Price confirmed on WhatsApp before we start.',
    covers_ar: [
      'تنظيف الخزانات الأرضية والعلوية', // review-ar
      'تنظيف الشقق والفلل الجديدة والمفروشة', // review-ar
      'إزالة بقع الدهان من الأرضيات', // review-ar
      'إزالة غراء الموكيت', // review-ar
    ],
    covers_en: [
      'Ground and roof water tanks',
      'New and furnished apartments and villas',
      'Paint stain removal from floors',
      'Carpet glue removal',
    ],
    faq: [
      {
        q_ar: 'كم مرة يُنصح بتنظيف خزان الماء؟', // review-ar
        a_ar: 'يُنصح بتنظيف الخزان مرة أو مرتين في السنة على الأقل، أو عند ملاحظة رواسب أو تغيّر في لون الماء.', // review-ar
        q_en: 'How often should a water tank be cleaned?',
        a_en: 'At least once or twice a year, or whenever you notice sediment or a change in the water’s colour.',
      },
    ],
    icon: 'sparkles',
    image_url: '/illustrations/cleaning.png',
    wa_message_ar: 'السلام عليكم، أحتاج خدمة تنظيف.',
    wa_message_en: 'Hello, I need a cleaning service.',
    sort_order: 60,
    is_active: true,
    is_primary: false,
  },
]
