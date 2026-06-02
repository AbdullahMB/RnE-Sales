export type DealStage = 'Stage 1' | 'Stage 2' | 'Stage 3' | 'Stage 4' | 'Stage 5';
export type RiskLevel = 'low' | 'medium' | 'high';
export type StakeholderRole = 'Decision Maker' | 'Champion' | 'Influencer' | 'Blocker' | 'Coach';
export type RelationshipStrength = 1 | 2 | 3 | 4 | 5;

export interface Deal {
  id: string;
  accountName: string;
  accountId: string;
  stage: DealStage;
  acv: number;
  closeDate: string;
  daysSinceActivity: number;
  risk: RiskLevel;
  owner: string;
}

export interface Signal {
  id: string;
  accountId: string;
  accountName: string;
  type: 'funding' | 'leadership' | 'news' | 'product';
  title: string;
  summary: string;
  date: string;
}

export interface SuggestedTask {
  id: string;
  dealId: string;
  accountName: string;
  action: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Stakeholder {
  id: string;
  accountId: string;
  name: string;
  title: string;
  role: StakeholderRole;
  strength: RelationshipStrength;
  lastContact: string;
  email: string;
  phone: string;
  linkedin: string;
  buyingCenter: string;
  notes: string;
  department?: string; // department id: d1=IT, d2=Ops, d3=Finance, d4=Digital, d5=Legal, d6=C-Suite, d7=HR
}

export interface AccountExecutive {
  id: string;
  name: string;
  title: string;
  photoUrl?: string;
  linkedin?: string;
  email?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  email: string;
  region: string;
  avatarUrl?: string;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  revenue: string;
  lastQuarterRevenue?: string;
  headcount: string;
  region: string;
  hq?: string;
  founded?: string;
  ticker?: string;
  website?: string;
  logoUrl?: string;
  tier: 'Strategic' | 'Enterprise' | 'Mid-Market';
  accountManagerId?: string;
  openDeals: number;
  totalAcv: number;
  lastActivity: string;
  executives?: AccountExecutive[];
}

export interface WikiAsset {
  id: string;
  title: string;
  type: 'Case Study' | 'Battle Card' | 'Playbook' | 'Template' | 'Reference Architecture' | 'FAQ';
  industry: string[];
  tags: string[];
  lastUpdated: string;
  expiresAt: string | null;
  description: string;
  approved: boolean;
}

export interface MeetingSummary {
  id: string;
  accountId: string;
  accountName: string;
  meetingTitle: string;
  date: string;
  duration: string;
  participants: string[];
  summary: string;
  actionItems: { id: string; text: string; owner: string; due: string; checked: boolean }[];
  meddic: {
    metrics: string | null;
    economicBuyer: string | null;
    decisionCriteria: string | null;
    decisionProcess: string | null;
    identifiedPain: string | null;
    champion: string | null;
  };
  status: 'pending' | 'approved' | 'rejected';
}

export const MOCK_DEALS: Deal[] = [
  { id: 'd1', accountName: 'Aramco Digital', accountId: 'a1', stage: 'Stage 3', acv: 1200000, closeDate: '2026-06-30', daysSinceActivity: 3, risk: 'medium', owner: 'Turki Bin Nader' },
  { id: 'd2', accountName: 'SABIC', accountId: 'a2', stage: 'Stage 4', acv: 480000, closeDate: '2026-05-31', daysSinceActivity: 18, risk: 'high', owner: 'Turki Bin Nader' },
  { id: 'd3', accountName: 'STC Group', accountId: 'a3', stage: 'Stage 2', acv: 750000, closeDate: '2026-07-31', daysSinceActivity: 7, risk: 'low', owner: 'Turki Bin Nader' },
  { id: 'd4', accountName: 'Mobily', accountId: 'a4', stage: 'Stage 3', acv: 320000, closeDate: '2026-06-15', daysSinceActivity: 22, risk: 'high', owner: 'Turki Bin Nader' },
  { id: 'd5', accountName: 'NEOM', accountId: 'a5', stage: 'Stage 1', acv: 2100000, closeDate: '2026-09-30', daysSinceActivity: 1, risk: 'low', owner: 'Turki Bin Nader' },
];

export const MOCK_SIGNALS: Signal[] = [
  { id: 's1', accountId: 'a1', accountName: 'Aramco Digital', type: 'leadership', title: 'New CTO appointed', summary: 'Aramco Digital named Khalid Al-Rashid as CTO, replacing Ahmed Hassan who moved to parent company.', date: '2026-05-01' },
  { id: 's2', accountId: 'a5', accountName: 'NEOM', type: 'funding', title: '$500M cloud infrastructure budget approved', summary: 'NEOM announced a major infrastructure investment cycle for 2026–2028 in their latest board filing.', date: '2026-04-29' },
  { id: 's3', accountId: 'a3', accountName: 'STC Group', type: 'news', title: 'STC partners with hyperscaler for AI services', summary: 'STC announced a co-development agreement for enterprise AI services — directly relevant to our platform pitch.', date: '2026-04-27' },
  { id: 's4', accountId: 'a2', accountName: 'SABIC', type: 'leadership', title: 'VP Engineering promoted to SVP', summary: 'Internal promotion at SABIC. Our champion is now SVP — increase in influence and budget authority.', date: '2026-04-25' },
];

export const MOCK_TASKS: SuggestedTask[] = [
  { id: 't1', dealId: 'd2', accountName: 'SABIC', action: 'Follow up with CFO on Stage 4 approval', reason: 'Deal is at Stage 4 with no CFO contact in 18 days. Required for close.', priority: 'high' },
  { id: 't2', dealId: 'd4', accountName: 'Mobily', action: 'Send FSI case study to technical team', reason: 'Technical evaluation stalled. Similar deals unblocked with reference architecture.', priority: 'high' },
  { id: 't3', dealId: 'd1', accountName: 'Aramco Digital', action: 'Schedule intro with new CTO Khalid Al-Rashid', reason: 'Leadership change detected. New CTO is likely reassessing vendor relationships.', priority: 'medium' },
  { id: 't4', dealId: 'd3', accountName: 'STC Group', action: 'Send AI partnership reference architecture', reason: 'STC announced an AI co-development deal — align our platform pitch to their new strategic direction.', priority: 'medium' },
];

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'a1', name: 'Aramco Digital', industry: 'Energy / Digital Infrastructure',
    revenue: 'Subsidiary (Saudi Aramco: $440B+)', lastQuarterRevenue: 'Not disclosed',
    headcount: '~150', region: 'KSA', hq: 'Dammam, KSA', founded: '2023',
    ticker: '2222.SR (parent)', website: 'aramcodigital.com',
    tier: 'Strategic', accountManagerId: 'tm1', openDeals: 1, totalAcv: 1200000, lastActivity: '2026-05-01',
    executives: [
      { id: 'e-a1-1', name: 'Tareq Amin', title: 'Founding CEO (now at HUMAIN)', linkedin: 'https://linkedin.com/in/tareqamin' },
      { id: 'e-a1-2', name: 'Ahmad O. Al-Khowaiter', title: 'Chief Technology Officer (Aramco Group)' },
      { id: 'e-a1-3', name: 'Ziad T. Al-Murshed', title: 'EVP & CFO (Aramco Group)' },
    ],
  },
  {
    id: 'a2', name: 'SABIC', industry: 'Petrochemicals',
    revenue: '$37.3B (FY2024)', lastQuarterRevenue: '~$9.2B (Q4 2024)',
    headcount: '~33,000', region: 'KSA', hq: 'Riyadh, KSA', founded: '1976',
    ticker: '2010.SR', website: 'sabic.com',
    tier: 'Strategic', accountManagerId: 'tm1', openDeals: 1, totalAcv: 480000, lastActivity: '2026-04-15',
    executives: [
      { id: 'e-a2-1', name: 'Dr. Faisal Mohammed Al-Faqeer', title: 'Chief Executive Officer', email: 'ceo@sabic.com' },
      { id: 'e-a2-2', name: 'Salah Mohammed Al-Hareky', title: 'EVP, Corporate Finance' },
    ],
  },
  {
    id: 'a3', name: 'STC Group', industry: 'Telecom',
    revenue: '$20.2B (FY2024, record)', lastQuarterRevenue: '~$5.1B (Q4 2024)',
    headcount: '~19,863', region: 'KSA', hq: 'Riyadh, KSA', founded: '1998',
    ticker: '7010.SR', website: 'stc.com.sa',
    tier: 'Enterprise', accountManagerId: 'tm2', openDeals: 1, totalAcv: 750000, lastActivity: '2026-04-26',
    executives: [
      { id: 'e-a3-1', name: 'Olayan bin Mohammed Alwetaid', title: 'Group CEO', linkedin: 'https://linkedin.com/in/olayan-alwetaid' },
      { id: 'e-a3-2', name: 'Ameen Fahad Alshiddi', title: 'Group CFO' },
      { id: 'e-a3-3', name: 'Riyadh Saeed Muawad', title: 'Chief Business Officer' },
      { id: 'e-a3-4', name: 'Abdullah Abdulrahman Alkanhl', title: 'Chief Strategy Officer' },
    ],
  },
  {
    id: 'a4', name: 'Mobily', industry: 'Telecom',
    revenue: '$4.85B (FY2024, record)', lastQuarterRevenue: '~$1.25B (Q4 2024)',
    headcount: '~4,000', region: 'KSA', hq: 'Riyadh, KSA', founded: '2004',
    ticker: '7020.SR', website: 'mobily.com.sa',
    tier: 'Enterprise', accountManagerId: 'tm3', openDeals: 1, totalAcv: 320000, lastActivity: '2026-04-11',
    executives: [
      { id: 'e-a4-1', name: 'Eng. Nezar Banabeela', title: 'Chief Executive Officer' },
      { id: 'e-a4-2', name: 'Khaled Abanami', title: 'Chief Financial Officer' },
      { id: 'e-a4-3', name: 'Mohammed Al Shammari', title: 'Chief Human Resources Officer' },
    ],
  },
  {
    id: 'a5', name: 'NEOM', industry: 'Smart City / Infrastructure',
    revenue: '$50B+ invested (PIF-funded)', lastQuarterRevenue: 'N/A (development project)',
    headcount: '~9,500', region: 'KSA', hq: 'Tabuk Province, KSA', founded: '2017',
    ticker: 'Private (PIF)', website: 'neom.com',
    tier: 'Strategic', accountManagerId: 'tm1', openDeals: 1, totalAcv: 2100000, lastActivity: '2026-05-02',
    executives: [
      { id: 'e-a5-1', name: 'Eng. Aiman M. Al-Mudaifer', title: 'Managing Director & CEO', linkedin: 'https://linkedin.com/in/aiman-al-mudaifer' },
      { id: 'e-a5-2', name: 'Rayan Mohammed Fayez', title: 'Deputy CEO' },
      { id: 'e-a5-3', name: 'Nader Ashoor', title: 'Chief Financial Officer' },
      { id: 'e-a5-4', name: 'Denis Hickey', title: 'Chief Development Officer' },
      { id: 'e-a5-5', name: 'Dr. Manar Al Moneef', title: 'Chief Investment Officer' },
      { id: 'e-a5-6', name: 'Stefan Ricketts', title: 'Chief Legal Officer' },
    ],
  },
];

