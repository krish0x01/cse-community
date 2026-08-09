-- ====================================================================
-- CSE COMMUNITY — Supabase PostgreSQL Schema & Seed Script
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. Create Confessions Table
CREATE TABLE IF NOT EXISTS public.confessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  alias TEXT NOT NULL,
  batch TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_trending BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'PENDING',
  is_approved BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Confession Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  confession_id TEXT NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subject_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  semester TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  format TEXT DEFAULT 'PDF',
  file_size TEXT DEFAULT '4.2 MB',
  downloads INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 5.0,
  link_url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Opportunities Table
CREATE TABLE IF NOT EXISTS public.opportunities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  location_detail TEXT,
  stipend_prize TEXT NOT NULL,
  deadline TEXT NOT NULL,
  days_remaining INTEGER DEFAULT 14,
  tags TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  apply_url TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  month TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  is_online BOOLEAN DEFAULT false,
  speaker_name TEXT NOT NULL,
  speaker_role TEXT NOT NULL,
  speaker_company TEXT NOT NULL,
  total_seats INTEGER DEFAULT 100,
  registered_count INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Reports Table (Honor Code & Moderation)
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  post_url TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'PENDING_REVIEW',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- 7. Supabase Storage Bucket for Academic Files & Notes
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-vault', 'academic-vault', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies (Allow public reads & uploads)
CREATE POLICY "Public Access to Academic Vault" ON storage.objects FOR SELECT USING (bucket_id = 'academic-vault');
CREATE POLICY "Allow Uploads to Academic Vault" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'academic-vault');

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Confessions Policies (Public Read & Public Insert)
CREATE POLICY "Public confessions are readable by everyone" ON public.confessions FOR SELECT USING (true);
CREATE POLICY "Anyone can submit an anonymous confession" ON public.confessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update like count" ON public.confessions FOR UPDATE USING (true);

-- Comments Policies
CREATE POLICY "Public comments are readable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Anyone can comment anonymously" ON public.comments FOR INSERT WITH CHECK (true);

-- Resources Policies
CREATE POLICY "Public resources are readable by everyone" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Anyone can upload academic resources" ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can increment resource downloads" ON public.resources FOR UPDATE USING (true);

-- Opportunities Policies
CREATE POLICY "Public opportunities are readable by everyone" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Anyone can submit an opportunity" ON public.opportunities FOR INSERT WITH CHECK (true);

-- Events Policies
CREATE POLICY "Public events are readable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can propose an event" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can RSVP to an event" ON public.events FOR UPDATE USING (true);

-- Reports Policies
CREATE POLICY "Anyone can submit a violation report" ON public.reports FOR INSERT WITH CHECK (true);

-- ====================================================================
-- SEED DATA (Initial Engineering Campus Data)
-- ====================================================================

