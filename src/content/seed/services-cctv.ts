import { defineServices } from './define'

// Service names are from PROJECT_BRIEF.md §11. All other Arabic text is new and marked `// review-ar`.
// All brands are installed "according to the customer's choice" — never list brand names.
export const cctvServices = defineServices('cctv-intercom-network', [
  {
    slug: 'new-cctv-installation',
    name_ar: 'تركيب كاميرات مراقبة جديدة',
    name_en: 'New CCTV camera installation',
    short_ar: 'تركيب كاميرات مراقبة داخلية وخارجية جديدة مع جهاز التسجيل، وربطها بجوالك.', // review-ar
    short_en: 'Installing new indoor and outdoor cameras with a recorder, connected to your phone.',
    has_detail_page: true,
    wa_extra_lines_ar: 'عدد الكاميرات: ', // review-ar
    wa_extra_lines_en: 'Number of cameras: ',
    body_ar: [
      'نركّب كاميرات مراقبة داخلية وخارجية للبيوت والفلل، بجميع الأنواع حسب اختيارك، مع جهاز التسجيل وتمديد الكابلات بشكل مرتب.', // review-ar
      'نحدد معك أماكن الكاميرات لتغطية المداخل والحوش والمواقف، ونضبط التطبيق على جوالك لتشاهد البث والتسجيلات من أي مكان.', // review-ar
      'أرسل لنا عدد الكاميرات التقريبي وصورًا للمكان عبر واتساب، ونؤكد لك السعر قبل البدء.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We install indoor and outdoor security cameras for homes and villas — all types, according to your choice — with the recorder and neatly run cables.',
      'We agree the camera positions with you to cover entrances, the yard and parking, and set up the app on your phone so you can watch live video and recordings from anywhere.',
      'Send us roughly how many cameras you need and photos of the place on WhatsApp, and we confirm the price before we start.',
    ].join('\n\n'),
    options_ar: [
      'كاميرات داخلية', // review-ar
      'كاميرات خارجية', // review-ar
      'كاميرات سلكية أو لاسلكية', // review-ar
    ],
    options_en: ['Indoor cameras', 'Outdoor cameras', 'Wired or wireless cameras'],
    includes_ar: [
      'اختيار أماكن الكاميرات معك', // review-ar
      'تثبيت الكاميرات وتمديد الكابلات', // review-ar
      'تركيب جهاز التسجيل وضبطه', // review-ar
      'ربط الكاميرات بجوالك وتجربة المشاهدة', // review-ar
    ],
    includes_en: [
      'Choosing camera positions with you',
      'Mounting cameras and running cables',
      'Installing and setting up the recorder',
      'Connecting to your phone and testing playback',
    ],
    excludes_ar: [
      'اشتراك الإنترنت', // review-ar
      'الحفر أو التمديد تحت الأرض لمسافات طويلة', // review-ar
    ],
    excludes_en: ['Internet subscription', 'Digging or underground cable runs over long distances'],
    parts_ar: [
      'كاميرات داخلية وخارجية حسب اختيار العميل', // review-ar
      'أجهزة تسجيل وأقراص تخزين', // review-ar
      'كابلات ووصلات ومحولات', // review-ar
    ],
    parts_en: [
      'Indoor and outdoor cameras of the customer’s choice',
      'Recorders and storage drives',
      'Cables, connectors and power adapters',
    ],
    faq: [
      {
        q_ar: 'هل أستطيع مشاهدة الكاميرات من جوالي؟', // review-ar
        a_ar: 'نعم، نضبط التطبيق على جوالك قبل أن نغادر ونشرح لك طريقة المشاهدة والرجوع إلى التسجيلات.', // review-ar
        q_en: 'Can I watch the cameras on my phone?',
        a_en: 'Yes. We set up the app on your phone before we leave and show you how to view live video and recordings.',
      },
    ],
  },
  {
    slug: 'cctv-replacement',
    name_ar: 'تغيير واستبدال الكاميرات',
    name_en: 'CCTV camera replacement',
    short_ar: 'تغيير الكاميرات القديمة أو المتعطلة بكاميرات جديدة حسب اختيار العميل.', // review-ar
    short_en: 'Replacing old or faulty cameras with new ones of the customer’s choice.',
  },
  {
    slug: 'door-camera-installation',
    name_ar: 'تركيب كاميرا الباب',
    name_en: 'Door camera installation',
    short_ar: 'تركيب كاميرا أو جرس فيديو عند باب البيت لترى الزائر من جوالك.', // review-ar
    short_en: 'Installing a door camera or video doorbell so you can see visitors on your phone.',
    has_detail_page: true,
    body_ar: [
      'نركّب كاميرا الباب أو جرس الفيديو عند مدخل البيت، لترى الزائر وتتحدث معه من جوالك حتى وأنت خارج البيت.', // review-ar
      'نختار مكان التركيب المناسب، ونوصل الكاميرا بالكهرباء والواي فاي، ونجرّب التنبيهات على جوالك.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We install a door camera or video doorbell at your entrance so you can see and talk to visitors from your phone — even when you’re out.',
      'We choose the right mounting spot, connect power and Wi-Fi, and test the alerts on your phone.',
    ].join('\n\n'),
    includes_ar: [
      'تثبيت كاميرا الباب', // review-ar
      'التوصيل بالكهرباء أو بالجرس الحالي', // review-ar
      'ربطها بالواي فاي والتطبيق', // review-ar
      'تجربة التنبيهات والصوت', // review-ar
    ],
    includes_en: [
      'Mounting the door camera',
      'Connecting to power or the existing bell wiring',
      'Connecting to Wi-Fi and the app',
      'Testing alerts and two-way audio',
    ],
    excludes_ar: [
      'اشتراك التخزين السحابي إن وُجد', // review-ar
      'تقوية الواي فاي عند الباب (خدمة منفصلة)', // review-ar
    ],
    excludes_en: ['Cloud storage subscription, if any', 'Boosting Wi-Fi at the door (separate service)'],
    parts_ar: [
      'كاميرات أبواب وأجراس فيديو حسب اختيار العميل', // review-ar
      'محولات كهرباء ووصلات', // review-ar
    ],
    parts_en: ['Door cameras and video doorbells of the customer’s choice', 'Power adapters and connectors'],
    faq: [
      {
        q_ar: 'الواي فاي ضعيف عند الباب، هل ستعمل الكاميرا؟', // review-ar
        a_ar: 'قد تحتاج إلى مقوي شبكة. نفحص قوة الإشارة عند التركيب ونقترح الحل إن لزم.', // review-ar
        q_en: 'My Wi-Fi is weak at the door. Will the camera work?',
        a_en: 'You may need a Wi-Fi extender. We check the signal strength during installation and suggest a fix if needed.',
      },
    ],
  },
  {
    slug: 'new-intercom-installation',
    name_ar: 'تركيب إنتركم جديد',
    name_en: 'New intercom installation',
    short_ar: 'تركيب إنتركم جديد صوتي أو مرئي بين الباب الخارجي وداخل البيت.', // review-ar
    short_en: 'Installing a new audio or video intercom between the gate and inside the home.',
  },
  {
    slug: 'intercom-repair',
    name_ar: 'إصلاح الإنتركم',
    name_en: 'Intercom repair',
    short_ar: 'إصلاح الإنتركم الذي لا يعمل أو لا يفتح الباب أو صوته ضعيف.', // review-ar
    short_en: 'Repairing an intercom that’s dead, won’t open the door or has weak sound.',
    has_detail_page: true,
    body_ar: [
      'نصلح الإنتركم الذي لا يعمل، أو لا يفتح الباب، أو صوته أو صورته ضعيفة. يفحص الفني الوحدة الخارجية والداخلية والأسلاك ومحول الكهرباء.', // review-ar
      'إذا كانت القطعة التالفة متوفرة نغيّرها، وإذا كان الإصلاح غير مجدٍ نقترح عليك وحدة جديدة ونؤكد لك السعر عبر واتساب قبل التنفيذ.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We repair intercoms that are dead, won’t open the door, or have weak sound or picture. The technician checks the outdoor and indoor units, the wiring and the power supply.',
      'If the faulty part is available we replace it; if a repair isn’t worth it, we suggest a new unit and confirm the price on WhatsApp before doing anything.',
    ].join('\n\n'),
    includes_ar: [
      'فحص الوحدتين الداخلية والخارجية', // review-ar
      'فحص الأسلاك والمحول', // review-ar
      'إصلاح العطل أو تغيير القطعة التالفة', // review-ar
      'تجربة الصوت والصورة وفتح الباب', // review-ar
    ],
    includes_en: [
      'Checking the indoor and outdoor units',
      'Checking the wiring and power supply',
      'Fixing the fault or replacing the faulty part',
      'Testing sound, picture and door release',
    ],
    excludes_ar: [
      'تغيير النظام كاملًا (خدمة تغيير الإنتركم)', // review-ar
    ],
    excludes_en: ['Replacing the whole system (see Intercom replacement)'],
    parts_ar: [
      'محولات إنتركم', // review-ar
      'وحدات داخلية وخارجية حسب اختيار العميل', // review-ar
      'أقفال كهربائية للأبواب', // review-ar
    ],
    parts_en: ['Intercom power supplies', 'Indoor and outdoor units of the customer’s choice', 'Electric door locks'],
    faq: [
      {
        q_ar: 'الإنتركم يرن لكنه لا يفتح الباب، ما السبب؟', // review-ar
        a_ar: 'غالبًا يكون العطل في القفل الكهربائي أو أسلاكه أو المحول، ويحدده الفني بالفحص.', // review-ar
        q_en: 'The intercom rings but won’t open the door. Why?',
        a_en: 'Usually the electric lock, its wiring or the power supply is at fault. The technician finds out by testing.',
      },
    ],
  },
  {
    slug: 'intercom-replacement',
    name_ar: 'تغيير الإنتركم',
    name_en: 'Intercom replacement',
    short_ar: 'تغيير وحدة الإنتركم الداخلية أو الخارجية بوحدة جديدة.', // review-ar
    short_en: 'Replacing the indoor or outdoor intercom unit with a new one.',
  },
  {
    slug: 'weak-network-check',
    name_ar: 'فحص ضعف الشبكة',
    name_en: 'Weak network check',
    short_ar: 'فحص ضعف الواي فاي أو انقطاعه في أجزاء من البيت ومعرفة السبب.', // review-ar
    short_en: 'Checking weak or dropping Wi-Fi in parts of the home and finding the cause.',
  },
  {
    slug: 'router-extender-setup',
    name_ar: 'تركيب الراوتر ومقويات الشبكة',
    name_en: 'Router & Wi-Fi extender setup',
    short_ar: 'تركيب الراوتر ومقويات الشبكة في الأماكن المناسبة وضبط إعداداتها.', // review-ar
    short_en: 'Setting up the router and Wi-Fi extenders in the right spots and configuring them.',
  },
  {
    slug: 'network-cabling',
    name_ar: 'تمديد كابلات الشبكة',
    name_en: 'Network cabling',
    short_ar: 'تمديد كابلات الشبكة بين الغرف أو إلى الكاميرات والأجهزة بشكل مرتب.', // review-ar
    short_en: 'Running tidy network cables between rooms or to cameras and devices.',
  },
  {
    slug: 'wifi-device-installation',
    name_ar: 'تركيب أجهزة الواي فاي',
    name_en: 'Wi-Fi device installation',
    short_ar: 'تركيب أجهزة واي فاي في السقف أو الجدار لتغطية أفضل في كل البيت.', // review-ar
    short_en: 'Installing ceiling or wall Wi-Fi access points for better coverage across the home.',
  },
  {
    slug: 'tv-system-installation',
    name_ar: 'تركيب أنظمة التلفزيون',
    name_en: 'TV system installation',
    short_ar: 'تركيب أنظمة التلفزيون وتعليق الشاشات وتوصيل الأجهزة.', // review-ar
    short_en: 'TV system setup: wall-mounting screens and connecting devices.',
  },
  {
    slug: 'speaker-system-installation',
    name_ar: 'تركيب أنظمة السماعات',
    name_en: 'Speaker system installation',
    short_ar: 'تركيب أنظمة السماعات في السقف أو الجدار للمجالس والصالات.', // review-ar
    short_en: 'Installing in-ceiling or wall speaker systems for majlis and living rooms.',
  },
  {
    slug: 'pbx-installation',
    name_ar: 'تركيب السنترال',
    name_en: 'Central (PBX) system installation',
    short_ar: 'تركيب السنترال الهاتفي وتوزيع الخطوط الداخلية بين الغرف.', // review-ar
    short_en: 'Installing a PBX phone system and distributing internal lines between rooms.',
  },
  {
    slug: 'special-needs-system',
    name_ar: 'تركيب أنظمة ذوي الاحتياجات الخاصة',
    name_en: 'Special-needs assistance system installation',
    short_ar: 'تركيب أنظمة النداء والمساعدة لذوي الاحتياجات الخاصة وكبار السن داخل البيت.', // review-ar
    short_en: 'Installing call and assistance systems for people with special needs and the elderly at home.',
  },
])
