import { defineServices } from './define'

// Service names are from PROJECT_BRIEF.md §11. All other Arabic text is new and marked `// review-ar`.
export const electricalServices = defineServices('electrical', [
  {
    slug: 'spotlight-installation-replacement',
    name_ar: 'تركيب وتغيير سبوت لايت',
    name_en: 'Spotlight installation & replacement',
    short_ar: 'تركيب سبوت لايت جديد مع قص الجبس أو تغيير القديم، بجميع المقاسات الشائعة من 7 إلى 20 سم تقريبًا.', // review-ar
    short_en: 'New spotlights with gypsum cut-out, or replacing old ones — all common sizes from about 7 to 20 cm.',
    has_detail_page: true,
    wa_extra_lines_ar: 'المقاس: \nالعدد: ', // review-ar
    wa_extra_lines_en: 'Size: \nHow many: ',
    body_ar: [
      'نركّب سبوت لايت جديدًا في أسقف الجبس مع قص الفتحة بالمقاس الصحيح، أو نغيّر السبوتات القديمة والمحروقة بسبوتات ليد جديدة من محلنا.', // review-ar
      'نوفّر جميع المقاسات الشائعة من 7 سم إلى 20 سم تقريبًا، بأحجام صغيرة ووسط وكبيرة، وبألوان إضاءة مختلفة: أبيض ودافئ ومحايد.', // review-ar
      'أرسل لنا المقاس والعدد عبر واتساب، أو صورة للسقف، ونؤكد لك السعر قبل البدء.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We install new spotlights in gypsum ceilings, cutting the opening to the right size, or replace old and burnt-out spotlights with new LED ones from our shop.',
      'We stock all common sizes from about 7 cm to 20 cm — small, medium and large — in different light colours: cool white, warm and neutral.',
      'Send us the size and how many on WhatsApp, or a photo of the ceiling, and we confirm the price before we start.',
    ].join('\n\n'),
    options_ar: [
      'صغير، وسط، وكبير', // review-ar
      'جميع المقاسات الشائعة من 7 سم إلى 20 سم تقريبًا', // review-ar
      'تركيب جديد مع قص الجبس', // review-ar
      'تغيير سبوت قديم بنفس المقاس', // review-ar
    ],
    options_en: [
      'Small, medium and large',
      'All common sizes from about 7 cm to 20 cm',
      'New installation with gypsum cut-out',
      'Replacing an existing spotlight in the same size',
    ],
    includes_ar: [
      'قص فتحات الجبس للتركيب الجديد', // review-ar
      'تركيب السبوت وتوصيله', // review-ar
      'تغيير السبوتات القديمة بنفس المقاس', // review-ar
      'تجربة الإنارة بعد التركيب', // review-ar
    ],
    includes_en: [
      'Cutting gypsum openings for new spotlights',
      'Fitting and wiring the spotlight',
      'Replacing old spotlights in the same size',
      'Testing the lights afterwards',
    ],
    excludes_ar: [
      'تمديد أسلاك جديدة من الطبلون', // review-ar
      'إصلاح الجبس أو دهانه', // review-ar
    ],
    excludes_en: ['Running new cables from the breaker panel', 'Gypsum repairs or painting'],
    parts_ar: [
      'سبوت لايت ليد بمقاسات من 7 إلى 20 سم تقريبًا', // review-ar
      'ألوان إضاءة: أبيض ودافئ ومحايد', // review-ar
      'محولات (درايفر) ووصلات', // review-ar
    ],
    parts_en: [
      'LED spotlights from about 7 to 20 cm',
      'Light colours: cool white, warm and neutral',
      'Drivers and connectors',
    ],
    faq: [
      {
        q_ar: 'ماذا لو كان مقاس الفتحة القديمة مختلفًا؟', // review-ar
        a_ar: 'نوسّع الفتحة إذا كان السبوت الجديد أكبر، أو نركّب سبوتًا بمقاس يناسب الفتحة الحالية. أرسل لنا صورة ونقترح الأنسب.', // review-ar
        q_en: 'What if the old opening is a different size?',
        a_en: 'We widen the opening if the new spotlight is bigger, or fit one that matches the existing opening. Send us a photo and we’ll suggest the best fit.',
      },
      {
        q_ar: 'هل تحضرون السبوتات معكم؟', // review-ar
        a_ar: 'نعم، السبوتات متوفرة في محلنا بمقاسات وألوان مختلفة، ويحضرها الفني معه حسب طلبك.', // review-ar
        q_en: 'Do you bring the spotlights?',
        a_en: 'Yes. Spotlights in many sizes and colours are in stock at our shop, and the technician brings what you ask for.',
      },
    ],
  },
  {
    slug: 'surface-panel-light',
    name_ar: 'تركيب وتغيير بانيل سطحي',
    name_en: 'Surface panel light installation & replacement',
    short_ar: 'تركيب بانيل ليد سطحي دائري أو مربع، من الصغير إلى الكبير، أو تغيير القديم.', // review-ar
    short_en: 'Installing or replacing surface-mounted LED panels — round or square, small to large.',
    has_detail_page: true,
    wa_extra_lines_ar: 'الشكل والمقاس: \nالعدد: ', // review-ar
    wa_extra_lines_en: 'Shape and size: \nHow many: ',
    body_ar: [
      'البانيل السطحي يُركّب على السقف مباشرة دون فتحة في الجبس، ويناسب الغرف والممرات والمطابخ. نركّب البانيل الدائري أو المربع بأحجام من الصغير إلى الكبير.', // review-ar
      'نثبّت البانيل ونوصله ونجرّبه، ويمكننا تغيير البانيل القديم في نفس المكان.', // review-ar
    ].join('\n\n'),
    body_en: [
      'A surface panel mounts straight onto the ceiling with no gypsum cut-out — ideal for rooms, corridors and kitchens. We install round or square panels from small to large.',
      'We fix, wire and test the panel, and can replace an old panel in the same spot.',
    ].join('\n\n'),
    options_ar: [
      'دائري أو مربع', // review-ar
      'من الصغير إلى الكبير', // review-ar
    ],
    options_en: ['Round or square', 'Small to large'],
    includes_ar: [
      'تثبيت البانيل على السقف', // review-ar
      'التوصيل الكهربائي', // review-ar
      'تغيير البانيل القديم', // review-ar
      'تجربة الإنارة', // review-ar
    ],
    includes_en: ['Fixing the panel to the ceiling', 'Electrical connection', 'Replacing the old panel', 'Light test'],
    excludes_ar: [
      'تمديد نقطة إنارة جديدة من مكان بعيد', // review-ar
      'إصلاح الجبس أو دهانه', // review-ar
    ],
    excludes_en: ['A new light point run from far away', 'Gypsum repairs or painting'],
    parts_ar: [
      'بانيل ليد سطحي دائري ومربع', // review-ar
      'ألوان إضاءة مختلفة', // review-ar
      'وصلات وبراغي تثبيت', // review-ar
    ],
    parts_en: ['Round and square surface LED panels', 'Different light colours', 'Connectors and fixings'],
    faq: [
      {
        q_ar: 'ما الفرق بين البانيل السطحي والغاطس؟', // review-ar
        a_ar: 'السطحي يُركّب فوق السقف دون قص، أما الغاطس فيحتاج فتحة في الجبس. إذا كانت عندك فتحة قديمة أخبرنا لنختار المناسب.', // review-ar
        q_en: 'What is the difference between surface and recessed panels?',
        a_en: 'A surface panel mounts on the ceiling without cutting; a recessed one needs a gypsum opening. If you already have an opening, tell us and we’ll pick the right one.',
      },
    ],
  },
  {
    slug: 'light-bulb-change-installation',
    name_ar: 'تغيير وتركيب اللمبات',
    name_en: 'Light bulb change & installation',
    short_ar: 'تغيير وتركيب اللمبات الدائرية والطويلة وجميع أنواع لمبات الليد.', // review-ar
    short_en: 'Changing and installing round, long (tube) and all types of LED bulbs.',
    has_detail_page: true,
    wa_extra_lines_ar: 'نوع اللمبة: \nالعدد: ', // review-ar
    wa_extra_lines_en: 'Bulb type: \nHow many: ',
    body_ar: [
      'نغيّر ونركّب اللمبات الدائرية والطويلة وجميع أنواع لمبات الليد، في الغرف والصالات والممرات والإنارة الخارجية.', // review-ar
      'يحضر الفني اللمبات من محلنا حسب النوع والعدد، ويفحص قاعدة اللمبة والتوصيل إذا كانت اللمبات تحترق بسرعة.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We change and install round, long (tube) and all types of LED bulbs — in rooms, halls, corridors and outdoor lights.',
      'The technician brings the bulbs from our shop by type and quantity, and checks the lamp holder and wiring if bulbs keep burning out.',
    ].join('\n\n'),
    options_ar: [
      'لمبات دائرية', // review-ar
      'لمبات طويلة (أنبوبية)', // review-ar
      'جميع أنواع لمبات الليد', // review-ar
    ],
    options_en: ['Round bulbs', 'Long (tube) bulbs', 'All types of LED bulbs'],
    includes_ar: [
      'تغيير اللمبات وتركيبها', // review-ar
      'فحص قاعدة اللمبة والتوصيل', // review-ar
      'تجربة الإنارة', // review-ar
    ],
    includes_en: ['Changing and fitting the bulbs', 'Checking the lamp holder and wiring', 'Light test'],
    excludes_ar: [
      'تغيير وحدة الإنارة كاملة (خدمة منفصلة)', // review-ar
    ],
    excludes_en: ['Replacing the whole light fitting (separate service)'],
    parts_ar: [
      'لمبات ليد بأنواع وقدرات مختلفة', // review-ar
      'لمبات طويلة وقواعدها', // review-ar
      'قواعد لمبات', // review-ar
    ],
    parts_en: ['LED bulbs in different types and wattages', 'Tube lights and their fittings', 'Lamp holders'],
    faq: [
      {
        q_ar: 'لماذا تحترق اللمبة بسرعة؟', // review-ar
        a_ar: 'قد يكون السبب في قاعدة اللمبة أو في التوصيل أو تذبذب الكهرباء. يفحص الفني ذلك عند التغيير ويخبرك بالسبب.', // review-ar
        q_en: 'Why do my bulbs burn out quickly?',
        a_en: 'It can be the lamp holder, the wiring or voltage fluctuation. The technician checks this while changing the bulb and tells you the cause.',
      },
    ],
  },
  {
    slug: 'socket-installation',
    name_ar: 'تركيب أو تغيير فيش',
    name_en: 'Socket installation / replacement',
    short_ar: 'تركيب فيش جديد أو تغيير الفيش التالف أو المحروق، مع فحص التوصيل والتأريض.', // review-ar
    short_en: 'Installing a new socket or replacing a damaged or burnt one, checking the wiring and earthing.',
    has_detail_page: true,
    wa_extra_lines_ar: 'العدد: ', // review-ar
    wa_extra_lines_en: 'How many: ',
    body_ar: [
      'نركّب فيشًا جديدًا أو نغيّر الفيش التالف أو المحروق أو المرتخي. الفيش المحروق خطر، فلا تتركه دون إصلاح.', // review-ar
      'نفصل الكهرباء عن الخط أولًا، ثم نركّب الفيش الجديد ونفحص التوصيل والتأريض قبل إعادة التشغيل.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We install new sockets or replace damaged, burnt or loose ones. A burnt socket is a hazard — don’t leave it unrepaired.',
      'We isolate the circuit first, fit the new socket, and check the wiring and earthing before switching back on.',
    ].join('\n\n'),
    includes_ar: [
      'فصل الكهرباء عن الخط بأمان', // review-ar
      'تركيب الفيش الجديد أو تغيير التالف', // review-ar
      'فحص التوصيل والتأريض', // review-ar
      'تجربة الفيش بعد التركيب', // review-ar
    ],
    includes_en: [
      'Safely isolating the circuit',
      'Fitting the new socket or replacing the damaged one',
      'Wiring and earthing check',
      'Testing the socket afterwards',
    ],
    excludes_ar: [
      'تمديد خط جديد لمسافة طويلة داخل الجدار', // review-ar
      'إصلاح البلاط أو الدهان حول الفيش', // review-ar
    ],
    excludes_en: ['A new cable run over a long distance inside the wall', 'Tile or paint repairs around the socket'],
    parts_ar: [
      'أفياش مفردة ومزدوجة', // review-ar
      'أفياش بمنافذ USB', // review-ar
      'علب ووصلات', // review-ar
    ],
    parts_en: ['Single and double sockets', 'Sockets with USB ports', 'Back boxes and connectors'],
    faq: [
      {
        q_ar: 'الفيش يسخن أو عليه آثار حرق، هل هذا خطر؟', // review-ar
        a_ar: 'نعم، افصل الأجهزة عنه ولا تستخدمه، وتواصل معنا. خدمة الطوارئ متاحة على مدار الساعة.', // review-ar
        q_en: 'My socket gets hot or has burn marks. Is it dangerous?',
        a_en: 'Yes. Unplug everything, stop using it and contact us. Emergency service is available 24/7.',
      },
    ],
  },
  {
    slug: 'ac-heater-switch',
    name_ar: 'تركيب أو تغيير مفتاح مكيف أو سخان',
    name_en: 'AC or water heater switch installation / replacement',
    short_ar: 'تركيب مفتاح المكيف أو السخان أو تغييره بمفتاح مناسب للحمل العالي.', // review-ar
    short_en: 'Installing or replacing an AC or water heater switch rated for the high load.',
  },
  {
    slug: 'exhaust-fan-installation',
    name_ar: 'تركيب أو تغيير شفاط',
    name_en: 'Exhaust fan installation / replacement',
    short_ar: 'تركيب شفاط للحمام أو المطبخ في الجدار أو السقف، أو تغيير الشفاط المتعطل.', // review-ar
    short_en: 'Installing a bathroom or kitchen exhaust fan in the wall or ceiling, or replacing a faulty one.',
  },
  {
    slug: 'doorbell-replacement',
    name_ar: 'تغيير جرس الباب',
    name_en: 'Doorbell replacement',
    short_ar: 'تغيير جرس الباب السلكي أو اللاسلكي وتشغيله.', // review-ar
    short_en: 'Replacing a wired or wireless doorbell and getting it working.',
  },
  {
    slug: 'main-breaker-replacement',
    name_ar: 'تغيير مفتاح الطبلون الرئيسي',
    name_en: 'Main panel breaker replacement',
    short_ar: 'تغيير المفتاح الرئيسي التالف أو الذي يفصل باستمرار بمفتاح بقدرة مناسبة لحمل البيت.', // review-ar
    short_en: 'Replacing a faulty or constantly tripping main breaker with one rated for your home’s load.',
    has_detail_page: true,
    body_ar: [
      'إذا كان المفتاح الرئيسي في الطبلون يفصل باستمرار أو تالفًا أو يسخن، نغيّره بمفتاح جديد بقدرة مناسبة لحمل البيت.', // review-ar
      'يفحص الفني الأحمال والتوصيلات قبل التغيير، لأن الفصل المتكرر قد يكون سببه حملًا زائدًا أو تماسًا في أحد الخطوط وليس المفتاح وحده.', // review-ar
    ].join('\n\n'),
    body_en: [
      'If the main breaker in your panel keeps tripping, is damaged or runs hot, we replace it with a new breaker rated for your home’s load.',
      'The technician checks the loads and connections first, because repeated tripping can come from an overload or a short on one of the circuits — not only the breaker.',
    ].join('\n\n'),
    includes_ar: [
      'فحص سبب الفصل والأحمال', // review-ar
      'فصل الكهرباء بأمان', // review-ar
      'تغيير المفتاح الرئيسي بقدرة مناسبة', // review-ar
      'شدّ التوصيلات وتجربة التشغيل', // review-ar
    ],
    includes_en: [
      'Checking why it trips and the loads',
      'Safely isolating the power',
      'Replacing the main breaker with the right rating',
      'Tightening connections and testing',
    ],
    excludes_ar: [
      'أعمال العداد وكيبل شركة الكهرباء', // review-ar
      'تغيير الطبلون كاملًا (خدمة منفصلة)', // review-ar
    ],
    excludes_en: ['Meter and utility cable work', 'Replacing the whole panel (separate service)'],
    parts_ar: [
      'مفاتيح رئيسية بقدرات مختلفة', // review-ar
      'مفاتيح فرعية', // review-ar
      'أطراف توصيل ومثبّتات', // review-ar
    ],
    parts_en: ['Main breakers in different ratings', 'Sub-circuit breakers', 'Terminals and fixings'],
    faq: [
      {
        q_ar: 'من المسؤول عن العداد؟', // review-ar
        a_ar: 'العداد والكيبل الواصل إليه من مسؤولية شركة الكهرباء. نحن نعمل داخل البيت من الطبلون وما بعده.', // review-ar
        q_en: 'Who is responsible for the meter?',
        a_en: 'The meter and its supply cable belong to the electricity company. We work inside the home, from the panel onwards.',
      },
    ],
  },
  {
    slug: 'sub-breaker-replacement',
    name_ar: 'تغيير مفتاح طبلون فرعي',
    name_en: 'Sub-panel breaker replacement',
    short_ar: 'تغيير مفتاح في الطبلون الفرعي يفصل باستمرار أو لا يعمل.', // review-ar
    short_en: 'Replacing a sub-panel breaker that keeps tripping or doesn’t work.',
  },
  {
    slug: 'outdoor-wall-light-replacement',
    name_ar: 'تغيير إنارة الجدران والأسطح الخارجية',
    name_en: 'Outdoor wall & surface light replacement',
    short_ar: 'تغيير إنارة الجدران والأسطح الخارجية بإنارة جديدة مناسبة للأماكن المكشوفة.', // review-ar
    short_en: 'Replacing outdoor wall and roof lights with fittings made for outdoor use.',
  },
  {
    slug: 'hidden-led-strip',
    name_ar: 'تركيب شريط ليد مخفي (بالمتر)',
    name_en: 'Hidden LED strip installation (per meter)',
    short_ar: 'تركيب شريط ليد مخفي في تجاويف الجبس أو تحت الخزائن، ويُحسب بالمتر.', // review-ar
    short_en: 'Installing hidden LED strip in gypsum coves or under cabinets, charged per meter.',
    wa_extra_lines_ar: 'الطول التقريبي بالمتر: ', // review-ar
    wa_extra_lines_en: 'Approximate length (m): ',
  },
  {
    slug: 'small-chandelier-installation',
    name_ar: 'تركيب ثريا صغيرة',
    name_en: 'Small chandelier installation',
    short_ar: 'تعليق ثريا صغيرة وتوصيلها وتثبيتها بأمان.', // review-ar
    short_en: 'Hanging, wiring and securing a small chandelier.',
  },
  {
    slug: 'large-chandelier-installation',
    name_ar: 'تركيب ثريا كبيرة',
    name_en: 'Large chandelier installation',
    short_ar: 'تركيب الثريات الكبيرة والثقيلة في الصالات والمجالس بتثبيت قوي وآمن.', // review-ar
    short_en: 'Installing large, heavy chandeliers in halls and majlis rooms with strong, safe fixing.',
  },
  {
    slug: 'street-pole-light-installation',
    name_ar: 'تركيب إنارة شوارع وأعمدة',
    name_en: 'Street & pole light installation',
    short_ar: 'تركيب إنارة شوارع على الجدار أو على عمود صغير، بجميع القدرات.', // review-ar
    short_en: 'Installing street lights on a wall or a small pole, in all wattages.',
  },
  {
    slug: 'wall-flood-light',
    name_ar: 'تركيب كشاف جداري',
    name_en: 'Wall flood light installation',
    short_ar: 'تركيب كشاف جداري لإنارة الحوش أو المدخل أو المواقف.', // review-ar
    short_en: 'Installing a wall flood light for the yard, entrance or parking.',
  },
  {
    slug: 'washer-dryer-power-point',
    name_ar: 'تمديد كهرباء غسالة أو نشافة',
    name_en: 'Washer / dryer power point',
    short_ar: 'تمديد نقطة كهرباء مخصصة للغسالة أو النشافة بمفتاح وفيش مناسبين.', // review-ar
    short_en: 'Running a dedicated power point for a washer or dryer with the right switch and socket.',
  },
  {
    slug: 'electrical-panel-inspection',
    name_ar: 'فحص الطبلون الكهربائي',
    name_en: 'Electrical panel inspection & fault finding',
    short_ar: 'فحص الطبلون ومعرفة سبب الفصل أو انقطاع الكهرباء عن جزء من البيت، ثم إصلاحه.', // review-ar
    short_en: 'Inspecting the panel to find why power trips or part of the house is dead, then fixing it.',
    has_detail_page: true,
    body_ar: [
      'إذا انقطعت الكهرباء عن جزء من البيت، أو صار مفتاح يفصل دون سبب واضح، أو لاحظت رائحة احتراق، نفحص الطبلون والخطوط لنعرف السبب.', // review-ar
      'يستخدم الفني أجهزة القياس لتحديد الخط المعطل، ثم يخبرك بالسبب والحل والسعر عبر واتساب قبل أي إصلاح.', // review-ar
      'رائحة الاحتراق أو الشرر حالة طارئة: افصل المفتاح الرئيسي واتصل بنا مباشرة.', // review-ar
    ].join('\n\n'),
    body_en: [
      'If part of the house has lost power, a breaker trips for no clear reason, or you notice a burning smell, we inspect the panel and circuits to find the cause.',
      'The technician uses test equipment to pinpoint the faulty circuit, then tells you the cause, the fix and the price on WhatsApp before any repair.',
      'A burning smell or sparks is an emergency: switch off the main breaker and call us straight away.',
    ].join('\n\n'),
    includes_ar: [
      'فحص الطبلون والمفاتيح', // review-ar
      'قياس الخطوط لتحديد مكان العطل', // review-ar
      'شدّ التوصيلات المرتخية', // review-ar
      'شرح مختصر للسبب والحل', // review-ar
    ],
    includes_en: [
      'Inspecting the panel and breakers',
      'Testing circuits to locate the fault',
      'Tightening loose connections',
      'A short explanation of the cause and the fix',
    ],
    excludes_ar: [
      'قطع الغيار والإصلاحات الكبيرة (نؤكدها معك قبل التنفيذ)', // review-ar
    ],
    excludes_en: ['Parts and major repairs (confirmed with you before we do them)'],
    parts_ar: [
      'مفاتيح طبلون بقدرات مختلفة', // review-ar
      'قواطع حماية من التسرب الأرضي', // review-ar
      'أطراف ووصلات', // review-ar
    ],
    parts_en: ['Breakers in different ratings', 'Earth-leakage (RCD) breakers', 'Terminals and connectors'],
    faq: [
      {
        q_ar: 'لماذا يفصل المفتاح باستمرار؟', // review-ar
        a_ar: 'الأسباب الشائعة: حمل زائد على الخط، أو جهاز فيه تماس، أو رطوبة في فيش، أو مفتاح ضعيف. الفحص يحدد السبب بدقة.', // review-ar
        q_en: 'Why does a breaker keep tripping?',
        a_en: 'Common causes are an overloaded circuit, a faulty appliance, moisture in a socket or a weak breaker. An inspection pinpoints the exact cause.',
      },
    ],
  },
  {
    slug: 'indoor-panel-installation',
    name_ar: 'تركيب طبلون كهرباء داخلي',
    name_en: 'Indoor electrical panel installation',
    short_ar: 'تركيب طبلون كهرباء داخلي جديد وترتيب المفاتيح وتسميتها.', // review-ar
    short_en: 'Installing a new indoor distribution board with neatly arranged, labelled breakers.',
  },
])