export const MOCK_STAKEHOLDERS: Stakeholder[] = [
  { id: 'sk1', accountId: 'a1', name: 'Khalid Al-Rashid', title: 'CTO', role: 'Decision Maker', strength: 1, lastContact: '2026-05-01', email: 'k.alrashid@aramcodigital.com', phone: '+966 50 111 2233', linkedin: 'https://linkedin.com/in/khalid-alrashid', buyingCenter: 'Technology', notes: 'Newly appointed. Came from AWS. Unknown preferences.', department: 'd6' },
  { id: 'sk2', accountId: 'a1', name: 'Sara Al-Otaibi', title: 'VP Engineering', role: 'Champion', strength: 4, lastContact: '2026-04-28', email: 's.alotaibi@aramcodigital.com', phone: '+966 50 222 3344', linkedin: 'https://linkedin.com/in/sara-alotaibi', buyingCenter: 'Technology', notes: 'Attended 5 demos. Strong internal advocate.', department: 'd1' },
  { id: 'sk3', accountId: 'a1', name: 'Mohammed Al-Ghamdi', title: 'CFO', role: 'Decision Maker', strength: 0 as RelationshipStrength, lastContact: 'Never', email: 'm.alghamdi@aramcodigital.com', phone: '+966 50 333 4455', linkedin: '', buyingCenter: 'Finance', notes: 'No relationship established. Required for Stage 4.', department: 'd3' },
  // SABIC (a2)
  { id: 'sk4', accountId: 'a2', name: 'Nora Al-Harbi', title: 'SVP Engineering', role: 'Champion', strength: 4, lastContact: '2026-04-20', email: 'n.alharbi@sabic.com', phone: '+966 55 444 5566', linkedin: 'https://linkedin.com/in/nora-alharbi', buyingCenter: 'Technology', notes: 'Promoted to SVP. Increased influence and budget authority.', department: 'd1' },
  { id: 'sk5', accountId: 'a2', name: 'Salah Al-Hareky', title: 'EVP Corporate Finance', role: 'Decision Maker', strength: 2, lastContact: '2026-04-01', email: 's.alhareky@sabic.com', phone: '+966 55 555 6677', linkedin: 'https://linkedin.com/in/salah-alhareky', buyingCenter: 'Finance', notes: 'Top finance exec. Met once at QBR. Needs further engagement.', department: 'd3' },
  { id: 'sk6', accountId: 'a2', name: 'Omar Al-Zahrani', title: 'Head of IT Infrastructure', role: 'Influencer', strength: 3, lastContact: '2026-04-10', email: 'o.alzahrani@sabic.com', phone: '+966 55 666 7788', linkedin: '', buyingCenter: 'Technology', notes: 'Controls the technical evaluation process. Key influencer.', department: 'd1' },
  // STC Group (a3)
  { id: 'sk7', accountId: 'a3', name: 'Hessa Al-Qahtani', title: 'VP Cloud & AI Services', role: 'Champion', strength: 3, lastContact: '2026-04-22', email: 'h.alqahtani@stc.com.sa', phone: '+966 50 777 8899', linkedin: 'https://linkedin.com/in/hessa-alqahtani', buyingCenter: 'Technology', notes: 'Driving the AI co-development initiative. Strong technical champion.', department: 'd4' },
  { id: 'sk8', accountId: 'a3', name: 'Ameen Alshiddi', title: 'Group CFO', role: 'Decision Maker', strength: 1, lastContact: '2026-03-15', email: 'a.alshiddi@stc.com.sa', phone: '+966 50 888 9900', linkedin: 'https://linkedin.com/in/ameen-alshiddi', buyingCenter: 'Finance', notes: 'CFO since 2016. Not yet engaged on this deal.', department: 'd3' },
  { id: 'sk9', accountId: 'a3', name: 'Faris Al-Mutairi', title: 'Director of Enterprise Partnerships', role: 'Coach', strength: 4, lastContact: '2026-04-25', email: 'f.almutairi@stc.com.sa', phone: '+966 50 999 0011', linkedin: '', buyingCenter: 'Partnerships', notes: 'Knows the internal procurement process well. Helpful coach.', department: 'd4' },
  // Mobily (a4)
  { id: 'sk10', accountId: 'a4', name: 'Layla Al-Amer', title: 'CTO', role: 'Decision Maker', strength: 2, lastContact: '2026-04-05', email: 'l.alamer@mobily.com.sa', phone: '+966 53 111 2233', linkedin: 'https://linkedin.com/in/layla-alamer', buyingCenter: 'Technology', notes: 'New CTO, evaluating all vendor relationships. Critical to engage.', department: 'd6' },
  { id: 'sk11', accountId: 'a4', name: 'Tariq Al-Ghamdi', title: 'Head of Digital Transformation', role: 'Champion', strength: 3, lastContact: '2026-04-18', email: 't.alghamdi@mobily.com.sa', phone: '+966 53 222 3344', linkedin: '', buyingCenter: 'Technology', notes: 'Running the digital transformation program. Wants to move fast.', department: 'd4' },
  { id: 'sk12', accountId: 'a4', name: 'Khaled Abanami', title: 'CFO', role: 'Decision Maker', strength: 1, lastContact: 'Never', email: 'k.abanami@mobily.com.sa', phone: '+966 53 333 4455', linkedin: '', buyingCenter: 'Finance', notes: 'Not engaged yet. Required for deal above SAR 2M.', department: 'd3' },
  // NEOM (a5)
  { id: 'sk13', accountId: 'a5', name: 'Denis Hickey', title: 'Chief Development Officer', role: 'Decision Maker', strength: 2, lastContact: '2026-04-28', email: 'd.hickey@neom.com', phone: '+966 14 111 2233', linkedin: 'https://linkedin.com/in/denis-hickey-neom', buyingCenter: 'Development', notes: 'Controls platform and infrastructure decisions for NEOM build-out.', department: 'd6' },
  { id: 'sk14', accountId: 'a5', name: 'Reem Al-Dosari', title: 'VP Technology & Innovation', role: 'Champion', strength: 4, lastContact: '2026-05-01', email: 'r.aldosari@neom.com', phone: '+966 14 222 3344', linkedin: 'https://linkedin.com/in/reem-aldosari', buyingCenter: 'Technology', notes: 'Strongest internal advocate. Has presented our platform to CDO twice.', department: 'd1' },
  { id: 'sk15', accountId: 'a5', name: 'Nader Ashoor', title: 'CFO', role: 'Decision Maker', strength: 1, lastContact: '2026-03-20', email: 'n.ashoor@neom.com', phone: '+966 14 333 4455', linkedin: '', buyingCenter: 'Finance', notes: 'Controls all vendor spend over $1M. Brief intro at FII conference.', department: 'd3' },
];

