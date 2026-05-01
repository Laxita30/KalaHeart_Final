-- AI chatbot conversations & messages
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  language TEXT,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  language TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Owners can manage their AI conversations
CREATE POLICY "Users view own ai conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users update own ai conversations" ON public.ai_conversations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all ai conversations" ON public.ai_conversations
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own ai messages" ON public.ai_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai messages" ON public.ai_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins view all ai messages" ON public.ai_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ai_messages_convo ON public.ai_messages(conversation_id, created_at);
CREATE INDEX idx_ai_conversations_user ON public.ai_conversations(user_id, created_at DESC);

-- Direct chat between users and artists
CREATE TABLE public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  artist_user_id UUID NOT NULL,
  artist_id UUID,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, artist_user_id)
);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view threads" ON public.chat_threads
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = artist_user_id);
CREATE POLICY "Users create threads" ON public.chat_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = artist_user_id);
CREATE POLICY "Participants update threads" ON public.chat_threads
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = artist_user_id);
CREATE POLICY "Admins view all threads" ON public.chat_threads
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Participants view messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id
            AND (auth.uid() = t.user_id OR auth.uid() = t.artist_user_id))
  );
CREATE POLICY "Participants send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.chat_threads t WHERE t.id = thread_id
            AND (auth.uid() = t.user_id OR auth.uid() = t.artist_user_id))
  );
CREATE POLICY "Admins view all messages" ON public.chat_messages
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_chat_messages_thread ON public.chat_messages(thread_id, created_at);
CREATE INDEX idx_chat_threads_user ON public.chat_threads(user_id, last_message_at DESC);
CREATE INDEX idx_chat_threads_artist ON public.chat_threads(artist_user_id, last_message_at DESC);

-- Bump thread last_message_at when a new message is inserted
CREATE OR REPLACE FUNCTION public.bump_chat_thread()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.chat_threads SET last_message_at = NEW.created_at WHERE id = NEW.thread_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_bump_chat_thread
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.bump_chat_thread();