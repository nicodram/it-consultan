-- Run this once, AFTER schema.sql, in the Supabase SQL Editor.
-- Seeds page_sections with the CV content that currently lives in index.html,
-- so the site keeps looking exactly the same after switching to the CMS.
-- Safe to re-run: upserts by primary key (section).

insert into page_sections (section, data) values
('hero', '{
  "badge_text": "Available for new opportunities",
  "title_line1": "Where IT Excellence",
  "title_highlight": "Innovation",
  "tagline": "IT Project Manager & Business Systems Analyst transforming complex business needs into elegant digital solutions.",
  "stats": [
    {"target": 9, "label": "Years in IT"},
    {"target": 6, "label": "Companies"},
    {"target": 50, "label": "Projects Delivered"}
  ]
}'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('about', '{
  "cards": [
    {"icon": "clock", "title": "9+ Years", "text": "Strong IT background since 2016, from NOC operations to enterprise project leadership."},
    {"icon": "briefcase", "title": "End-to-End PM", "text": "Managing IT projects from concept to launch with cross-functional team leadership."},
    {"icon": "layers", "title": "Infrastructure", "text": "Hands-on expertise in Active Directory, network operations, and enterprise systems."}
  ],
  "summary_text": "An IT Project Manager and IT Business & Systems Analyst with 3+ years of dedicated experience and a strong IT background since 2016. Skilled in understanding business needs and translating them into clear system specifications, successfully managing end-to-end IT projects from concept to launch. Leading cross-functional teams and collaborating with Business Process Owners to deliver solutions that align with business objectives and strict security standards. Proficient in IT infrastructure management, vendor negotiations, budgeting, and utilizing Figma to create intuitive, user-friendly UI/UX designs."
}'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('skills', '[
  {"icon": "📊", "label": "business_analysis", "items": ["BRD / TSD / FSD Documentation", "System Design & Specifications", "UI/UX Prototyping with Figma", "User Acceptance Testing", "Process Improvement"]},
  {"icon": "🚀", "label": "project_management", "items": ["End-to-End Project Leadership", "Vendor Management & Negotiation", "Stakeholder Alignment", "Agile & Scrum Methodologies", "Budget Planning & Control"]},
  {"icon": "🖥️", "label": "infrastructure", "items": ["Active Directory & RODC", "Windows Server Administration", "Network Operations (Mikrotik/Ubiquiti)", "Asset Management & WSUS", "IT Security & Compliance"]},
  {"icon": "⚡", "label": "technical_stack", "items": ["SQL Database & Analytics", "Dynatrace Monitoring", "Nokia LTE & RAN", "Root Cause Analysis", "SDLC & Process Optimization"]}
]'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('tech_tags', '[
  {"name": "MS Office 365", "logo_url": null},
  {"name": "Draw.io", "logo_url": "https://cdn.simpleicons.org/diagramsdotnet"},
  {"name": "Figma", "logo_url": "https://cdn.simpleicons.org/figma"},
  {"name": "Visual Studio", "logo_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-original.svg"},
  {"name": "Windows Server", "logo_url": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg"},
  {"name": "Mac OS", "logo_url": "https://cdn.simpleicons.org/apple"},
  {"name": "Mikrotik", "logo_url": "https://cdn.simpleicons.org/mikrotik"},
  {"name": "Ubiquiti", "logo_url": "https://cdn.simpleicons.org/ubiquiti"},
  {"name": "Dynatrace", "logo_url": "https://cdn.simpleicons.org/dynatrace"}
]'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('experience', '[
  {"date_range": "Feb 2025 — Present", "type_label": "Current", "title": "IT PM & IT Business & System Analyst", "company": "PT Elixer Reka Digita — Jakarta", "bullets": [
    "Gathered requirements, created BRD, TSD, FSD documents ensuring alignment with business goals",
    "Utilized Figma to design UI/UX prototypes for user-friendly interfaces",
    "Designed detailed system specifications for developers to implement new IT systems",
    "Conducted UAT, provided end-user support, training, and created guide documentation",
    "Managed project timelines and deliverables for business analysis activities"
  ]},
  {"date_range": "Oct 2022 — Mar 2025", "type_label": "2.5 Years", "title": "IT Business & System Analyst", "company": "PT PRODIA WIDYAHUSADA TBK — Jakarta", "bullets": [
    "Collaborated with Business Process Owners to analyze and refine IT system requirements",
    "Managed IT projects (internal & external) ensuring timely delivery and quality outcomes",
    "Conducted vendor evaluations and negotiations for IT system development projects",
    "Conducted rigorous testing and oversaw system implementation into production",
    "Utilized Figma for UI/UX prototyping and design"
  ]},
  {"date_range": "Nov 2020 — Oct 2022", "type_label": "2 Years", "title": "IT Project Manager — Active Directory & Asset Management", "company": "PT PRODIA WIDYAHUSADA TBK", "bullets": [
    "Led Active Directory maintenance projects including negotiation, scheduling, and troubleshooting",
    "Managed asset management projects, POC, tender processes, and vendor reviews",
    "Maintained AD servers, RODCs, and Windows Server 2012-based file servers",
    "Served as Super Admin for Active Directory ensuring system integrity and security"
  ]},
  {"date_range": "Dec 2018 — Oct 2020", "type_label": "2 Years", "title": "Helpdesk Team Member", "company": "PT PRODIA WIDYAHUSADA TBK", "bullets": [
    "Handled helpdesk tickets, customer complaints, and field operation issues",
    "Provided IT support for network, software, and hardware troubleshooting",
    "Conducted on-site troubleshooting to resolve technical issues efficiently"
  ]},
  {"date_range": "Nov 2016 — Jan 2018", "type_label": "1 Year", "title": "IT Infrastructure & Software Maintenance Specialist", "company": "Telkom Indonesia — Jakarta", "bullets": [
    "Resolved customer complaints related to IT infrastructure",
    "Conducted training sessions for users on networking and software usage",
    "Supported major service outage investigations to ensure minimal downtime"
  ]},
  {"date_range": "Feb 2016 — Oct 2016", "type_label": "8 Months", "title": "IT RAN Surveillance — NOC Center", "company": "Nokia Corporation — Jakarta", "bullets": [
    "Monitored Nokia''s RAN for Smartfren LTE 4G western region",
    "Analyzed KPIs for VIP customer complaints and provided actionable insights",
    "Guided field operations teams in troubleshooting and ensuring eNodeBs operational"
  ]},
  {"date_range": "Oct 2015 — Jan 2016", "type_label": "3 Months", "title": "Production Operator", "company": "Energizer Holdings — Jakarta", "bullets": [
    "Operated production machinery and monitored production lines",
    "Reported production data and assisted in daily operations",
    "Maintained high efficiency and safety standards on the production floor"
  ]}
]'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('education', '{
  "degree": "Bachelor of Information Technology",
  "school": "Universitas Pakuan Bogor",
  "year_range": "2013 – 2018",
  "gpa": "3.13",
  "document_title": "NIB OSS",
  "document_url": null
}'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('certifications', '[
  {"year": "2024", "title": "Future AI Summit & Awards", "subtitle": "Indonesia Edition — 9 CPD Credits"},
  {"year": "2019", "title": "CompTIA+ Project Management Professional", "subtitle": "PMP Certification"},
  {"year": "2018", "title": "Go Green ICT, Smart City Agricultural", "subtitle": "IPB Bogor"},
  {"year": "2016", "title": "Nokia LTE Introduction & VoLTE Planning", "subtitle": "Alarm Analysis & OJT LTE RAN Surveillance"},
  {"year": "2015", "title": "Fiber Optic Training", "subtitle": "OTDR, Splicer, Power Meter, Link Budget Planning"}
]'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('organizations', '[
  {"name": "Koprasi Merah Putih", "detail": "Tapos Depok — Present"},
  {"name": "Young Catholics PKKC", "detail": "Creative & Art Coordinator (2016–2019)"},
  {"name": "Karang Taruna 311", "detail": "Leader (2017–2020)"}
]'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('projects', '[
  {"badge": "Infrastructure", "title": "Active Directory Overhaul", "description": "Led comprehensive AD maintenance including RODC management, Windows Server 2012 infrastructure, and security administration as Super Admin.", "tags": ["AD Server", "Security", "Windows Server"]},
  {"badge": "Management", "title": "IT Asset Management System", "description": "Managed end-to-end asset lifecycle including Proof of Concept, tender processes, vendor evaluations, and performance monitoring.", "tags": ["POC", "Procurement", "Vendor Mgmt"]},
  {"badge": "Design", "title": "UI/UX System Design", "description": "Designed intuitive user interfaces using Figma for multiple IT systems, creating prototypes that enhanced user experience and adoption.", "tags": ["Figma", "UI/UX", "Prototyping"]},
  {"badge": "Network", "title": "LTE Network Surveillance", "description": "Monitored Nokia RAN for Smartfren LTE 4G, performed fault localization, KPI analysis for VIP customers, and coordinated field operations.", "tags": ["Nokia LTE", "NOC", "KPI Analysis"]}
]'::jsonb)
on conflict (section) do update set data = excluded.data;

insert into page_sections (section, data) values
('contact', '{
  "subtitle_text": "Open for IT Project Management, Business Analysis, and Digital Transformation opportunities.",
  "email": "nicodemus.reno@gmail.com",
  "phone": "+62 877 8018 7575",
  "phone_href": "+6287780187575",
  "linkedin_url": "https://linkedin.com/in/nicodemus-reno-anjasmoro",
  "location": "Depok, Indonesia"
}'::jsonb)
on conflict (section) do update set data = excluded.data;
