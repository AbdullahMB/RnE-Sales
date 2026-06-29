export type DealStage = 'Qualification' | 'Develop Proposal' | 'Submit Proposal' | 'Negotiate' | 'Won' | 'Lost' | 'Dropped';
export type RiskLevel = 'low' | 'medium' | 'high';
export type StakeholderRole = 'Decision Maker' | 'Champion' | 'Influencer' | 'Blocker' | 'Coach';
export type RelationshipStrength = 1 | 2 | 3 | 4 | 5;

export interface Deal {
  id: string;
  title: string;
  accountName: string;      // customer display name
  accountId: string;
  customer: string;         // customer short name (from CRM)
  subSector: string;
  stage: DealStage;
  acv: number;
  probability: number;      // 0–100
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
  // ── Won ─────────────────────────────────────────────────────────────────────
  { id: 'd1',  title: 'AI Program',                                        accountName: 'MiM',           accountId: 'a11', customer: 'MiM',          subSector: 'Mining',                   stage: 'Won',             acv: 17399904, probability: 100, closeDate: '2026-03-31', daysSinceActivity: 45,  risk: 'low',    owner: 'H. Muneef' },
  // ── Active ──────────────────────────────────────────────────────────────────
  { id: 'd2',  title: 'Sabic Program',                                     accountName: 'SABIC',         accountId: 'a2',  customer: 'Sabic',        subSector: 'Industrial Manufacturing', stage: 'Qualification',   acv: 20000000, probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 12,  risk: 'medium', owner: 'T. Nader' },
  { id: 'd3',  title: 'Energy LLM',                                        accountName: 'Aramco',        accountId: 'a1',  customer: 'Aramco',       subSector: 'Energy',                   stage: 'Qualification',   acv: 25000000, probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 8,   risk: 'medium', owner: 'A. Almeer' },
  { id: 'd4',  title: 'Safety Opt',                                        accountName: 'Aramco',        accountId: 'a1',  customer: 'Aramco',       subSector: 'Energy',                   stage: 'Qualification',   acv: 15000000, probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 15,  risk: 'medium', owner: 'Y. Alanazi' },
  { id: 'd5',  title: 'ASMO — Agentic Platform RFP',                       accountName: 'ASMO',          accountId: 'a6',  customer: 'ASMO',         subSector: 'Energy',                   stage: 'Develop Proposal',acv: 12000000, probability: 40,  closeDate: '2026-09-30', daysSinceActivity: 5,   risk: 'medium', owner: 'A. Almeer' },
  { id: 'd6',  title: 'AI and Emerging Technologies in Waste Management',  accountName: 'MWAN',          accountId: 'a7',  customer: 'MWAN',         subSector: 'Energy',                   stage: 'Submit Proposal', acv: 2000000,  probability: 50,  closeDate: '2026-08-31', daysSinceActivity: 3,   risk: 'low',    owner: 'B. Alawfi' },
  { id: 'd7',  title: 'Sport Solutions',                                   accountName: 'Aramco Sports', accountId: 'a13', customer: 'Aramco Sports', subSector: 'Energy',                   stage: 'Qualification',   acv: 9000000,  probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 20,  risk: 'medium', owner: 'A. Almeer' },
  { id: 'd8',  title: 'Industrial Cloud',                                  accountName: 'Aramco Digital',accountId: 'a1',  customer: 'Aramco Digital',subSector: 'Energy',                   stage: 'Qualification',   acv: 8000000,  probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 10,  risk: 'medium', owner: 'A. Almeer' },
  { id: 'd9',  title: 'AI Solution Hosting on Sovereign Cloud',            accountName: 'Aramco',        accountId: 'a1',  customer: 'Aramco',       subSector: 'Energy',                   stage: 'Develop Proposal',acv: 2800000,  probability: 40,  closeDate: '2026-09-30', daysSinceActivity: 7,   risk: 'medium', owner: 'A. Almeer' },
  { id: 'd10', title: 'SLB Infra & Compute',                               accountName: 'Aramco',        accountId: 'a1',  customer: 'Aramco',       subSector: 'Energy',                   stage: 'Qualification',   acv: 3000000,  probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 25,  risk: 'high',   owner: 'Y. Alanazi' },
  { id: 'd11', title: 'Reservoir Simulation Agent',                        accountName: 'Aramco',        accountId: 'a1',  customer: 'Aramco',       subSector: 'Energy',                   stage: 'Qualification',   acv: 7000000,  probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 9,   risk: 'medium', owner: 'A. Almeer' },
  { id: 'd12', title: 'Energy AI Assistant',                               accountName: 'MoE',           accountId: 'a8',  customer: 'MoE',          subSector: 'Energy',                   stage: 'Qualification',   acv: 20000000, probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 30,  risk: 'high',   owner: 'A. Almeer' },
  { id: 'd13', title: 'P&ID Agent',                                        accountName: 'Aramco',        accountId: 'a1',  customer: 'Aramco',       subSector: 'Energy',                   stage: 'Qualification',   acv: 5000000,  probability: 20,  closeDate: '2026-12-31', daysSinceActivity: 14,  risk: 'medium', owner: 'Y. Alanazi' },
  { id: 'd14', title: 'MEWA — Humain Brain',                               accountName: 'MEWA',          accountId: 'a9',  customer: 'MEWA',         subSector: 'Utilities & Services',     stage: 'Qualification',   acv: 3000000,  probability: 40,  closeDate: '2026-10-31', daysSinceActivity: 18,  risk: 'medium', owner: 'A. Almeer' },
  // ── Closed ──────────────────────────────────────────────────────────────────
  { id: 'd15', title: 'Agentic Advanced Artificial Intelligence Products Platform', accountName: 'SWA', accountId: 'a10', customer: 'SWA',  subSector: 'Energy',                   stage: 'Lost',            acv: 14283318, probability: 0,   closeDate: '2026-05-01', daysSinceActivity: 60,  risk: 'high',   owner: 'B. Alawfi' },
  { id: 'd16', title: 'Intelligent Factory',                               accountName: 'MiM',           accountId: 'a11', customer: 'MiM',          subSector: 'Mining',                   stage: 'Dropped',         acv: 900000,   probability: 0,   closeDate: '2026-04-15', daysSinceActivity: 75,  risk: 'high',   owner: 'B. Alawfi' },
];