export const MOCK_WIKI_ASSETS: WikiAsset[] = [
  { id: 'w1', title: 'FSI Platform Case Study — Gulf Bank', type: 'Case Study', industry: ['Financial Services'], tags: ['data-residency', 'SAMA', 'KSA'], lastUpdated: '2026-02-10', expiresAt: '2026-12-31', description: 'Full deployment case study for a regional bank. Covers data residency compliance, SAMA regulatory alignment, and AI platform rollout.', approved: true },
  { id: 'w2', title: 'Energy Sector Reference Architecture', type: 'Reference Architecture', industry: ['Energy'], tags: ['oil-gas', 'OT-IT', 'edge-compute'], lastUpdated: '2026-01-15', expiresAt: null, description: 'Reference architecture for energy/O&G deployments including OT/IT convergence and edge compute patterns.', approved: true },
  { id: 'w3', title: 'Competitor Battle Card — CloudVision AI', type: 'Battle Card', industry: [], tags: ['competitive', 'AI-platform'], lastUpdated: '2026-03-20', expiresAt: '2026-09-20', description: 'Head-to-head comparison vs. CloudVision AI. Covers pricing, weaknesses, and winning objection-handling scripts.', approved: true },
  { id: 'w4', title: 'Enterprise AI Platform — Standard Proposal Template', type: 'Template', industry: [], tags: ['proposal', 'SOW', 'enterprise'], lastUpdated: '2026-04-01', expiresAt: null, description: 'Base proposal template for enterprise AI platform deals. Includes pricing table, delivery timeline, and SLA section.', approved: true },
  { id: 'w5', title: 'SAMA Regulatory FAQ', type: 'FAQ', industry: ['Financial Services'], tags: ['SAMA', 'compliance', 'KSA', 'data-residency'], lastUpdated: '2026-03-05', expiresAt: '2026-06-05', description: 'Pre-answered FAQ on SAMA compliance, data residency, and audit requirements for FSI prospects in KSA.', approved: true },
  { id: 'w6', title: 'Smart City / NEOM Playbook', type: 'Playbook', industry: ['Smart City', 'Infrastructure'], tags: ['NEOM', 'smart-city', 'giga-project'], lastUpdated: '2026-04-10', expiresAt: null, description: 'Sales playbook for giga-project and smart city deals. Covers stakeholder landscape, procurement process, and differentiation narrative.', approved: true },
];

