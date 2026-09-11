CREATE TABLE public.zones (
  id text PRIMARY KEY,
  name text NOT NULL,
  district text NOT NULL,
  state text NOT NULL DEFAULT 'Andhra Pradesh',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  population integer NOT NULL,
  severity_score integer NOT NULL DEFAULT 0,
  trend text NOT NULL DEFAULT 'steady',
  trend_pct integer NOT NULL DEFAULT 0,
  top_signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  sources jsonb NOT NULL DEFAULT '{}'::jsonb,
  summary text NOT NULL DEFAULT '',
  possible_reason text NOT NULL DEFAULT '',
  precautions text[] NOT NULL DEFAULT '{}',
  weekly integer[] NOT NULL DEFAULT '{0,0,0,0,0,0,0}',
  publicly_visible boolean NOT NULL DEFAULT true,
  anomaly_flag text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.zones TO anon;
GRANT SELECT ON public.zones TO authenticated;
GRANT ALL ON public.zones TO service_role;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public areas are viewable by everyone" ON public.zones FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id text NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  role text NOT NULL,
  title text NOT NULL,
  details text[] NOT NULL DEFAULT '{}',
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX reports_zone_created_idx ON public.reports (zone_id, created_at DESC);

GRANT SELECT, INSERT ON public.reports TO anon;
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports are viewable by everyone" ON public.reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit a report" ON public.reports FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.bump_zone_on_report()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.zones
  SET severity_score = LEAST(100, severity_score + 2),
      weekly = weekly[1:6] || ARRAY[weekly[7] + 1],
      trend = 'rising',
      updated_at = now()
  WHERE id = NEW.zone_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reports_bump_zone
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.bump_zone_on_report();

INSERT INTO public.zones (id, name, district, lat, lng, population, severity_score, trend, trend_pct, top_signals, sources, summary, possible_reason, precautions, weekly, publicly_visible, anomaly_flag) VALUES
('z-vijayawada-benz','Benz Circle, Vijayawada','NTR',16.4977,80.6570,164000,73,'rising',36,
 '[{"label":"Fever (3 days or more)","count":47},{"label":"Cough","count":39},{"label":"Body pains","count":24}]',
 '{"citizen":47,"doctor":4,"volunteer":3,"lab":1,"pharmacy":2}',
 '47 citizen fever and cough reports, 4 clinic notifications, 1 lab-confirmed case and 3 volunteer household alerts this week. The pattern is consistent with a rising respiratory illness cluster around the Benz Circle corridor.',
 'Possibly linked to the seasonal post-monsoon respiratory wave seen in coastal Andhra in previous years. One plausible explanation only, not confirmed by any health authority.',
 ARRAY['Wear a mask in crowded indoor spaces for the next two weeks','Keep windows open where possible to improve ventilation','Seek care if fever lasts beyond three days or breathing feels difficult','Keep young children and elderly relatives away from large gatherings'],
 ARRAY[19,24,28,33,41,54,70], true, NULL),
('z-vizag-gajuwaka','Gajuwaka, Visakhapatnam','Visakhapatnam',17.6800,83.2100,198000,86,'rising',58,
 '[{"label":"Fever (3 days or more)","count":92},{"label":"Eye redness","count":51},{"label":"Skin rashes","count":29}]',
 '{"citizen":92,"doctor":8,"volunteer":6,"lab":4,"pharmacy":5}',
 '92 citizen reports, 8 clinical notifications, 4 lab confirmations and 6 volunteer household alerts. Fever with eye redness dominates and professional reporting strongly corroborates the citizen signal.',
 'The symptom mix is compatible with a mosquito-borne illness cluster, which this district has recorded in comparable weeks before. Stated as a possibility, not a diagnosis.',
 ARRAY['Remove standing water around homes and rooftops','Use mosquito nets and repellents, especially at dawn and dusk','Do not self-medicate fever with painkillers other than paracetamol','Seek care early for fever with rash or bleeding gums'],
 ARRAY[22,31,45,57,71,83,94], true, NULL),
('z-vizag-mvp','MVP Colony, Visakhapatnam','Visakhapatnam',17.7400,83.3300,112000,27,'falling',-9,
 '[{"label":"Cold","count":14},{"label":"Headache","count":7}]',
 '{"citizen":14,"doctor":1,"volunteer":0,"lab":0,"pharmacy":1}',
 'Low background activity. 14 mild citizen reports and one clinic note this week, slightly down from last week.',
 'Consistent with ordinary seasonal background levels for this area.',
 ARRAY['No area-specific precaution needed right now'],
 ARRAY[19,18,17,16,15,15,14], true, NULL),
('z-guntur-arundelpet','Arundelpet, Guntur','Guntur',16.3067,80.4365,138000,52,'rising',15,
 '[{"label":"Stomach upset","count":31},{"label":"Vomiting","count":17},{"label":"Headache","count":10}]',
 '{"citizen":31,"doctor":3,"volunteer":3,"lab":0,"pharmacy":5}',
 '31 citizen stomach reports, 3 outpatient triage notes and 5 pharmacy signals showing higher oral rehydration sales. No laboratory confirmation yet.',
 'Could relate to a localised water-supply disruption reported in the ward last week. Treat as a possibility pending confirmation.',
 ARRAY['Boil or filter drinking water until the signal settles','Use oral rehydration solution early for loose motions','Wash hands before preparing food'],
 ARRAY[12,14,13,18,22,26,31], true, NULL),
('z-tirupati','Tirupati Town','Tirupati',13.6288,79.4192,127000,44,'steady',3,
 '[{"label":"Cough","count":21},{"label":"Cold","count":18}]',
 '{"citizen":21,"doctor":2,"volunteer":1,"lab":0,"pharmacy":2}',
 'Steady low-to-moderate respiratory activity, largely unchanged from last week across all reporting sources.',
 'Likely ordinary seasonal circulation of common respiratory infections, with added movement from pilgrim footfall.',
 ARRAY['Stay home while symptomatic if you can','Cover coughs and sneezes','Carry a mask for queues and crowded halls'],
 ARRAY[19,20,19,21,20,21,21], true, NULL),
('z-nellore','Nellore City','Nellore',14.4426,79.9865,119000,33,'rising',11,
 '[{"label":"Fever (3 days or more)","count":18},{"label":"Body pains","count":11}]',
 '{"citizen":18,"doctor":2,"volunteer":1,"lab":0,"pharmacy":1}',
 '18 citizen fever reports and two clinic notes this week, a mild rise on last week with no laboratory confirmation.',
 'A mild seasonal fever rise is plausible; nothing unusual has been confirmed.',
 ARRAY['Rest and keep fluids up during fever','Seek care if fever lasts beyond three days'],
 ARRAY[10,11,12,13,15,16,18], true, NULL),
('z-kakinada','Kakinada Port Area','Kakinada',16.9891,82.2475,94000,58,'rising',26,
 '[{"label":"Stomach upset","count":27},{"label":"Fever (3 days or more)","count":22},{"label":"Vomiting","count":13}]',
 '{"citizen":27,"doctor":3,"volunteer":2,"lab":1,"pharmacy":3}',
 '27 stomach and 22 fever reports with one lab confirmation and three pharmacy signals. Reporting is concentrated near the port wards.',
 'A water or food-borne source is one possibility given the mix of stomach complaints; this has not been confirmed.',
 ARRAY['Boil or filter drinking water','Avoid uncovered street food while the signal is active','Use oral rehydration solution early for loose motions'],
 ARRAY[13,15,18,21,24,26,27], true, NULL),
('z-rajahmundry','Rajahmundry','East Godavari',17.0005,81.8040,103000,21,'falling',-12,
 '[{"label":"Cold","count":11},{"label":"Cough","count":6}]',
 '{"citizen":11,"doctor":1,"volunteer":0,"lab":0,"pharmacy":0}',
 'Background-level activity with no clustering of note; reports are down on last week.',
 'No unusual pattern detected.',
 ARRAY['No area-specific precaution needed right now'],
 ARRAY[16,15,14,13,12,12,11], true, NULL),
('z-kurnool','Kurnool Central','Kurnool',15.8281,78.0373,88000,39,'rising',24,
 '[{"label":"Fever (3 days or more)","count":25}]',
 '{"citizen":25,"doctor":0,"volunteer":0,"lab":0,"pharmacy":0}',
 '25 near-identical citizen fever reports arrived within a four-hour window, with no corroborating clinical, lab or volunteer data.',
 'Pattern shape does not resemble organic community spread. Held back from the public map pending human review.',
 ARRAY['Under review — no public guidance issued'],
 ARRAY[2,1,2,3,2,4,25], false, 'Synthetic burst suspected — identical symptom set, single device cluster'),
('z-anantapur','Anantapur','Anantapur',14.6819,77.6006,79000,15,'falling',-18,
 '[{"label":"Cough","count":8}]',
 '{"citizen":8,"doctor":1,"volunteer":0,"lab":0,"pharmacy":0}',
 'Eight citizen reports this week, below the privacy threshold for a detailed public breakdown.',
 'No unusual pattern detected.',
 ARRAY['No area-specific precaution needed right now'],
 ARRAY[14,13,12,11,10,9,8], false, NULL);

ALTER TABLE public.reports DISABLE TRIGGER reports_bump_zone;

INSERT INTO public.reports (zone_id, role, title, details, created_at)
SELECT z.id,
  'citizen',
  CASE (g % 5)
    WHEN 0 THEN '1 symptom reported'
    WHEN 1 THEN '2 symptoms reported'
    WHEN 2 THEN '3 symptoms reported'
    WHEN 3 THEN '2 symptoms reported'
    ELSE '1 symptom reported'
  END,
  CASE (g % 5)
    WHEN 0 THEN ARRAY['Fever (3 days or more) — Noticeable']
    WHEN 1 THEN ARRAY['Cough — Mild','Cold — Mild']
    WHEN 2 THEN ARRAY['Fever (3 days or more) — Severe','Body pains — Noticeable','Headache — Mild']
    WHEN 3 THEN ARRAY['Stomach upset — Noticeable','Vomiting — Mild']
    ELSE ARRAY['Eye redness — Mild']
  END,
  now() - (random() * interval '7 days')
FROM public.zones z
CROSS JOIN generate_series(1, 1) AS g
CROSS JOIN generate_series(1, GREATEST(4, (z.severity_score / 3))) AS n;

INSERT INTO public.reports (zone_id, role, title, details, created_at)
SELECT z.id, 'doctor', 'Syndromic counts filed',
  ARRAY['Presumptive cases: ' || (2 + (z.severity_score / 20)), 'Fever cluster noted in outpatient queue'],
  now() - (random() * interval '5 days')
FROM public.zones z CROSS JOIN generate_series(1, 2) AS n
WHERE z.severity_score > 30;

INSERT INTO public.reports (zone_id, role, title, details, created_at)
SELECT z.id, 'volunteer', 'Household tally submitted',
  ARRAY['Households visited: 24', 'Households with fever: ' || (1 + (z.severity_score / 25))],
  now() - (random() * interval '4 days')
FROM public.zones z CROSS JOIN generate_series(1, 1) AS n
WHERE z.severity_score > 40;

INSERT INTO public.reports (zone_id, role, title, details, created_at)
SELECT z.id, 'pharmacy', 'OTC sales log',
  ARRAY['Paracetamol strips sold: ' || (40 + z.severity_score), 'ORS sachets sold: ' || (12 + z.severity_score / 2)],
  now() - (random() * interval '3 days')
FROM public.zones z CROSS JOIN generate_series(1, 1) AS n
WHERE z.severity_score > 35;

INSERT INTO public.reports (zone_id, role, title, details, created_at)
SELECT z.id, 'lab', 'Panel results filed',
  ARRAY['Samples tested: 18', 'Positive: ' || (1 + z.severity_score / 30)],
  now() - (random() * interval '2 days')
FROM public.zones z
WHERE z.severity_score > 55;

ALTER TABLE public.reports ENABLE TRIGGER reports_bump_zone;