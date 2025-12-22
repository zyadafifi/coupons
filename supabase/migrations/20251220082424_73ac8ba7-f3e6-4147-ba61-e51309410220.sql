-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert admin_notifications" ON public.admin_notifications;
DROP POLICY IF EXISTS "Anyone can read admin_notifications" ON public.admin_notifications;

-- Create restrictive policies - only service role can access (edge functions use service role)
-- No public access at all - all access goes through edge functions
CREATE POLICY "Service role only - no public access"
ON public.admin_notifications
FOR ALL
USING (false)
WITH CHECK (false);