export const MOCK_MEETING_SUMMARY: MeetingSummary = {
  id: 'ms1',
  accountId: 'a1',
  accountName: 'Aramco Digital',
  meetingTitle: 'Stage 3 Discovery Deep-Dive — Platform Architecture',
  date: '2026-05-02',
  duration: '62 minutes',
  participants: ['Turki Bin Nader (AE)', 'Sara Al-Otaibi (VP Eng)', 'Tariq Bin-Laden (Architect)', 'Priya Nair (SE)'],
  summary: 'Productive architecture review call. Sara confirmed that data residency in KSA is non-negotiable — all processing must remain on-region. Tariq raised concerns about OT/IT integration complexity in their existing environment. We positioned our edge compute pattern as the differentiator; they asked for a reference architecture document. No CFO engagement yet — Sara mentioned the CFO has budget approval authority for deals over SAR 3M. She offered to facilitate an introduction if we can produce a business case document first. Next step is a business case draft + reference architecture by May 14.',
  actionItems: [
    { id: 'ai1', text: 'Send Energy Sector Reference Architecture to Tariq', owner: 'Turki Bin Nader', due: '2026-05-07', checked: false },
    { id: 'ai2', text: 'Draft business case document for CFO presentation', owner: 'Turki Bin Nader', due: '2026-05-14', checked: false },
    { id: 'ai3', text: 'Schedule CFO introduction via Sara', owner: 'Turki Bin Nader', due: '2026-05-14', checked: false },
    { id: 'ai4', text: 'Confirm KSA data residency compliance architecture with SE team', owner: 'Priya Nair', due: '2026-05-09', checked: false },
  ],
  meddic: {
    metrics: 'Reduce platform integration costs by 30%; accelerate AI project delivery by 6 months.',
    economicBuyer: 'CFO (name TBC) — SAR 3M+ approval authority. Not yet engaged.',
    decisionCriteria: 'Data residency (KSA), OT/IT integration capability, vendor support SLA.',
    decisionProcess: 'Technical validation → Business case → CFO approval → Legal/procurement → Contract.',
    identifiedPain: 'OT/IT integration complexity slowing AI deployment. Current approach requires 3rd-party middleware.',
    champion: 'Sara Al-Otaibi (VP Engineering) — strong advocate, offered CFO introduction.',
  },
  status: 'pending',
};