export const MOCK_SIGNALS: Signal[] = [
  { id: 's1', accountId: 'a1', accountName: 'Aramco Digital', type: 'leadership', title: 'New CTO appointed', summary: 'Aramco Digital named Khalid Al-Rashid as CTO, replacing Ahmed Hassan who moved to parent company.', date: '2026-05-01' },
  { id: 's2', accountId: 'a5', accountName: 'NEOM', type: 'funding', title: 'SAR 1.9B cloud infrastructure budget approved', summary: 'NEOM announced a major infrastructure investment cycle for 2026–2028 in their latest board filing.', date: '2026-04-29' },
  { id: 's3', accountId: 'a3', accountName: 'STC Group', type: 'news', title: 'STC partners with hyperscaler for AI services', summary: 'STC announced a co-development agreement for enterprise AI services — directly relevant to our platform pitch.', date: '2026-04-27' },
  { id: 's4', accountId: 'a2', accountName: 'SABIC', type: 'leadership', title: 'VP Engineering promoted to SVP', summary: 'Internal promotion at SABIC. Our champion is now SVP — increase in influence and budget authority.', date: '2026-04-25' },
];

export const MOCK_TASKS: SuggestedTask[] = [
  { id: 't1',  dealId: 'd2',  accountName: 'SABIC',         action: 'Engage SABIC technical leadership on Sabic Program scope', reason: 'Deal at Qualification with no senior stakeholder engagement in 12 days.', priority: 'high' },
  { id: 't2',  dealId: 'd10', accountName: 'Aramco',        action: 'Re-engage Aramco on SLB Infra — 25 days idle', reason: 'No activity in 25 days. Risk of deal going cold.', priority: 'high' },
  { id: 't3',  dealId: 'd12', accountName: 'MoE',           action: 'Schedule executive briefing on Energy AI Assistant', reason: '30-day idle on a SAR 20M deal. Requires C-level outreach to revive.', priority: 'high' },
  { id: 't4',  dealId: 'd4',  accountName: 'Aramco',        action: 'Follow up on Safety Opt evaluation status', reason: '15-day idle. Technical review may have stalled — confirm status with champion.', priority: 'medium' },
  { id: 't5',  dealId: 'd5',  accountName: 'ASMO',          action: 'Complete Agentic Platform RFP response', reason: 'Develop Proposal stage — RFP deadline approaching.', priority: 'high' },
  { id: 't6',  dealId: 'd7',  accountName: 'Aramco Sports', action: 'Identify and engage champion for Sport Solutions', reason: 'No stakeholder mapped. Deal at risk of stalling at Qualification.', priority: 'medium' },
  { id: 't7',  dealId: 'd14', accountName: 'MEWA',          action: 'Advance MEWA — Humain Brain to next stage', reason: '18-day idle on a deal at 40% probability — keep momentum.', priority: 'medium' },
];

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'a1', name: 'Aramco Digital', industry: 'Energy / Digital Infrastructure',
    revenue: 'Subsidiary (Saudi Aramco: SAR 1.65T+)', lastQuarterRevenue: 'Not disclosed',
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
    revenue: 'SAR 139.9B (FY2024)', lastQuarterRevenue: '~SAR 34.5B (Q4 2024)',
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
    revenue: 'SAR 75.8B (FY2024, record)', lastQuarterRevenue: '~SAR 19.1B (Q4 2024)',
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
    revenue: 'SAR 18.2B (FY2024, record)', lastQuarterRevenue: '~SAR 4.7B (Q4 2024)',
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
    revenue: 'SAR 187.5B+ invested (PIF-funded)', lastQuarterRevenue: 'N/A (development project)',
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
  {
    id: 'a6', name: 'ASMO', industry: 'Energy / Standards',
    revenue: 'Government Authority', headcount: '~500', region: 'KSA', hq: 'Riyadh, KSA', founded: '2000',
    website: 'asmo.gov.sa', tier: 'Strategic', accountManagerId: 'tm1', openDeals: 1, totalAcv: 12000000, lastActivity: '2026-05-20',
  },
  {
    id: 'a7', name: 'MWAN', industry: 'Infrastructure / Waste Management',
    revenue: 'Government Authority', headcount: '~300', region: 'KSA', hq: 'Riyadh, KSA', founded: '2018',
    website: 'mwan.gov.sa', tier: 'Enterprise', accountManagerId: 'tm2', openDeals: 1, totalAcv: 2000000, lastActivity: '2026-06-01',
  },
  {
    id: 'a8', name: 'Ministry of Energy (MoE)', industry: 'Energy',
    revenue: 'Government Ministry', headcount: '~5,000', region: 'KSA', hq: 'Riyadh, KSA', founded: '1975',
    website: 'moenergy.gov.sa', tier: 'Strategic', accountManagerId: 'tm1', openDeals: 1, totalAcv: 20000000, lastActivity: '2026-05-01',
  },
  {
    id: 'a9', name: 'MEWA', industry: 'Infrastructure / Utilities',
    revenue: 'Government Ministry', headcount: '~8,000', region: 'KSA', hq: 'Riyadh, KSA', founded: '2001',
    website: 'mewa.gov.sa', tier: 'Strategic', accountManagerId: 'tm1', openDeals: 1, totalAcv: 3000000, lastActivity: '2026-05-05',
  },
  {
    id: 'a10', name: 'Saudi Water Authority (SWA)', industry: 'Infrastructure / Utilities',
    revenue: 'Government Authority', headcount: '~3,000', region: 'KSA', hq: 'Riyadh, KSA', founded: '2018',
    website: 'swa.gov.sa', tier: 'Strategic', accountManagerId: 'tm2', openDeals: 0, totalAcv: 0, lastActivity: '2026-04-01',
  },
  {
    id: 'a11', name: 'MiM', industry: 'Mining / Industrial',
    revenue: 'Not disclosed', headcount: '~1,000', region: 'KSA', hq: 'KSA', founded: '2010',
    tier: 'Enterprise', accountManagerId: 'tm3', openDeals: 0, totalAcv: 17399904, lastActivity: '2026-03-31',
  },
  {
    id: 'a13', name: 'Aramco Sports', industry: 'Energy / Sports',
    revenue: 'Subsidiary (Saudi Aramco)', headcount: '~200', region: 'KSA', hq: 'Dhahran, KSA', founded: '2021',
    website: 'aramcosports.com', tier: 'Enterprise', accountManagerId: 'tm1', openDeals: 1, totalAcv: 9000000, lastActivity: '2026-05-10',
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
  { id: 'sk15', accountId: 'a5', name: 'Nader Ashoor', title: 'CFO', role: 'Decision Maker', strength: 1, lastContact: '2026-03-20', email: 'n.ashoor@neom.com', phone: '+966 14 333 4455', linkedin: '', buyingCenter: 'Finance', notes: 'Controls all vendor spend over SAR 1M. Brief intro at FII conference.', department: 'd3' },
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
  accountId: 'a2',
  accountName: 'SABIC',
  meetingTitle: 'Stage 4 Commercial Review — Proposal Walkthrough with Finance',
  date: '2026-05-12',
  duration: '54 minutes',
  participants: ['Turki Bin Nader (AE)', 'Nora Al-Harbi (SVP Eng, Champion)', 'Salah Al-Hareky (EVP Corporate Finance)', 'Omar Al-Zahrani (Head of IT Infra)'],
  summary: 'Strong commercial review following Nora\'s promotion to SVP. She facilitated the long-awaited introduction to Salah Al-Hareky (EVP Corporate Finance), who reviewed the SAR 20M proposal and asked for a 3-year ROI/TCO comparison against the incumbent platform before he can take it to the board. Omar confirmed technical validation is nearly complete but flagged that security sign-off is still pending from his infrastructure team — this is now the critical path for procurement. Salah also requested the commercial proposal be restructured with milestone-based payment terms. Agreed plan: deliver the ROI/TCO model and revised proposal by May 19, close out security sign-off by May 16, and target procurement kickoff for the week of May 26.',
  actionItems: [
    { id: 'ai1', text: 'Build 3-year ROI/TCO comparison model vs. incumbent for Salah Al-Hareky', owner: 'Turki Bin Nader', due: '2026-05-19', checked: false },
    { id: 'ai2', text: 'Complete security sign-off documentation with Omar\'s infrastructure team', owner: 'Priya Nair', due: '2026-05-16', checked: false },
    { id: 'ai3', text: 'Revise commercial proposal with milestone-based payment terms', owner: 'Turki Bin Nader', due: '2026-05-19', checked: false },
    { id: 'ai4', text: 'Schedule procurement kickoff call with finance and infrastructure teams', owner: 'Turki Bin Nader', due: '2026-05-26', checked: false },
  ],
  meddic: {
    metrics: 'Target 22% TCO reduction vs. incumbent over 3 years; SAR 20M program value.',
    economicBuyer: 'Salah Al-Hareky (EVP Corporate Finance) — newly engaged via Nora\'s introduction. Requires 3-year ROI/TCO model before board approval.',
    decisionCriteria: 'TCO vs. incumbent platform, security/infrastructure sign-off, milestone-based payment structure.',
    decisionProcess: 'Technical validation → Security sign-off → Finance ROI review → Procurement → Contract execution.',
    identifiedPain: 'Rising integration costs with incumbent platform; security review backlog delaying rollout timelines.',
    champion: 'Nora Al-Harbi (SVP Engineering, recently promoted) — facilitated CFO-level introduction, strong internal advocate.',
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
  { id: 'tm1', name: 'Hissah',     title: 'Sales Director',               email: 'hissah@company.com',       region: 'KSA' },
  { id: 'tm2', name: 'Abdullah',   title: 'Senior Account Executive',     email: 'abdullah@company.com',     region: 'KSA' },
  { id: 'tm3', name: 'Abdulaziz',  title: 'Enterprise Account Executive', email: 'abdulaziz@company.com',    region: 'KSA' },
  { id: 'tm4', name: 'Yasir',      title: 'Account Executive',            email: 'yasir@company.com',        region: 'KSA' },
  { id: 'tm5', name: 'Turki',      title: 'Account Executive',            email: 'turki@company.com',        region: 'KSA' },
  { id: 'tm6', name: 'Ghadeer',    title: 'Account Executive',            email: 'ghadeer@company.com',      region: 'KSA' },
  { id: 'tm7', name: 'Sara',       title: 'Solutions Consultant',         email: 'sara@company.com',         region: 'KSA' },
  { id: 'tm8', name: 'Basmah',     title: 'Customer Success Manager',     email: 'basmah@company.com',       region: 'KSA' },
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
  { id: 'ac15', accountId: 'a5', type: 'signal',       date: '2026-04-29', title: 'SAR 1.9B cloud infrastructure approved',  body: 'NEOM board approved major infrastructure investment for 2026-2028.' },
  { id: 'ac16', accountId: 'a5', type: 'meeting',      date: '2026-04-20', title: 'Executive briefing with Denis Hickey', body: 'CDO confirmed NEOM needs a sovereign AI platform. Reem Al-Dosari will champion internally.', author: 'Turki Bin Nader' },
  { id: 'ac17', accountId: 'a5', type: 'email',        date: '2026-05-01', title: 'Sent NEOM playbook and giga-project brief', body: 'Shared smart city playbook and reference architecture tailored to NEOM\'s stated requirements.', author: 'Turki Bin Nader' },
  // SABIC (a2) — Stage 4 commercial review update
  { id: 'ac18', accountId: 'a2', type: 'meeting',      date: '2026-05-12', title: 'Stage 4 Commercial Review — Proposal Walkthrough with Finance', body: 'Nora facilitated intro to EVP Finance Salah Al-Hareky. He requested a 3-year ROI/TCO model and milestone-based payment terms before board approval. Omar flagged security sign-off as the critical path.', author: 'Turki Bin Nader' },
  { id: 'ac19', accountId: 'a2', type: 'action_item',  date: '2026-05-12', title: 'ROI/TCO model due May 19',              body: 'Build 3-year ROI/TCO comparison vs. incumbent for Salah Al-Hareky.', author: 'Turki Bin Nader' },
  { id: 'ac20', accountId: 'a2', type: 'action_item',  date: '2026-05-12', title: 'Security sign-off due May 16',          body: 'Complete security sign-off documentation with Omar Al-Zahrani\'s infrastructure team.', author: 'Priya Nair' },
  { id: 'ac21', accountId: 'a2', type: 'action_item',  date: '2026-05-12', title: 'Procurement kickoff targeted for May 26', body: 'Schedule procurement kickoff call with finance and infrastructure teams once ROI model and sign-off are complete.', author: 'Turki Bin Nader' },
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
  { id: 'p1', name: 'HUMAIN ONE',                category: 'Platform',  avgDealSize: 800000,  salesCycleDays: 120, icon: '🧠' },
  { id: 'p2', name: 'HUMAIN Chat (Enterprise)',  category: 'AI/Data',   avgDealSize: 600000,  salesCycleDays: 90,  icon: '💬' },
  { id: 'p3', name: 'Sovereign AI Cloud',        category: 'Security',  avgDealSize: 400000,  salesCycleDays: 60,  icon: '🛡️' },
  { id: 'p4', name: 'HUMAIN Compute',            category: 'Platform',  avgDealSize: 750000,  salesCycleDays: 135, icon: '🖥️' },
  { id: 'p5', name: 'Managed AI Operations',     category: 'Services',  avgDealSize: 350000,  salesCycleDays: 45,  icon: '🔧' },
  { id: 'p6', name: 'AI Governance & Security',  category: 'Security',  avgDealSize: 500000,  salesCycleDays: 75,  icon: '🔒' },
  { id: 'p7', name: 'ALLAM Models & Analytics',  category: 'AI/Data',   avgDealSize: 450000,  salesCycleDays: 60,  icon: '📊' },
  { id: 'p8', name: 'AI Advisory Services',      category: 'Services',  avgDealSize: 300000,  salesCycleDays: 30,  icon: '👥' },
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
