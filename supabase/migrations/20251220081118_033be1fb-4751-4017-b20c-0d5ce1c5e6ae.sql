-- Create admin_notifications table for storing sent push notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_topic TEXT NOT NULL,
  country_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read notifications (for admin panel display)
CREATE POLICY "Anyone can read admin_notifications"
ON public.admin_notifications
FOR SELECT
USING (true);

-- Allow anyone to insert (edge function will handle this)
CREATE POLICY "Anyone can insert admin_notifications"
ON public.admin_notifications
FOR INSERT
WITH CHECK (true);