export type ActivityType = 'meeting' | 'signal' | 'stage_change' | 'action_item' | 'email';

export interface ActivityEvent {
  id: string;
  accountId: string;
  type: ActivityType;
  date: string;
  title: string;
  body: string;
  author?: string;
}

export const MOCK_TEAM: TeamMember[] = [
  { id: 'tm1', name: 'Turki Bin Nader',   title: 'Enterprise Account Executive', email: 'turki.binnader@company.com',    region: 'KSA' },
  { id: 'tm2', name: 'Layla Al-Farsi',    title: 'Senior Account Executive',     email: 'layla.alfarsi@company.com',     region: 'KSA' },
  { id: 'tm3', name: 'Khalid Mansouri',   title: 'Account Executive',            email: 'khalid.mansouri@company.com',   region: 'KSA / UAE' },
  { id: 'tm4', name: 'Priya Nair',        title: 'Solutions Engineer',           email: 'priya.nair@company.com',        region: 'KSA' },
  { id: 'tm5', name: 'Omar Barakati',     title: 'Enterprise Account Executive', email: 'omar.barakati@company.com',     region: 'GCC' },
  { id: 'tm6', name: 'Nadia Chokri',      title: 'Customer Success Manager',     email: 'nadia.chokri@company.com',      region: 'KSA / GCC' },
];

