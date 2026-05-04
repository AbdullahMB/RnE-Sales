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
}

export interface AccountExecutive {
  id: string;
  name: string;
  title: string;
  photoUrl?: string;
  linkedin?: string;
  email?: string;
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
  tier: 'Strategic' | 'Enterprise' | 'Mid-Market';
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
  { id: 'd2', accountName: 'SABIC Cloud', accountId: 'a2', stage: 'Stage 4', acv: 480000, closeDate: '2026-05-31', daysSinceActivity: 18, risk: 'high', owner: 'Turki Bin Nader' },
  { id: 'd3', accountName: 'STC Solutions', accountId: 'a3', stage: 'Stage 2', acv: 750000, closeDate: '2026-07-31', daysSinceActivity: 7, risk: 'low', owner: 'Turki Bin Nader' },
  { id: 'd4', accountName: 'Mobily Enterprise', accountId: 'a4', stage: 'Stage 3', acv: 320000, closeDate: '2026-06-15', daysSinceActivity: 22, risk: 'high', owner: 'Turki Bin Nader' },
  { id: 'd5', accountName: 'NEOM TechCo', accountId: 'a5', stage: 'Stage 1', acv: 2100000, closeDate: '2026-09-30', daysSinceActivity: 1, risk: 'low', owner: 'Turki Bin Nader' },
];

export const MOCK_SIGNALS: Signal[] = [
  { id: 's1', accountId: 'a1', accountName: 'Aramco Digital', type: 'leadership', title: 'New CTO appointed', summary: 'Aramco Digital named Khalid Al-Rashid as CTO, replacing Ahmed Hassan who moved to parent company.', date: '2026-05-01' },
  { id: 's2', accountId: 'a5', accountName: 'NEOM TechCo', type: 'funding', title: '$500M cloud infrastructure budget approved', summary: 'NEOM announced a major infrastructure investment cycle for 2026–2028 in their latest board filing.', date: '2026-04-29' },
  { id: 's3', accountId: 'a3', accountName: 'STC Solutions', type: 'news', title: 'STC partners with hyperscaler for AI services', summary: 'STC announced a co-development agreement for enterprise AI services — directly relevant to our platform pitch.', date: '2026-04-27' },
  { id: 's4', accountId: 'a2', accountName: 'SABIC Cloud', type: 'leadership', title: 'VP Engineering promoted to SVP', summary: 'Internal promotion at SABIC. Our champion is now SVP — increase in influence and budget authority.', date: '2026-04-25' },
];

export const MOCK_TASKS: SuggestedTask[] = [
  { id: 't1', dealId: 'd2', accountName: 'SABIC Cloud', action: 'Follow up with CFO on Stage 4 approval', reason: 'Deal is at Stage 4 with no CFO contact in 18 days. Required for close.', priority: 'high' },
  { id: 't2', dealId: 'd4', accountName: 'Mobily Enterprise', action: 'Send FSI case study to technical team', reason: 'Technical evaluation stalled. Similar deals unblocked with reference architecture.', priority: 'high' },
  { id: 't3', dealId: 'd1', accountName: 'Aramco Digital', action: 'Schedule intro with new CTO Khalid Al-Rashid', reason: 'Leadership change detected. New CTO is likely reassessing vendor relationships.', priority: 'medium' },
  { id: 't4', dealId: 'd3', accountName: 'STC Solutions', action: 'Send AI partnership reference architecture', reason: 'STC announced an AI co-development deal — align our platform pitch to their new strategic direction.', priority: 'medium' },
];

export const MOCK_ACCOUNTS: Account[] = [
  { id: 'a1', name: 'Aramco Digital', industry: 'Energy / Oil & Gas', revenue: '$40B+', headcount: '5,000+', region: 'KSA', tier: 'Strategic', openDeals: 1, totalAcv: 1200000, lastActivity: '2026-05-01' },
  { id: 'a2', name: 'SABIC Cloud', industry: 'Petrochemicals', revenue: '$30B+', headcount: '3,500+', region: 'KSA', tier: 'Strategic', openDeals: 1, totalAcv: 480000, lastActivity: '2026-04-15' },
  { id: 'a3', name: 'STC Solutions', industry: 'Telecom', revenue: '$15B+', headcount: '8,000+', region: 'KSA', tier: 'Enterprise', openDeals: 1, totalAcv: 750000, lastActivity: '2026-04-26' },
  { id: 'a4', name: 'Mobily Enterprise', industry: 'Telecom', revenue: '$5B+', headcount: '2,000+', region: 'KSA', tier: 'Enterprise', openDeals: 1, totalAcv: 320000, lastActivity: '2026-04-11' },
  { id: 'a5', name: 'NEOM TechCo', industry: 'Smart City / Infrastructure', revenue: 'N/A', headcount: '1,000+', region: 'KSA', tier: 'Strategic', openDeals: 1, totalAcv: 2100000, lastActivity: '2026-05-02' },
];

export const MOCK_STAKEHOLDERS: Stakeholder[] = [
  { id: 'sk1', accountId: 'a1', name: 'Khalid Al-Rashid', title: 'CTO', role: 'Decision Maker', strength: 1, lastContact: '2026-05-01', email: 'k.alrashid@aramcodigital.com', phone: '+966 50 111 2233', linkedin: 'https://linkedin.com/in/khalid-alrashid', buyingCenter: 'Technology', notes: 'Newly appointed. Came from AWS. Unknown preferences.' },
  { id: 'sk2', accountId: 'a1', name: 'Sara Al-Otaibi', title: 'VP Engineering', role: 'Champion', strength: 4, lastContact: '2026-04-28', email: 's.alotaibi@aramcodigital.com', phone: '+966 50 222 3344', linkedin: 'https://linkedin.com/in/sara-alotaibi', buyingCenter: 'Technology', notes: 'Attended 5 demos. Strong internal advocate.' },
  { id: 'sk3', accountId: 'a1', name: 'Mohammed Al-Ghamdi', title: 'CFO', role: 'Decision Maker', strength: 0 as RelationshipStrength, lastContact: 'Never', email: 'm.alghamdi@aramcodigital.com', phone: '+966 50 333 4455', linkedin: '', buyingCenter: 'Finance', notes: 'No relationship established. Required for Stage 4.' },
  { id: 'sk4', accountId: 'a2', name: 'Nora Al-Harbi', title: 'SVP Engineering', role: 'Champion', strength: 4, lastContact: '2026-04-20', email: 'n.alharbi@sabiccloud.com', phone: '+966 55 444 5566', linkedin: 'https://linkedin.com/in/nora-alharbi', buyingCenter: 'Technology', notes: 'Promoted to SVP. Increased influence.' },
  { id: 'sk5', accountId: 'a2', name: 'Fahad Al-Dossari', title: 'CFO', role: 'Decision Maker', strength: 2, lastContact: '2026-04-01', email: 'f.aldossari@sabiccloud.com', phone: '+966 55 555 6677', linkedin: 'https://linkedin.com/in/fahad-aldossari', buyingCenter: 'Finance', notes: 'Met once at QBR. Needs further engagement.' },
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
