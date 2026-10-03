import { defineServices } from './define'

// Service names are from PROJECT_BRIEF.md §11. All other Arabic text is new and marked `// review-ar`.
export const paintingServices = defineServices('painting', [
  {
    slug: 'interior-painting',
    name_ar: 'دهانات داخلية',
    name_en: 'Interior painting',
    short_ar: 'دهان الجدران والأسقف الداخلية للغرف والصالات بعد تجهيزها ومعالجة الشقوق البسيطة.', // review-ar
    short_en: 'Painting interior walls and ceilings after preparing them and filling minor cracks.',
    parts_in_stock: false,
  },
  {
    slug: 'exterior-painting',
    name_ar: 'دهانات خارجية',
    name_en: 'Exterior painting',
    short_ar: 'دهان الواجهات الخارجية والأسوار بدهانات مناسبة للشمس والغبار.', // review-ar
    short_en: 'Painting exterior facades and boundary walls with paint suited to sun and dust.',
    parts_in_stock: false,
  },
])

// Tiles: no sizes mentioned anywhere (brief §11).
export const tilesServices = defineServices('tiles', [
  {
    slug: 'new-floor-tiles',
    name_ar: 'تركيب بلاط أرضيات جديد',
    name_en: 'New floor tile installation',
    short_ar: 'تركيب بلاط أرضيات جديد بالمستوى الصحيح مع الترويب.', // review-ar
    short_en: 'Laying new floor tiles level and grouted.',
    parts_in_stock: false,
  },
  {
    slug: 'floor-tile-removal-new',
    name_ar: 'تكسير البلاط القديم وتركيب بلاط أرضيات جديد',
    name_en: 'Old floor tile removal & new installation',
    short_ar: 'تكسير بلاط الأرضيات القديم وتجهيز الأرضية ثم تركيب بلاط جديد.', // review-ar
    short_en: 'Removing old floor tiles, preparing the floor and laying new tiles.',
    parts_in_stock: false,
  },
  {
    slug: 'wall-tiles-kitchen-bathroom',
    name_ar: 'تركيب بلاط جدران المطبخ والحمام',
    name_en: 'Kitchen & bathroom wall tile installation',
    short_ar: 'تركيب بلاط جدران المطبخ والحمام بخطوط مستقيمة وزوايا نظيفة.', // review-ar
    short_en: 'Fixing kitchen and bathroom wall tiles with straight lines and clean corners.',
    parts_in_stock: false,
  },
  {
    slug: 'wall-tile-removal-new',
    name_ar: 'تكسير بلاط الجدران القديم وتركيب جديد',
    name_en: 'Old wall tile removal & new installation',
    short_ar: 'تكسير بلاط الجدران القديم وتجهيز الجدار ثم تركيب بلاط جديد.', // review-ar
    short_en: 'Removing old wall tiles, preparing the wall and fixing new tiles.',
    parts_in_stock: false,
  },
])

export const cleaningServices = defineServices('cleaning', [
  {
    slug: 'water-tank-cleaning',
    name_ar: 'تنظيف الخزان الأرضي والعلوي',
    name_en: 'Ground & roof water tank cleaning',
    short_ar: 'تنظيف الخزان الأرضي أو العلوي من الرواسب والأوساخ، وغسله قبل إعادة تعبئته.', // review-ar
    short_en: 'Cleaning sediment and dirt out of ground or roof tanks and rinsing them before refilling.',
    parts_in_stock: false,
  },
  {
    slug: 'new-apartment-cleaning',
    name_ar: 'تنظيف شقة أو فيلا جديدة غير مفروشة',
    name_en: 'New unfurnished apartment / villa cleaning',
    short_ar: 'تنظيف شقة أو فيلا جديدة بعد التشطيب: الأرضيات والنوافذ ودورات المياه.', // review-ar
    short_en: 'Cleaning a new apartment or villa after finishing work: floors, windows and bathrooms.',
    parts_in_stock: false,
  },
  {
    slug: 'furnished-apartment-cleaning',
    name_ar: 'تنظيف شقة مفروشة',
    name_en: 'Furnished apartment cleaning',
    short_ar: 'تنظيف شقة مفروشة يشمل الأرضيات والأسطح والمطبخ ودورات المياه.', // review-ar
    short_en: 'Cleaning a furnished apartment, including floors, surfaces, kitchen and bathrooms.',
    parts_in_stock: false,
  },
  {
    slug: 'general-cleaning',
    name_ar: 'نظافة عامة',
    name_en: 'General cleaning',
    short_ar: 'تنظيف عام للبيت حسب احتياجك، لمرة واحدة أو قبل المناسبات.', // review-ar
    short_en: 'General home cleaning to your needs — one-off or before an occasion.',
    parts_in_stock: false,
  },
  {
    slug: 'paint-stain-removal',
    name_ar: 'إزالة بقع الدهان من الأرضيات',
    name_en: 'Paint stain removal from floors',
    short_ar: 'إزالة بقع الدهان من البلاط والرخام بعد أعمال الدهان دون خدش الأرضية.', // review-ar
    short_en: 'Removing paint spots from tiles and marble after painting work, without scratching the floor.',
    parts_in_stock: false,
  },
  {
    slug: 'carpet-glue-removal',
    name_ar: 'إزالة غراء الموكيت',
    name_en: 'Carpet glue removal',
    short_ar: 'إزالة بقايا غراء الموكيت من الأرضيات بعد خلع الموكيت القديم.', // review-ar
    short_en: 'Removing leftover carpet glue from floors after old carpet is taken up.',
    parts_in_stock: false,
  },
])
