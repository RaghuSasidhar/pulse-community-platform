DROP POLICY IF EXISTS "Anyone can submit a report" ON public.reports;
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.reports;

CREATE POLICY "Valid reports for public areas can be submitted"
ON public.reports FOR INSERT TO anon, authenticated
WITH CHECK (
  role IN ('citizen','doctor','volunteer','lab','pharmacy')
  AND char_length(title) BETWEEN 1 AND 200
  AND coalesce(array_length(details, 1), 0) <= 40
  AND (session_id IS NULL OR char_length(session_id) <= 100)
  AND EXISTS (SELECT 1 FROM public.zones z WHERE z.id = zone_id AND z.publicly_visible)
);

CREATE POLICY "Reports in public areas are viewable"
ON public.reports FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.zones z WHERE z.id = zone_id AND z.publicly_visible));

REVOKE SELECT ON public.reports FROM anon, authenticated;
GRANT SELECT (id, zone_id, role, title, details, created_at) ON public.reports TO anon, authenticated;