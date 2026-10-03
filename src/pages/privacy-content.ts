import type { Lang } from '@/i18n/lang'

/*
 * Privacy policy text (brief §6.10): plain language, what the forms collect, used only to reply,
 * never sold, ask on WhatsApp to delete. Keep it in step with what the site actually does.
 */

export interface PrivacySection {
  title: string
  paragraphs: string[]
}

export const privacyUpdated: Record<Lang, string> = {
  ar: 'آخر تحديث: أكتوبر 2026', // review-ar
  en: 'Last updated: October 2026',
}

export const privacyContent: Record<Lang, PrivacySection[]> = {
  ar: [
    {
      title: 'من نحن', // review-ar
      paragraphs: [
        'هذا الموقع لمحل رياض هوم سوليوشن في حي غرناطة بالرياض. لأي سؤال عن بياناتك راسلنا على واتساب أو اتصل بنا على الرقم الموجود أسفل الصفحة.', // review-ar
      ],
    },
    {
      title: 'ما البيانات التي نجمعها', // review-ar
      paragraphs: [
        'نموذج التقييم: الاسم والحي والخدمة وعدد النجوم والتعليق، وصورة إن أرفقتها. نحفظها في قاعدة بياناتنا لنراجعها وننشر التقييم بعد موافقتنا. ونحفظ أيضًا رمزًا مشفّرًا لعنوان اتصالك بالإنترنت لمنع الرسائل المزعجة فقط، ولا يمكن استرجاع العنوان الأصلي منه.', // review-ar
        'نموذج طلب الزيارة: لا نحفظ بياناته في الموقع إطلاقًا. يفتح واتساب برسالة جاهزة، ولا تصلنا إلا إذا أرسلتها أنت.', // review-ar
        'واتساب والاتصال: نستخدم رقمك ورسائلك فقط للرد عليك وترتيب الخدمة. تخضع المحادثات على واتساب أيضًا لسياسة خصوصية واتساب.', // review-ar
      ],
    },
    {
      title: 'كيف نستخدمها', // review-ar
      paragraphs: [
        'نستخدم بياناتك للرد عليك وتقديم الخدمة ونشر التقييمات التي توافق عليها. لا نبيع بياناتك ولا نشاركها مع أي جهة لأغراض تسويقية.', // review-ar
      ],
    },
    {
      title: 'الإحصاءات والإعلانات', // review-ar
      paragraphs: [
        'نستخدم أدوات Google (مدير العلامات وGoogle Analytics وقياس إعلانات Google) لمعرفة الصفحات والإعلانات التي تصلنا منها الطلبات، وقد تستخدم هذه الأدوات ملفات تعريف الارتباط.', // review-ar
        'إذا وصلت إلينا من إعلان، يتذكر متصفحك رمز الإعلان طوال الجلسة فقط، لنعرف أن رسالة واتساب جاءت من إعلان. يُحذف هذا الرمز عند إغلاق المتصفح.', // review-ar
        'تعرض صفحتا «من نحن» و«تواصل معنا» خريطة من Google، وقد تضع Google ملفات تعريف ارتباط عند تحميلها.', // review-ar
      ],
    },
    {
      title: 'أين تُحفظ البيانات', // review-ar
      paragraphs: [
        'تُحفظ التقييمات والصور لدى مزوّد قاعدة البيانات Supabase، ويُستضاف الموقع لدى Cloudflare. نحمي البيانات بصلاحيات وصول محددة، ولا يطّلع على التقييمات قبل نشرها إلا صاحب المحل.', // review-ar
      ],
    },
    {
      title: 'حذف بياناتك', // review-ar
      paragraphs: [
        'لحذف تقييمك أو صورتك أو أي بيانات لدينا، راسلنا على واتساب باسمك وتاريخ التقييم التقريبي، وسنحذفها.', // review-ar
      ],
    },
  ],
  en: [
    {
      title: 'Who we are',
      paragraphs: [
        'This is the website of Riyadh Home Solution, a shop in Ghirnatah, Riyadh. For any question about your data, message us on WhatsApp or call the number at the bottom of the page.',
      ],
    },
    {
      title: 'What we collect',
      paragraphs: [
        'Review form: your name, area, service, star rating and review, and a photo if you add one. We store these in our database so we can check the review and publish it once approved. We also store a scrambled code of your internet connection’s address, used only to block spam — the original address cannot be recovered from it.',
        'Request-a-visit form: nothing is stored on this website. It opens WhatsApp with a ready message, which only reaches us if you send it.',
        'WhatsApp and phone: we use your number and messages only to reply and arrange the job. WhatsApp conversations are also covered by WhatsApp’s own privacy policy.',
      ],
    },
    {
      title: 'How we use it',
      paragraphs: [
        'We use your details to reply to you, provide the service and publish reviews we approve. We never sell your data or share it with anyone for marketing.',
      ],
    },
    {
      title: 'Analytics and ads',
      paragraphs: [
        'We use Google tools (Tag Manager, Google Analytics and Google Ads measurement) to see which pages and ads bring enquiries. These tools may use cookies.',
        'If you arrive from one of our ads, your browser remembers the ad code for that session only, so we know the WhatsApp message came from an ad. It is cleared when you close the browser.',
        'The About and Contact pages show a Google map, and Google may set cookies when it loads.',
      ],
    },
    {
      title: 'Where data is kept',
      paragraphs: [
        'Reviews and photos are stored with our database provider, Supabase, and the website is hosted by Cloudflare. Access is restricted, and only the shop owner can see reviews before they are published.',
      ],
    },
    {
      title: 'Deleting your data',
      paragraphs: [
        'To delete your review, photo or any data we hold, message us on WhatsApp with your name and roughly when you sent it, and we will delete it.',
      ],
    },
  ],
}