INSERT INTO public.confessions (id, alias, batch, category, content, likes, is_trending, tags) VALUES
('conf-1', 'BitwiseBandit', 'CSE ''26', 'Academics', 'I survived Operating Systems end-sems by watching a 47-minute Indian YouTuber video on 2x speed at 3:45 AM. Scored an A-. The syllabus is 90% theory, 10% panic, 100% YouTube bhaiya.', 142, true, ARRAY['#OperatingSystems', '#EndSems', '#LifeSaver']),
('conf-2', 'RecursionQueen', 'CSE ''25', 'Placements', 'To everyone stressing about DSA: You do not need 800 LeetCode hards. I did 180 curated mediums, focused on graphs + dynamic programming patterns, and cracked a 24 LPA backend role yesterday! Keep pushing.', 289, true, ARRAY['#Placements2025', '#LeetCode', '#Offers', '#Backend']),
('conf-3', 'Hostel3Survivor', 'CSE ''27', 'Hostel', 'The hostel 2.4 GHz Wi-Fi drops packet rates exclusively when I am pushing git commits at 11:59 PM for lab evaluations. I am convinced our college router has a consciousness and malicious intent.', 98, false, ARRAY['#HostelWiFi', '#GitPanic', '#Deadlines']),
('conf-4', 'SyntaxErrorRomance', 'CSE ''26', 'Romance', 'To the girl in Lab 4 who lent me her USB-C charger when my laptop died during the DBMS practical: You saved my semester grade. I still have your charger... let me return it over coffee at the canteen?', 176, true, ARRAY['#Lab4', '#DBMS', '#Crush', '#Canteen']),
('conf-5', 'TerminalJunkie', 'CSE ''25', 'Rants', 'Why are we still writing 200 lines of Java Swing code on actual paper during mid-term exams in the year 2026? My hand cramps are more severe than my algorithmic bugs.', 215, true, ARRAY['#ExamRant', '#WrittenExams', '#WhyJavaSwing']),
('conf-6', 'LateNightCoder', 'CSE ''28', 'Campus Life', 'First year CSE: Thought college would be like The Social Network. Reality: Eating cold samosas while debugging segmentation faults in C for 4 straight hours.', 134, false, ARRAY['#Freshers', '#CProgramming', '#SegFault', '#RealLife'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.comments (confession_id, author, text) VALUES
('conf-1', 'CodeMonk', 'Which channel bro?? Don''t gatekeep the sacred playlist!'),
('conf-1', 'GatekeeperExposed', 'Neso Academy + Gate Smashers = Engineering degree guaranteed.'),
('conf-2', 'JuniorDev', 'Congrats!! Did they ask system design or only DSA?'),
('conf-2', 'RecursionQueen', '@JuniorDev 2 rounds DSA, 1 round LLD (Design a Rate Limiter), 1 HR!'),
('conf-4', 'Lab4TA', 'Return the charger bro, she was asking about it yesterday haha')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.resources (id, title, subject_code, subject_name, semester, category, author, verified, format, file_size, downloads, rating, link_url, description) VALUES
('res-1', 'Complete Operating Systems Lecture Notes + Hand-Drawn Diagrams', 'CS-301', 'Operating Systems', 'Semester 5', 'Notes', 'Aman Sharma (AIR 42 GATE)', true, 'PDF', '8.4 MB', 1420, 4.9, 'https://drive.google.com', 'Comprehensive handwritten notes covering Process Scheduling, Deadlocks, Virtual Memory, Paging, and File Systems with solved numericals.'),
('res-2', 'Solved 5-Year PYQ Bank (2020-2025) with Model Answers', 'CS-302', 'Database Management Systems', 'Semester 5', 'PYQ', 'Academic Council Verified', true, 'PDF', '12.1 MB', 2150, 4.8, 'https://drive.google.com', 'Every single university question from the last 10 end-sem examination papers, categorized by module with clean SQL queries and ER diagrams.'),
('res-3', 'Complete Compiler Design Lab Solutions (Lex & Yacc / Flex & Bison)', 'CS-401', 'Compiler Design', 'Semester 7', 'Practical', 'Dev Club Lead', true, 'ZIP', '3.2 MB', 980, 4.7, 'https://drive.google.com', '12 verified lab experiments with clean C/C++ source code, test inputs, makefiles, and expected token output logs.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.opportunities (id, title, company, type, location, location_detail, stipend_prize, deadline, days_remaining, tags, description, eligibility, apply_url, is_featured) VALUES
('opp-1', 'Smart Campus Hackathon 2026', 'Devfolio x Google Cloud', 'Hackathon', 'Hybrid', 'Main Auditorium + Online', '₹5,00,000 Prize Pool', 'March 15, 2026', 8, ARRAY['AI/ML', 'Cloud', 'Open Track', 'Free Food'], '36-hour flagship hackathon focused on building intelligent agentic systems, smart campus solutions, and decentralized storage.', 'Open to all enrolled engineering undergrads. Teams of 2-4.', 'https://devfolio.co', true),
('opp-2', 'Backend Engineering Summer Intern (Golang / Rust)', 'Razorpay', 'Internship', 'Remote', 'Bengaluru / Remote', '₹65,000 / month', 'April 1, 2026', 22, ARRAY['Golang', 'PostgreSQL', 'Microservices'], 'Join Razorpay''s core banking platform team. Build low-latency transactional pipelines handling millions of API requests daily.', 'Pre-final year (Batch of 2027) CSE/IT students.', 'https://razorpay.com/careers', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.events (id, title, category, date, month, day, time, venue, is_online, speaker_name, speaker_role, speaker_company, total_seats, registered_count, description, tags) VALUES
('evt-1', 'High-Scale System Design: From Monolith to Distributed Microservices', 'Tech Talk', 'August 24, 2026', 'AUG', '24', '5:00 PM - 7:00 PM', 'Audi Hall 2 / Google Meet', false, 'Vikram Malhotra', 'Staff Software Engineer', 'Uber (Ex-CSE ''18)', 150, 128, 'Learn how top tech companies architect high-throughput systems, manage distributed consensus (Raft/Paxos), and handle zero-downtime database sharding.', ARRAY['SystemDesign', 'DistributedSystems', 'AlumniTalk']),
('evt-2', 'Hands-on Agentic AI & Next.js 14 Workshop', 'Workshop', 'September 2, 2026', 'SEP', '02', '3:00 PM - 6:30 PM', 'CS Lab 3 & YouTube Stream', true, 'Priya Soni', 'AI Research Fellow', 'OpenAI Community', 100, 84, 'Build autonomous fullstack AI agents from scratch using Next.js 14, LangChain, and vector embeddings. Bring your laptop with Node.js installed.', ARRAY['AI', 'NextJS', 'LiveCoding'])
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 8. Enable Supabase Realtime Channels
-- ====================================================================
ALTER TABLE public.confessions REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'confessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.confessions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END $$;