export const MOCK_ACTIVITIES: ActivityEvent[] = [
  // Aramco Digital (a1)
  { id: 'ac1', accountId: 'a1', type: 'signal',       date: '2026-05-01', title: 'New CTO appointed',                     body: 'Khalid Al-Rashid named CTO. Prior vendor relationships likely under review.' },
  { id: 'ac2', accountId: 'a1', type: 'meeting',      date: '2026-05-02', title: 'Stage 3 Architecture Deep-Dive',        body: '62-min call. Data residency confirmed non-negotiable. Edge compute positioned as differentiator. CFO intro offered pending business case.', author: 'Turki Bin Nader' },
  { id: 'ac3', accountId: 'a1', type: 'action_item',  date: '2026-05-02', title: 'Reference architecture due May 7',      body: 'Send Energy Sector Reference Architecture to Tariq Bin-Laden.', author: 'Turki Bin Nader' },
  { id: 'ac4', accountId: 'a1', type: 'action_item',  date: '2026-05-02', title: 'Business case due May 14',              body: 'Draft business case for CFO approval (SAR 3M+ threshold).', author: 'Turki Bin Nader' },
  { id: 'ac5', accountId: 'a1', type: 'stage_change', date: '2026-04-15', title: 'Advanced to Stage 3',                   body: 'Moved from Stage 2 (Qualify) after successful technical demo with Sara Al-Otaibi\'s team.', author: 'Turki Bin Nader' },
  { id: 'ac6', accountId: 'a1', type: 'email',        date: '2026-04-20', title: 'Sent platform overview deck',           body: 'Shared 24-slide platform overview and KSA data residency one-pager with Sara.', author: 'Turki Bin Nader' },
  // SABIC (a2)
  { id: 'ac7', accountId: 'a2', type: 'signal',       date: '2026-04-25', title: 'Nora Al-Harbi promoted to SVP',         body: 'Our champion now has greater budget authority. Positive development.' },
  { id: 'ac8', accountId: 'a2', type: 'meeting',      date: '2026-04-15', title: 'Stage 4 Proposal Review',               body: 'Reviewed commercial proposal with Nora. CFO Salah Al-Hareky not yet engaged — required before close.', author: 'Turki Bin Nader' },
  { id: 'ac9', accountId: 'a2', type: 'stage_change', date: '2026-04-01', title: 'Advanced to Stage 4',                   body: 'Proposal submitted and accepted for review.', author: 'Turki Bin Nader' },
  // STC Group (a3)
  { id: 'ac10', accountId: 'a3', type: 'signal',      date: '2026-04-27', title: 'STC partners with hyperscaler for AI', body: 'Co-development agreement announced — directly aligns with our platform pitch.' },
  { id: 'ac11', accountId: 'a3', type: 'email',       date: '2026-04-26', title: 'Sent AI partnership use-case brief',   body: 'Followed up on hyperscaler announcement with a tailored use-case brief.', author: 'Turki Bin Nader' },
  { id: 'ac12', accountId: 'a3', type: 'meeting',     date: '2026-04-10', title: 'Initial discovery call',               body: 'Qualified pain: AI services roadmap blocked by data sovereignty concerns. Champion: Hessa Al-Qahtani.', author: 'Turki Bin Nader' },
  // Mobily (a4)
  { id: 'ac13', accountId: 'a4', type: 'stage_change', date: '2026-04-05', title: 'Advanced to Stage 3',                 body: 'Technical evaluation kicked off with Tariq Al-Ghamdi\'s team.', author: 'Turki Bin Nader' },
  { id: 'ac14', accountId: 'a4', type: 'meeting',      date: '2026-04-01', title: 'Technical evaluation kickoff',        body: 'Mobily team reviewed platform architecture. OT/IT integration raised as a concern — same as Aramco.', author: 'Turki Bin Nader' },
  // NEOM (a5)
  { id: 'ac15', accountId: 'a5', type: 'signal',       date: '2026-04-29', title: '$500M cloud infrastructure approved',  body: 'NEOM board approved major infrastructure investment for 2026-2028.' },
  { id: 'ac16', accountId: 'a5', type: 'meeting',      date: '2026-04-20', title: 'Executive briefing with Denis Hickey', body: 'CDO confirmed NEOM needs a sovereign AI platform. Reem Al-Dosari will champion internally.', author: 'Turki Bin Nader' },
  { id: 'ac17', accountId: 'a5', type: 'email',        date: '2026-05-01', title: 'Sent NEOM playbook and giga-project brief', body: 'Shared smart city playbook and reference architecture tailored to NEOM\'s stated requirements.', author: 'Turki Bin Nader' },
];

