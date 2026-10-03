-- WhatsApp messages: short, natural, no empty fields to fill in.
--   categories.wa_message_*  the message used on that category's page («السلام عليكم، أحتاج فني سباكة.»)
--   services.wa_message_*    optional custom message; empty → «السلام عليكم، أريد الاستفسار عن {name}.»
-- The old "extra lines" (Size: / How many: …) are no longer used anywhere, so they are dropped.

alter table public.categories
  add column wa_message_ar text,
  add column wa_message_en text;

alter table public.services
  add column wa_message_ar text,
  add column wa_message_en text;

alter table public.services
  drop column wa_extra_lines_ar,
  drop column wa_extra_lines_en;
