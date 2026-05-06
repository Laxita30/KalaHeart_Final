
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_type text;

ALTER TABLE public.chat_messages
  ALTER COLUMN content DROP NOT NULL;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_content_or_attachment
  CHECK (
    (content IS NOT NULL AND length(btrim(content)) > 0)
    OR attachment_url IS NOT NULL
  );

CREATE POLICY "Public read chat media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-media');

CREATE POLICY "Authenticated upload chat media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'chat-media');