// ─── Account Planning Data ────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: 'Platform' | 'AI/Data' | 'Security' | 'Services';
  avgDealSize: number;
  salesCycleDays: number;
  icon: string;
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
  budgetType: 'CAPEX' | 'OPEX' | 'Both';
  typicalRole: 'Decision Maker' | 'Influencer' | 'User';
  budgetWeight: number;
}

export const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Core Platform',           category: 'Platform',  avgDealSize: 800000,  salesCycleDays: 120, icon: '⚙️' },
  { id: 'p2', name: 'AI / ML Services',         category: 'AI/Data',   avgDealSize: 600000,  salesCycleDays: 90,  icon: '🤖' },
  { id: 'p3', name: 'Data Sovereignty Module',  category: 'Security',  avgDealSize: 400000,  salesCycleDays: 60,  icon: '🛡️' },
  { id: 'p4', name: 'Edge Computing',           category: 'Platform',  avgDealSize: 750000,  salesCycleDays: 135, icon: '📡' },
  { id: 'p5', name: 'Managed Services',         category: 'Services',  avgDealSize: 350000,  salesCycleDays: 45,  icon: '🔧' },
  { id: 'p6', name: 'Security & Compliance',    category: 'Security',  avgDealSize: 500000,  salesCycleDays: 75,  icon: '🔒' },
  { id: 'p7', name: 'Analytics & BI',           category: 'AI/Data',   avgDealSize: 450000,  salesCycleDays: 60,  icon: '📊' },
  { id: 'p8', name: 'Professional Services',    category: 'Services',  avgDealSize: 300000,  salesCycleDays: 30,  icon: '👥' },
];

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'IT / Technology',      shortName: 'IT',      budgetType: 'Both',   typicalRole: 'Decision Maker', budgetWeight: 0.95 },
  { id: 'd2', name: 'Operations',           shortName: 'Ops',     budgetType: 'CAPEX',  typicalRole: 'Influencer',     budgetWeight: 0.80 },
  { id: 'd3', name: 'Finance / CFO Office', shortName: 'Finance', budgetType: 'Both',   typicalRole: 'Decision Maker', budgetWeight: 1.00 },
  { id: 'd4', name: 'Digital Innovation',   shortName: 'Digital', budgetType: 'CAPEX',  typicalRole: 'Influencer',     budgetWeight: 0.85 },
  { id: 'd5', name: 'Compliance / Legal',   shortName: 'Legal',   budgetType: 'OPEX',   typicalRole: 'Influencer',     budgetWeight: 0.75 },
  { id: 'd6', name: 'C-Suite / Executive',  shortName: 'C-Suite', budgetType: 'Both',   typicalRole: 'Decision Maker', budgetWeight: 1.00 },
  { id: 'd7', name: 'HR / People',          shortName: 'HR',      budgetType: 'OPEX',   typicalRole: 'User',           budgetWeight: 0.60 },
];

// Product × Department intrinsic fit strength (1–5, 0 = no meaningful fit)
export const PRODUCT_DEPT_FIT: Record<string, Record<string, number>> = {
  p1: { d1: 5, d2: 3, d3: 2, d4: 4, d5: 2, d6: 3, d7: 1 },
  p2: { d1: 4, d2: 3, d3: 3, d4: 5, d5: 2, d6: 4, d7: 2 },
  p3: { d1: 5, d2: 2, d3: 3, d4: 3, d5: 5, d6: 4, d7: 2 },
  p4: { d1: 4, d2: 5, d3: 1, d4: 3, d5: 1, d6: 2, d7: 1 },
  p5: { d1: 5, d2: 4, d3: 2, d4: 3, d5: 3, d6: 2, d7: 1 },
  p6: { d1: 5, d2: 3, d3: 3, d4: 2, d5: 5, d6: 4, d7: 2 },
  p7: { d1: 3, d2: 4, d3: 5, d4: 4, d5: 3, d6: 5, d7: 3 },
  p8: { d1: 4, d2: 3, d3: 2, d4: 4, d5: 3, d6: 3, d7: 2 },
};
