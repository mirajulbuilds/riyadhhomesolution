import { defineServices } from './define'

// Service names are from PROJECT_BRIEF.md §11. All other Arabic text is new and marked `// review-ar`.
export const plumbingServices = defineServices('plumbing', [
  {
    slug: 'new-water-heater-installation',
    name_ar: 'تركيب سخان جديد',
    name_en: 'New water heater installation',
    short_ar: 'تركيب سخان كهربائي جديد على الجدار وتوصيله بالماء والكهرباء، مع تجربة التشغيل.', // review-ar
    short_en: 'Wall-mounting a new electric water heater and connecting it to water and power, then testing it.',
    has_detail_page: true,
    body_ar: [
      'نركّب لك سخانًا كهربائيًا جديدًا على الجدار، ونوصله بمواسير الماء البارد والحار وبالكهرباء بشكل آمن. يحضر الفني السخان والوصلات من محلنا إن رغبت، أو يركّب السخان الذي اشتريته.', // review-ar
      'قبل التركيب نتأكد من قوة الجدار ومكان المفتاح والتمديدات الموجودة، وبعد التركيب نملأ السخان ونشغّله ونفحص التسريب.', // review-ar
      'أرسل لنا سعة السخان المطلوبة ومكان التركيب عبر واتساب، ونؤكد لك السعر قبل البدء.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We wall-mount a new electric water heater and connect it safely to the cold and hot water lines and to power. The technician can bring the heater and fittings from our shop, or install one you have already bought.',
      'Before installing we check the wall, the switch position and the existing pipework; afterwards we fill the heater, switch it on and check for leaks.',
      'Send us the heater size you want and where it goes on WhatsApp, and we confirm the price before we start.',
    ].join('\n\n'),
    includes_ar: [
      'تثبيت السخان على الجدار بحوامل مناسبة', // review-ar
      'توصيل الماء البارد والحار', // review-ar
      'تركيب محبس وصمام أمان عند الحاجة', // review-ar
      'التوصيل بالكهرباء وتجربة التشغيل', // review-ar
      'فحص التسريب بعد التعبئة', // review-ar
    ],
    includes_en: [
      'Fixing the heater to the wall on suitable brackets',
      'Cold and hot water connections',
      'Isolation valve and safety valve where needed',
      'Power connection and test run',
      'Leak check after filling',
    ],
    excludes_ar: [
      'تمديدات مياه جديدة لمسافات طويلة', // review-ar
      'تمديد خط كهرباء جديد من الطبلون', // review-ar
      'أعمال الجبس والبلاط والدهان', // review-ar
    ],
    excludes_en: [
      'New water pipe runs over long distances',
      'A new power line from the breaker panel',
      'Gypsum, tiling or painting work',
    ],
    parts_ar: [
      'سخانات كهربائية بسعات مختلفة', // review-ar
      'وصلات ولّيات مرنة', // review-ar
      'محابس وصمامات أمان', // review-ar
      'حوامل وبراغي تثبيت', // review-ar
    ],
    parts_en: [
      'Electric water heaters in different sizes',
      'Fittings and flexible hoses',
      'Valves and safety valves',
      'Brackets and fixings',
    ],
    faq: [
      {
        q_ar: 'هل يمكن أن أشتري السخان بنفسي؟', // review-ar
        a_ar: 'نعم، يركّبه الفني لك، أو يمكنك اختيار سخان من محلنا ويحضره الفني معه.', // review-ar
        q_en: 'Can I buy the heater myself?',
        a_en: 'Yes, the technician will install it for you — or choose one from our shop and the technician brings it along.',
      },
      {
        q_ar: 'كم يستغرق تركيب السخان؟', // review-ar
        a_ar: 'غالبًا من ساعة إلى ساعتين، حسب المكان والتمديدات الموجودة.', // review-ar
        q_en: 'How long does installation take?',
        a_en: 'Usually one to two hours, depending on the location and the existing pipework.',
      },
    ],
  },
  {
    slug: 'new-concealed-water-heater-installation',
    name_ar: 'تركيب سخان مخفي جديد',
    name_en: 'New concealed water heater installation',
    short_ar: 'تركيب سخان مخفي جديد فوق السقف المستعار أو داخل فتحة الصيانة، مع التوصيل والتجربة.', // review-ar
    short_en: 'Installing a new concealed heater above the false ceiling or in the access hatch, connected and tested.',
    has_detail_page: true,
    body_ar: [
      'السخان المخفي يُركّب فوق السقف المستعار (الجبس) أو داخل فتحة صيانة، فيبقى الحمام مرتبًا دون سخان ظاهر. نركّبه ونوصله بالماء والكهرباء ونجرّبه قبل إغلاق الفتحة.', // review-ar
      'نتأكد من وجود فتحة صيانة مناسبة يسهل الوصول منها إلى السخان لاحقًا، ومن تثبيته على قاعدة أو حوامل قوية.', // review-ar
      'أرسل لنا صورة للسقف أو فتحة الصيانة عبر واتساب، ونؤكد لك السعر قبل البدء.', // review-ar
    ].join('\n\n'),
    body_en: [
      'A concealed heater sits above the false (gypsum) ceiling or inside an access hatch, so the bathroom stays tidy with no visible heater. We install it, connect water and power, and test it before closing the hatch.',
      'We make sure there is a suitable access hatch so the heater can be reached later, and that it rests on a solid base or strong brackets.',
      'Send us a photo of the ceiling or access hatch on WhatsApp, and we confirm the price before we start.',
    ].join('\n\n'),
    includes_ar: [
      'تثبيت السخان فوق السقف على قاعدة أو حوامل', // review-ar
      'توصيل الماء البارد والحار', // review-ar
      'التوصيل بالكهرباء وتجربة التشغيل', // review-ar
      'فحص التسريب قبل إغلاق الفتحة', // review-ar
    ],
    includes_en: [
      'Fixing the heater above the ceiling on a base or brackets',
      'Cold and hot water connections',
      'Power connection and test run',
      'Leak check before the hatch is closed',
    ],
    excludes_ar: [
      'عمل فتحة جديدة في الجبس أو إصلاحه', // review-ar
      'تمديد خط كهرباء جديد من الطبلون', // review-ar
    ],
    excludes_en: ['Cutting a new gypsum opening or repairing gypsum', 'A new power line from the breaker panel'],
    parts_ar: [
      'سخانات مخفية بسعات مختلفة', // review-ar
      'وصلات ولّيات مرنة', // review-ar
      'محابس وصمامات أمان', // review-ar
    ],
    parts_en: ['Concealed heaters in different sizes', 'Fittings and flexible hoses', 'Valves and safety valves'],
    faq: [
      {
        q_ar: 'هل أحتاج فتحة في السقف؟', // review-ar
        a_ar: 'نعم، يحتاج السخان المخفي فتحة صيانة للوصول إليه. إن لم تكن موجودة، أخبرنا عبر واتساب لنرتب ذلك معك.', // review-ar
        q_en: 'Do I need an opening in the ceiling?',
        a_en: 'Yes, a concealed heater needs an access hatch. If you don’t have one, tell us on WhatsApp and we’ll arrange it with you.',
      },
    ],
  },
  {
    slug: 'water-heater-replacement',
    name_ar: 'فك وتركيب سخان',
    name_en: 'Water heater replacement',
    short_ar: 'فك السخان القديم وتركيب سخان جديد مكانه، مع تغيير الوصلات التالفة عند الحاجة.', // review-ar
    short_en: 'Removing your old water heater and fitting a new one in its place, replacing worn fittings if needed.',
    has_detail_page: true,
    body_ar: [
      'إذا تعطّل سخانك أو صار يسرّب، نفك السخان القديم ونركّب الجديد مكانه، ونغيّر الوصلات والمحابس التالفة عند الحاجة.', // review-ar
      'يحضر الفني السخان الجديد من محلنا إن رغبت، ويجرّب التشغيل ويفحص التسريب قبل أن يغادر.', // review-ar
      'أرسل لنا سعة السخان الحالي وصورة له عبر واتساب، ونؤكد لك السعر قبل البدء.', // review-ar
    ].join('\n\n'),
    body_en: [
      'If your heater has failed or is leaking, we remove it, fit the new one in the same place, and replace worn fittings and valves where needed.',
      'The technician can bring the new heater from our shop, and tests it and checks for leaks before leaving.',
      'Send us the size of your current heater and a photo of it on WhatsApp, and we confirm the price before we start.',
    ].join('\n\n'),
    includes_ar: [
      'تفريغ السخان القديم وفكه', // review-ar
      'تركيب السخان الجديد في نفس المكان', // review-ar
      'تغيير الوصلات التالفة عند الحاجة', // review-ar
      'تجربة التشغيل وفحص التسريب', // review-ar
    ],
    includes_en: [
      'Draining and removing the old heater',
      'Installing the new heater in the same place',
      'Replacing worn fittings if needed',
      'Test run and leak check',
    ],
    excludes_ar: [
      'نقل السخان إلى مكان مختلف يحتاج تمديدات جديدة', // review-ar
      'إصلاح الجدار أو البلاط حول السخان', // review-ar
    ],
    excludes_en: ['Moving the heater somewhere that needs new pipework', 'Repairing the wall or tiles around the heater'],
    parts_ar: [
      'سخانات كهربائية بسعات مختلفة', // review-ar
      'وصلات ولّيات مرنة', // review-ar
      'محابس وصمامات أمان', // review-ar
    ],
    parts_en: ['Electric water heaters in different sizes', 'Fittings and flexible hoses', 'Valves and safety valves'],
    faq: [
      {
        q_ar: 'هل يمكن إصلاح السخان بدل تغييره؟', // review-ar
        a_ar: 'في كثير من الحالات نعم، مثل تغيير الثرموستات أو قلب السخان. أرسل لنا وصف المشكلة ونخبرك بالخيار الأنسب.', // review-ar
        q_en: 'Can the heater be repaired instead of replaced?',
        a_en: 'Often, yes — for example by replacing the thermostat or the heating element. Describe the problem to us and we’ll tell you the best option.',
      },
    ],
  },
  {
    slug: 'concealed-water-heater-replacement',
    name_ar: 'فك وتركيب سخان مخفي',
    name_en: 'Concealed water heater replacement',
    short_ar: 'فك السخان المخفي القديم من فتحة السقف وتركيب سخان جديد وتوصيله.', // review-ar
    short_en: 'Taking out the old concealed heater through the ceiling hatch and fitting a new one.',
  },
  {
    slug: 'water-heater-thermostat-replacement',
    name_ar: 'تغيير ثرموستات (رداد) السخان',
    name_en: 'Water heater thermostat replacement',
    short_ar: 'تغيير ثرموستات السخان عندما لا يسخن الماء أو يسخن أكثر من اللازم.', // review-ar
    short_en: 'Replacing the heater thermostat when the water won’t heat up or gets too hot.',
  },
  {
    slug: 'water-heater-element-replacement',
    name_ar: 'تغيير قلب (سخّان) السخان',
    name_en: 'Water heater element replacement',
    short_ar: 'تغيير قلب السخان المحترق أو المتكلّس بقطعة جديدة من محلنا.', // review-ar
    short_en: 'Replacing a burnt-out or scaled heating element with a new one from our shop.',
  },
  {
    slug: 'mixer-tap-replacement',
    name_ar: 'تغيير خلاط',
    name_en: 'Mixer tap replacement',
    short_ar: 'فك الخلاط القديم وتركيب خلاط جديد للمغسلة أو المطبخ أو الدش، مع فحص التسريب.', // review-ar
    short_en: 'Removing the old mixer and fitting a new one for the basin, kitchen or shower, checked for leaks.',
    has_detail_page: true,
    body_ar: [
      'نغيّر خلاط المغسلة أو المطبخ أو الدش، سواء كان الخلاط القديم يسرّب أو تريد شكلًا جديدًا. يحضر الفني الخلاط من محلنا إن رغبت، أو يركّب الخلاط الذي اخترته.', // review-ar
      'نفك الخلاط القديم وننظف مكان التركيب، ثم نركّب الجديد مع اللّيات المناسبة ونفحص التسريب وضغط الماء.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We replace basin, kitchen and shower mixers — whether the old one leaks or you simply want a new look. The technician can bring the mixer from our shop, or fit the one you chose.',
      'We remove the old mixer, clean the mounting point, fit the new one with the right hoses, and check for leaks and water pressure.',
    ].join('\n\n'),
    includes_ar: [
      'فك الخلاط القديم', // review-ar
      'تركيب الخلاط الجديد واللّيات', // review-ar
      'تغيير محابس الزاوية عند الحاجة', // review-ar
      'فحص التسريب وضغط الماء', // review-ar
    ],
    includes_en: [
      'Removing the old mixer',
      'Fitting the new mixer and hoses',
      'Replacing angle valves if needed',
      'Leak and water pressure check',
    ],
    excludes_ar: [
      'تعديل التمديدات داخل الجدار', // review-ar
      'تغيير المغسلة أو الحوض نفسه', // review-ar
    ],
    excludes_en: ['Changing pipework inside the wall', 'Replacing the basin or sink itself'],
    options_ar: [
      'خلاط مغسلة', // review-ar
      'خلاط مطبخ', // review-ar
      'خلاط دش أو بانيو', // review-ar
    ],
    options_en: ['Basin mixer', 'Kitchen mixer', 'Shower or bath mixer'],
    parts_ar: [
      'خلاطات مغاسل ومطابخ ودشات', // review-ar
      'لّيات مرنة بأطوال مختلفة', // review-ar
      'محابس زاوية', // review-ar
    ],
    parts_en: ['Basin, kitchen and shower mixers', 'Flexible hoses in different lengths', 'Angle valves'],
    faq: [
      {
        q_ar: 'هل تحتاجون إلى تكسير الجدار لتغيير خلاط الدش؟', // review-ar
        a_ar: 'في الغالب لا، إذا كان الخلاط الجديد من نفس نوع القديم ومقاساته. أرسل لنا صورة للخلاط الحالي ونخبرك.', // review-ar
        q_en: 'Do you need to break the wall to change a shower mixer?',
        a_en: 'Usually not, as long as the new mixer is the same type and size as the old one. Send us a photo of your current mixer and we’ll let you know.',
      },
    ],
  },
  {
    slug: 'bidet-sprayer-replacement',
    name_ar: 'تغيير شطاف',
    name_en: 'Bidet sprayer replacement',
    short_ar: 'تغيير الشطاف مع اللّي والمحبس عند الحاجة، وتثبيته بإحكام دون تسريب.', // review-ar
    short_en: 'Replacing the bidet sprayer, with a new hose and valve if needed, fitted leak-free.',
  },
  {
    slug: 'shower-head-replacement',
    name_ar: 'تغيير سماعة دش',
    name_en: 'Shower head replacement',
    short_ar: 'تغيير سماعة الدش اليدوية أو الدش المطري وتثبيتها بإحكام.', // review-ar
    short_en: 'Replacing a hand shower or rain shower head and fitting it securely.',
  },
  {
    slug: 'angle-valve-hose-replacement',
    name_ar: 'تغيير محبس زاوية مع لي',
    name_en: 'Angle valve & hose replacement',
    short_ar: 'تغيير محبس الزاوية واللّي تحت المغسلة أو خلف المرحاض لإيقاف التسريب.', // review-ar
    short_en: 'Replacing the angle valve and flexible hose under the basin or behind the toilet to stop leaks.',
  },
  {
    slug: 'basin-waste-replacement',
    name_ar: 'تغيير هراب مغسلة (عادي أو كوري)',
    name_en: 'Basin waste replacement (standard or Korean)',
    short_ar: 'تغيير هراب المغسلة العادي أو الكوري، مع السيفون عند الحاجة.', // review-ar
    short_en: 'Replacing a standard or Korean (pop-up) basin waste, with the trap if needed.',
  },
  {
    slug: 'sink-basin-blockage-clearing',
    name_ar: 'تسليك انسداد الحوض والمغسلة',
    name_en: 'Sink & basin blockage clearing',
    short_ar: 'تسليك انسداد المغسلة أو حوض المطبخ بالأدوات المناسبة دون تكسير.', // review-ar
    short_en: 'Clearing blocked basins and kitchen sinks with the right tools, without breaking anything.',
    has_detail_page: true,
    body_ar: [
      'نسلّك انسداد المغسلة وحوض المطبخ الناتج عن الدهون أو الشعر أو بقايا الطعام، باستخدام أدوات التسليك المناسبة دون تكسير.', // review-ar
      'نفك السيفون وننظفه إذا لزم، ثم نختبر سرعة تصريف الماء قبل أن نغادر.', // review-ar
      'وإذا تكرر الانسداد، نفحص خط الصرف ونخبرك بالسبب والحل.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We clear basin and kitchen sink blockages caused by grease, hair or food waste, using the right drain tools — no breaking.',
      'We take the trap apart and clean it if needed, then test how fast the water drains before we leave.',
      'If the blockage keeps coming back, we check the drain line and tell you the cause and the fix.',
    ].join('\n\n'),
    includes_ar: [
      'فك السيفون وتنظيفه', // review-ar
      'تسليك الخط بالأدوات المناسبة', // review-ar
      'اختبار التصريف بعد التسليك', // review-ar
    ],
    includes_en: ['Removing and cleaning the trap', 'Clearing the line with the right tools', 'Drain test afterwards'],
    excludes_ar: [
      'تكسير البلاط أو الجدار لتغيير المواسير', // review-ar
      'تسليك خطوط الصرف الرئيسية (خدمة تسليك الصرف)', // review-ar
    ],
    excludes_en: [
      'Breaking tiles or walls to replace pipes',
      'Main drain lines (see Drain blockage clearing)',
    ],
    parts_ar: [
      'سيفونات وهرابات مغاسل', // review-ar
      'جلب وحلقات إحكام', // review-ar
    ],
    parts_en: ['Traps and basin wastes', 'Washers and seals'],
    faq: [
      {
        q_ar: 'هل تستخدمون مواد كيميائية؟', // review-ar
        a_ar: 'نعتمد أولًا على الأدوات الميكانيكية لأنها أكثر أمانًا للمواسير، ولا نستخدم مواد قوية إلا عند الحاجة وبعد إخبارك.', // review-ar
        q_en: 'Do you use chemicals?',
        a_en: 'We use mechanical tools first because they are safer for your pipes, and only use strong products when needed and after telling you.',
      },
    ],
  },
  {
    slug: 'drain-blockage-clearing',
    name_ar: 'تسليك انسداد الصرف',
    name_en: 'Drain blockage clearing',
    short_ar: 'تسليك انسداد صرف الحمامات والمطابخ والصفايات الأرضية وخطوط الصرف.', // review-ar
    short_en: 'Clearing blocked bathroom, kitchen, floor and main drain lines.',
    has_detail_page: true,
    body_ar: [
      'نسلّك انسداد صرف الحمامات والمطابخ والصفايات الأرضية، والخطوط بين الغرف وحتى غرفة التفتيش، باستخدام أدوات ومكائن التسليك.', // review-ar
      'نحدد مكان الانسداد أولًا، ثم نسلّكه ونختبر التصريف بالماء. وإذا وجدنا كسرًا أو ميولًا غير صحيحة في الخط نخبرك قبل أي عمل إضافي.', // review-ar
      'في حالات الطفح أو الروائح القوية اتصل بنا مباشرة، فخدمة الطوارئ متاحة على مدار الساعة.', // review-ar
    ].join('\n\n'),
    body_en: [
      'We clear blocked bathroom, kitchen and floor drains, and the lines between rooms up to the inspection chamber, using drain rods and machines.',
      'We find the blockage first, clear it and test the flow with water. If we find a broken pipe or a wrong fall in the line, we tell you before any extra work.',
      'For overflowing drains or strong smells, call us straight away — emergency service is available 24/7.',
    ].join('\n\n'),
    includes_ar: [
      'تحديد مكان الانسداد', // review-ar
      'التسليك بالأدوات أو مكينة التسليك', // review-ar
      'تنظيف الصفاية وغرفة التفتيش القريبة', // review-ar
      'اختبار التصريف بعد الانتهاء', // review-ar
    ],
    includes_en: [
      'Locating the blockage',
      'Clearing with rods or a drain machine',
      'Cleaning the floor drain and nearby inspection chamber',
      'Flow test when finished',
    ],
    excludes_ar: [
      'شفط البيارة (يحتاج صهريجًا)', // review-ar
      'تكسير مواسير الصرف وتغييرها', // review-ar
    ],
    excludes_en: ['Septic tank pumping (needs a tanker)', 'Breaking out and replacing drain pipes'],
    parts_ar: [
      'صفايات أرضية وأغطيتها', // review-ar
      'سيفونات ووصلات صرف', // review-ar
    ],
    parts_en: ['Floor drains and covers', 'Traps and drain fittings'],
    faq: [
      {
        q_ar: 'هل يعود الانسداد مرة أخرى؟', // review-ar
        a_ar: 'إذا كان السبب دهونًا أو أوساخًا فالتسليك يحلّه. وإذا كان السبب في ميول الخط أو كسر فيه، نخبرك بالحل المناسب قبل أي عمل.', // review-ar
        q_en: 'Will the blockage come back?',
        a_en: 'If it was caused by grease or debris, clearing it solves the problem. If the line has a wrong fall or a break, we explain the right fix before doing anything.',
      },
    ],
  },
  {
    slug: 'tank-float-valve-replacement',
    name_ar: 'تغيير عوامة الخزان',
    name_en: 'Tank float valve replacement',
    short_ar: 'تغيير عوامة الخزان العلوي أو الأرضي عندما يفيض الماء أو لا يمتلئ الخزان.', // review-ar
    short_en: 'Replacing the float valve in a roof or ground tank that overflows or won’t fill.',
  },
  {
    slug: 'water-pump-installation',
    name_ar: 'فك أو تركيب دينمو (مضخة)',
    name_en: 'Water pump install / removal',
    short_ar: 'تركيب مضخة الماء (الدينمو) أو فكها، وتوصيلها بالخزان والمواسير وضبط تشغيلها.', // review-ar
    short_en: 'Installing or removing a water pump, connecting it to the tank and pipes and setting it up.',
  },
  {
    slug: 'submersible-pump-installation',
    name_ar: 'فك أو تركيب غطاس',
    name_en: 'Submersible pump install / removal',
    short_ar: 'تركيب الغطاس في الخزان الأرضي أو فكه، مع توصيل خط الضخ والكهرباء.', // review-ar
    short_en: 'Installing or removing a submersible pump in the ground tank, with the delivery line and power.',
  },
  {
    slug: 'toilet-seat-cover-replacement',
    name_ar: 'تغيير غطاء كرسي إفرنجي',
    name_en: 'Toilet seat cover replacement',
    short_ar: 'تغيير غطاء الكرسي الإفرنجي بغطاء جديد عادي أو هادئ الإغلاق.', // review-ar
    short_en: 'Replacing the toilet seat with a new standard or soft-close seat.',
  },
  {
    slug: 'western-toilet-installation',
    name_ar: 'فك وتركيب كرسي إفرنجي',
    name_en: 'Western toilet installation / replacement',
    short_ar: 'فك الكرسي الإفرنجي القديم وتركيب كرسي جديد، مع إحكام توصيله بالصرف والماء.', // review-ar
    short_en: 'Removing the old western toilet and installing a new one, sealed to the drain and water supply.',
  },
  {
    slug: 'squat-toilet-installation',
    name_ar: 'فك أو تركيب كرسي عربي',
    name_en: 'Squat toilet installation / removal',
    short_ar: 'فك الكرسي العربي أو تركيبه في أرضية الحمام وتوصيله بالصرف.', // review-ar
    short_en: 'Removing or installing a squat toilet in the bathroom floor, connected to the drain.',
  },
  {
    slug: 'squat-toilet-cistern-installation',
    name_ar: 'تركيب أو تغيير سيفون عربي',
    name_en: 'Squat toilet cistern installation / replacement',
    short_ar: 'تركيب سيفون الكرسي العربي أو تغييره، مع ضبط العوامة والطرد.', // review-ar
    short_en: 'Installing or replacing a squat toilet cistern and adjusting the float and flush.',
  },
  {
    slug: 'basin-installation',
    name_ar: 'تركيب مغسلة',
    name_en: 'Basin installation',
    short_ar: 'تركيب مغسلة جديدة معلّقة أو بعمود، مع الخلاط والهراب والتوصيلات.', // review-ar
    short_en: 'Installing a new wall-hung or pedestal basin with the tap, waste and connections.',
  },
  {
    slug: 'vanity-basin-installation',
    name_ar: 'تركيب مغسلة دولاب',
    name_en: 'Vanity basin installation',
    short_ar: 'تركيب مغسلة دولاب وتثبيتها وتوصيل الماء والصرف.', // review-ar
    short_en: 'Installing a vanity basin, fixing it in place and connecting water and drain.',
  },
  {
    slug: 'double-vanity-installation',
    name_ar: 'تركيب مغسلة دولاب مزدوجة',
    name_en: 'Double vanity installation',
    short_ar: 'تركيب مغسلة دولاب مزدوجة بحوضين، مع ضبط المستوى وتوصيل الخلاطين.', // review-ar
    short_en: 'Installing a double vanity with two basins, levelled and with both taps connected.',
  },
  {
    slug: 'shower-set-installation',
    name_ar: 'تركيب مروش مع خلاط',
    name_en: 'Shower set with mixer installation',
    short_ar: 'تركيب مروش (عمود دش) مع الخلاط على الجدار وفحص التسريب.', // review-ar
    short_en: 'Mounting a shower column with mixer on the wall and checking for leaks.',
  },
  {
    slug: 'shower-cabin-installation',
    name_ar: 'تركيب كابينة استحمام',
    name_en: 'Shower cabin installation',
    short_ar: 'تركيب كابينة استحمام وتثبيتها وعزل أطرافها ضد التسريب.', // review-ar
    short_en: 'Assembling and fixing a shower cabin, sealed against leaks.',
  },
  {
    slug: 'floor-drain-installation',
    name_ar: 'تركيب صفاية أرضية',
    name_en: 'Floor drain installation',
    short_ar: 'تركيب صفاية أرضية جديدة بالمستوى الصحيح وتوصيلها بخط الصرف.', // review-ar
    short_en: 'Fitting a new floor drain at the right level and connecting it to the drain line.',
  },
  {
    slug: 'washing-machine-connection',
    name_ar: 'تركيب وتمديد غسالة',
    name_en: 'Washing machine connection & extension',
    short_ar: 'توصيل الغسالة بالماء والصرف، مع تمديد خط جديد إذا كان المكان بعيدًا.', // review-ar
    short_en: 'Connecting a washing machine to water and drain, extending the lines if needed.',
  },
])
