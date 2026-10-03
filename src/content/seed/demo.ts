import type { GalleryRow, GoogleReviewsPayload, PublicReviewRow } from '@/content/types'

/*
 * DEVELOPMENT ONLY — sample gallery photos and reviews so the gallery, lightbox, before/after
 * slider and review cards can be checked before real content exists. Used only when
 * VITE_DEMO_CONTENT=true AND no Supabase keys are set; production builds never include it.
 * Images are generated SVG placeholders, clearly labelled "DEMO".
 */

function placeholder(label: string, from: string, to: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><text x="400" y="380" font-family="sans-serif" font-size="56" font-weight="700" fill="#fff" text-anchor="middle">DEMO</text><text x="400" y="450" font-family="sans-serif" font-size="34" fill="#fff" text-anchor="middle">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const row = (i: number, category: string, district: string, caption: [string, string], colors: [string, string], before?: [string, string]): GalleryRow => ({
  id: `demo-${i}`,
  category_id: `cat:${category}`,
  district,
  caption_ar: caption[0],
  caption_en: caption[1],
  image_url: placeholder(before ? 'after' : caption[1], colors[0], colors[1]),
  thumb_url: null,
  before_image_url: before ? placeholder('before', before[0], before[1]) : null,
  taken_on: `2026-0${(i % 9) + 1}-15`,
  sort_order: i * 10,
  is_active: true,
})

export const demoGallery: GalleryRow[] = [
  row(1, 'plumbing', 'ghirnatah', ['تركيب سخان جديد', 'New water heater'], ['#0B2545', '#3BA3D9']),
  row(2, 'electrical', 'qurtubah', ['سبوت لايت في صالة', 'Living room spotlights'], ['#F28C28', '#C4610A'], ['#4B5563', '#1F2937']),
  row(3, 'cctv-intercom-network', 'al-yarmuk', ['كاميرات لفيلا', 'Villa cameras'], ['#071A33', '#13315C']),
  row(4, 'plumbing', 'al-hamra', ['تغيير خلاط مطبخ', 'Kitchen mixer'], ['#3BA3D9', '#0F7A4B']),
  row(5, 'electrical', 'ash-shuhada', ['طبلون جديد', 'New breaker panel'], ['#0F7A4B', '#0B2545']),
  row(6, 'tiles', 'al-falah', ['بلاط حمام', 'Bathroom tiles'], ['#B98B5E', '#7A5634'], ['#9AA5B1', '#4B5563']),
  row(7, 'cleaning', 'at-taawun', ['تنظيف خزان', 'Tank cleaning'], ['#3BA3D9', '#0B2545']),
]

export const demoReviews: PublicReviewRow[] = [
  {
    id: 'demo-r1',
    name: 'أبو فهد (تجريبي)',
    district: 'ghirnatah',
    service_text: 'تركيب سخان جديد',
    rating: 5,
    body: 'مراجعة تجريبية لاختبار الشكل فقط. وصل الفني في الموعد ومعه السخان من المحل، وانتهى العمل خلال ساعة.',
    photo_url: null,
    created_at: '2026-09-12T10:00:00Z',
  },
  {
    id: 'demo-r2',
    name: 'Sara (demo)',
    district: 'qurtubah',
    service_text: 'Spotlight installation',
    rating: 4,
    body: 'Demo review for layout testing only. Clear price on WhatsApp before they came, tidy work.',
    photo_url: null,
    created_at: '2026-08-03T10:00:00Z',
  },
  {
    id: 'demo-r3',
    name: 'محمد (تجريبي)',
    district: 'al-hamra',
    service_text: 'إصلاح الإنتركم',
    rating: 5,
    body: 'تقييم تجريبي. شكرًا على سرعة الاستجابة.',
    photo_url: null,
    created_at: '2026-07-21T10:00:00Z',
  },
]

export const demoGoogle: { payload: GoogleReviewsPayload; fetched_at: string } = {
  fetched_at: '2026-10-01T00:00:00Z',
  payload: {
    rating: 4.8,
    userRatingCount: 57,
    reviews: [
      { authorName: 'Demo reviewer', rating: 5, text: 'Demo Google review for layout testing only.', relativePublishTimeDescription: 'a month ago' },
      { authorName: 'مراجع تجريبي', rating: 4, text: 'تقييم Google تجريبي لاختبار الشكل فقط.', relativePublishTimeDescription: 'قبل شهرين' },
    ],
  },
}
