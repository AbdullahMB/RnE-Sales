import {
  MOCK_ACCOUNTS,
  MOCK_DEALS,
  MOCK_STAKEHOLDERS,
  MOCK_ACTIVITIES,
  type Account,
} from './mock-data';

// ─── Shared helpers ──────────────────────────────────────────────────────────

export function getAccountById(id: string): Account | undefined {
  return MOCK_ACCOUNTS.find((a) => a.id === id);
}

export function getDealForAccount(accountId: string) {
  return MOCK_DEALS.find((d) => d.accountId === accountId);
}

export function getStakeholdersForAccount(accountId: string) {
  return MOCK_STAKEHOLDERS.filter((s) => s.accountId === accountId);
}

export function getActivitiesForAccount(accountId: string) {
  return MOCK_ACTIVITIES.filter((a) => a.accountId === accountId);
}

// Maps stage names to a numeric depth for scoring
function stageDepth(stage: string | undefined): number {
  const map: Record<string, number> = {
    'Qualification':    1,
    'Develop Proposal': 2,
    'Submit Proposal':  3,
    'Negotiate':        4,
    'Won':              5,
  };
  return stage ? (map[stage] ?? 0) : 0;
}

// ─── Proposal Readiness Agent ─────────────────────────────────────────────────

export type ProposalStatus = 'Ready for Proposal' | 'Needs More Discovery' | 'High Risk';

export interface ProposalReadinessInsight {
  score: number;
  status: ProposalStatus;
  missingInformation: string[];
  recommendedNextActions: string[];
  suggestedProposalStructure: string[];
}

export function getProposalReadiness(accountId: string): ProposalReadinessInsight {
  const deal = getDealForAccount(accountId);
  const stakeholders = getStakeholdersForAccount(accountId);
  const activities = getActivitiesForAccount(accountId);

  const hasCFO = stakeholders.some(
    (s) => s.title.toLowerCase().includes('cfo') && s.strength >= 2
  );
  const hasChampion = stakeholders.some((s) => s.role === 'Champion' && s.strength >= 3);
  const hasDecisionMaker = stakeholders.some(
    (s) => s.role === 'Decision Maker' && s.strength >= 2
  );
  const hasMeeting = activities.some((a) => a.type === 'meeting');
  const depth = stageDepth(deal?.stage);

  let score = 20;
  if (hasCFO) score += 20;
  if (hasChampion) score += 20;
  if (hasDecisionMaker) score += 15;
  if (hasMeeting) score += 15;
  if (depth >= 3) score += 10;

  const status: ProposalStatus =
    score >= 75 ? 'Ready for Proposal' : score >= 45 ? 'Needs More Discovery' : 'High Risk';

  const missingInformation: string[] = [];
  if (!hasCFO) missingInformation.push('CFO / Economic Buyer not yet engaged');
  if (!hasChampion) missingInformation.push('No confirmed internal champion');
  if (!hasDecisionMaker) missingInformation.push('Decision maker relationship too weak');
  if (depth < 3) missingInformation.push('Deal not yet at Submit Proposal — discovery incomplete');
  if (!activities.some((a) => a.type === 'email'))
    missingInformation.push('No formal follow-up email thread on record');

  const recommendedNextActions: string[] = [];
  if (!hasCFO)
    recommendedNextActions.push('Secure CFO introduction via champion before proposal submission');
  if (!hasChampion)
    recommendedNextActions.push('Identify and deepen relationship with an internal champion');
  recommendedNextActions.push('Draft one-page business case to anchor financial justification');
  recommendedNextActions.push('Confirm technical requirements with Solutions Engineer');
  if (depth < 4)
    recommendedNextActions.push('Advance deal to Negotiate stage before submitting formal proposal');

  const suggestedProposalStructure = [
    '1. Executive Summary — Strategic alignment with client priorities',
    '2. Problem Statement — Pain points identified during discovery',
    '3. Proposed Solution — HUMAIN platform capabilities mapped to needs',
    '4. Technical Architecture — KSA data residency & integration approach',
    '5. Implementation Timeline — Phased delivery with milestones',
    '6. Commercial Summary — Pricing, ACV, and payment terms',
    '7. Success Metrics — Agreed KPIs and measurement framework',
    '8. References & Case Studies — Relevant regional deployments',
    '9. Next Steps — Signature process and onboarding overview',
  ];

  return { score, status, missingInformation, recommendedNextActions, suggestedProposalStructure };
}

// ─── PoC Scoping Agent ────────────────────────────────────────────────────────

export interface PocScopingInsight {
  recommendedObjective: string;
  inScope: string[];
  outOfScope: string[];
  clientInputsRequired: string[];
  internalDependencies: string[];
  successCriteria: string[];
  technicalHandoverSummary: string;
}

export function getPocScoping(accountId: string): PocScopingInsight {
  const account = getAccountById(accountId);
  const activities = getActivitiesForAccount(accountId);
  const deal = getDealForAccount(accountId);

  const isTelecom = account?.industry.toLowerCase().includes('telecom');
  const isEnergy = account?.industry.toLowerCase().includes('energy');
  const isSmartCity = account?.industry.toLowerCase().includes('smart city');

  const domainContext = isTelecom
    ? 'AI-powered network analytics and customer experience platform'
    : isEnergy
    ? 'edge AI and OT/IT integration platform for industrial operations'
    : isSmartCity
    ? 'sovereign AI platform for smart city data orchestration'
    : 'enterprise AI platform';

  const meetingNote = activities.find((a) => a.type === 'meeting')?.body ?? '';
  const depth = stageDepth(deal?.stage);

  return {
    recommendedObjective: `Validate HUMAIN's ${domainContext} against ${account?.name ?? 'client'}'s core technical and compliance requirements within a 6-week PoC sprint.`,
    inScope: [
      `KSA data residency compliance validation`,
      `Core AI model deployment on ${account?.name ?? 'client'} infrastructure`,
      `Integration with one existing data source (read-only)`,
      isTelecom ? 'Network analytics dashboard — 30-day data sample' : isEnergy ? 'OT/IT edge compute pattern demo' : 'Smart city data orchestration prototype',
      'Platform security and access control review',
      'Performance benchmarking on agreed KPIs',
    ],
    outOfScope: [
      'Full production data migration',
      'Multi-system integrations beyond agreed scope',
      'Custom model training on client proprietary data',
      'SLA-bound support commitments during PoC',
      'Commercial licensing negotiations',
    ],
    clientInputsRequired: [
      'Access to sandbox / non-production environment',
      'Sample dataset (anonymised) — minimum 90-day window',
      'Nominated technical point of contact for daily standups',
      'Approved user accounts for PoC platform access (5–10 users)',
      meetingNote.includes('data residency')
        ? 'Written confirmation of data classification requirements'
        : 'IT security policy documentation for network access',
    ],
    internalDependencies: [
      'Solutions Engineer assigned and briefed (Priya Nair)',
      'PoC environment provisioned in KSA region',
      'Product team sign-off on custom integration patterns',
      'Legal: NDA and PoC agreement executed before kick-off',
      'CSM assigned for onboarding support',
    ],
    successCriteria: [
      'Platform deployed and accessible within 5 business days',
      'Data residency compliance confirmed by client IT team',
      isTelecom
        ? 'Network analytics latency < 200ms on agreed queries'
        : isEnergy
        ? 'OT/IT edge compute pattern demonstrated with < 50ms round-trip'
        : 'Data orchestration pipeline processing > 1,000 events/second',
      'Zero critical security findings in client security review',
      'Champion (and ideally economic buyer) sign-off on PoC results',
      `Deal progresses to ${depth >= 4 ? 'Won' : depth >= 3 ? 'Negotiate' : 'Submit Proposal'} stage within 2 weeks of PoC close`,
    ],
    technicalHandoverSummary: `PoC will be delivered by ${account?.name ?? 'client'}'s assigned Solutions Engineer with support from the HUMAIN platform team. All environments will be provisioned in-region (KSA). Post-PoC, a technical findings report will be produced covering architecture decisions, security posture, integration patterns, and recommended production sizing. Handover package includes: PoC runbook, architecture diagram, benchmark results, and recommended production BOM.`,
  };
}

// ─── Account Strategy Agent ───────────────────────────────────────────────────

export type AccountPriority = 'P1 — Critical' | 'P2 — High' | 'P3 — Standard';

export interface ActionPlanItem {
  action: string;
  owner: string;
}

export interface RiskItem {
  risk: string;
  mitigation: string;
}

export interface AccountStrategyInsight {
  accountPriority: AccountPriority;
  strategicRationale: string;
  keyRelationshipGaps: string[];
  recommendedPositioning: string;
  actionPlan: {
    thirtyDay: ActionPlanItem[];
    sixtyDay: ActionPlanItem[];
    ninetyDay: ActionPlanItem[];
  };
  risksAndMitigation: RiskItem[];
}

export function getAccountStrategy(accountId: string): AccountStrategyInsight {
  const account = getAccountById(accountId);
  const deal = getDealForAccount(accountId);
  const stakeholders = getStakeholdersForAccount(accountId);

  const acv = deal?.acv ?? 0;
  const priority: AccountPriority =
    acv >= 1_000_000 || account?.tier === 'Strategic'
      ? 'P1 — Critical'
      : acv >= 500_000
      ? 'P2 — High'
      : 'P3 — Standard';

  const missingRoles = ['CFO', 'CEO', 'CTO', 'Legal'].filter(
    (role) =>
      !stakeholders.some(
        (s) => s.title.toLowerCase().includes(role.toLowerCase()) && s.strength >= 2
      )
  );

  return {
    accountPriority: priority,
    strategicRationale: `${account?.name ?? 'This account'} is a ${account?.tier ?? 'key'} account in the ${account?.industry ?? ''} sector with ${account?.headcount ?? 'significant'} employees and reported revenue of ${account?.revenue ?? 'undisclosed'}. The active deal (ACV: SAR ${(acv / 1_000_000).toFixed(1)}M) represents a significant expansion opportunity aligned with HUMAIN's Vision 2030 positioning. ${account?.tier === 'Strategic' ? 'Its strategic tier classification requires executive-level engagement and executive sponsorship.' : 'Continued investment in relationship depth will accelerate deal velocity.'}`,
    keyRelationshipGaps: missingRoles.map(
      (r) => `${r} not yet engaged or relationship strength below threshold`
    ),
    recommendedPositioning: `Position HUMAIN as the sovereign AI platform of choice for ${account?.industry ?? 'enterprise'} organisations operating under Vision 2030. Lead with KSA data residency compliance, regional infrastructure investment, and reference deployments in adjacent verticals. Differentiate from hyperscalers on regulatory alignment, local support SLAs, and HUMAIN's national mandate.`,
    actionPlan: {
      thirtyDay: [
        { action: 'Complete CFO introduction via champion', owner: 'Turki Bin Nader' },
        { action: 'Deliver business case document', owner: 'Turki Bin Nader' },
        { action: 'Schedule SE-led technical deep-dive', owner: 'Priya Nair' },
      ],
      sixtyDay: [
        { action: 'Run PoC kick-off and environment provisioning', owner: 'Priya Nair' },
        { action: 'Conduct executive briefing with C-suite sponsor', owner: 'Turki Bin Nader' },
        { action: 'Deliver reference architecture document', owner: 'Priya Nair' },
      ],
      ninetyDay: [
        { action: 'PoC results presentation and sign-off', owner: 'Turki Bin Nader + Priya Nair' },
        { action: 'Submit commercial proposal and negotiate terms', owner: 'Turki Bin Nader' },
        { action: 'Legal and procurement kick-off', owner: 'Turki Bin Nader + Legal' },
      ],
    },
    risksAndMitigation: [
      {
        risk: 'New leadership reassessing vendor relationships',
        mitigation: 'Accelerate executive introductions; position HUMAIN as incumbent-aligned with national mandate.',
      },
      {
        risk: 'Competitor undercutting on price',
        mitigation: 'Anchor on TCO, compliance value, and reference customer outcomes rather than unit price.',
      },
      {
        risk: `CFO not engaged before ${deal?.closeDate ?? 'close date'}`,
        mitigation: 'Leverage champion relationship to secure CFO intro; prepare concise 1-page financial summary.',
      },
      {
        risk: 'Procurement delays extending close date',
        mitigation: 'Initiate legal and procurement conversations in parallel with PoC to compress timeline.',
      },
    ],
  };
}

// ─── Follow-up Email Agent ────────────────────────────────────────────────────

export interface FollowUpEmailInsight {
  subject: string;
  body: string;
  nextStepBullets: string[];
}

export function getFollowUpEmail(accountId: string): FollowUpEmailInsight {
  const account = getAccountById(accountId);
  const activities = getActivitiesForAccount(accountId);
  const deal = getDealForAccount(accountId);
  const stakeholders = getStakeholdersForAccount(accountId);

  const lastMeeting = [...activities]
    .filter((a) => a.type === 'meeting')
    .sort((a, b) => b.date.localeCompare(a.date))[0];

  const champion = stakeholders.find((s) => s.role === 'Champion');
  const recipientName = champion?.name ?? 'Team';
  const recipientTitle = champion?.title ?? '';
  const accountName = account?.name ?? 'your organisation';
  const meetingTitle = lastMeeting?.title ?? 'our recent discussion';
  const acv = deal?.acv ?? 0;

  const subject = `Follow-up: ${meetingTitle} — ${accountName} × HUMAIN Next Steps`;

  const body = `Hi ${recipientName.split(' ')[0]},

Thank you for your time during ${meetingTitle}. I wanted to follow up promptly with a summary and our agreed next steps.

As discussed, the key priorities for ${accountName} are:
  • Ensuring full KSA data residency compliance across all AI workloads
  • Accelerating the delivery of your AI roadmap without compromising on sovereignty
  • Securing the right internal alignment ahead of the investment decision

Based on our conversation, I believe HUMAIN is strongly positioned to meet these requirements. I've outlined the immediate next steps below and will be reaching out to confirm timing with your team.

Please let me know if you'd like to adjust anything or if there are additional stakeholders we should loop in at this stage.

Looking forward to progressing this together.

Best regards,
Turki Bin Nader
Enterprise Account Executive — HUMAIN
turki.binnader@company.com`;

  const nextStepBullets = [
    `Send Energy Sector Reference Architecture to ${recipientName.split(' ')[0]} by end of this week`,
    `Draft 1-page business case for CFO review (ACV: SAR ${(acv / 1_000_000).toFixed(1)}M)`,
    `Confirm PoC timeline and environment requirements with ${recipientTitle || 'technical team'}`,
    `Schedule intro call with CFO / Economic Buyer`,
    `Align on close date: ${deal?.closeDate ?? 'TBC'}`,
  ];

  return { subject, body, nextStepBullets };
}

// ─── Stakeholder Engagement Agent ────────────────────────────────────────────

export interface StakeholderToEngage {
  name: string;
  title: string;
  role: string;
  currentStrength: number;
  reason: string;
}

export interface StakeholderEngagementInsight {
  coverageSummary: {
    total: number;
    engaged: number;
    coveragePercent: number;
  };
  missingRoles: string[];
  topToEngage: StakeholderToEngage[];
  recommendedApproach: string;
  suggestedTalkingPoints: string[];
  risksIfNotCompleted: string[];
}

export function getStakeholderEngagement(accountId: string): StakeholderEngagementInsight {
  const stakeholders = getStakeholdersForAccount(accountId);
  const account = getAccountById(accountId);

  const engaged = stakeholders.filter((s) => s.strength >= 2);
  const coveragePercent =
    stakeholders.length > 0 ? Math.round((engaged.length / stakeholders.length) * 100) : 0;

  const expectedRoles = ['CFO', 'CTO', 'VP', 'Director', 'CEO'];
  const missingRoles = expectedRoles.filter(
    (role) =>
      !stakeholders.some(
        (s) =>
          s.title.toLowerCase().includes(role.toLowerCase()) &&
          s.strength >= 2
      )
  );

  const topToEngage: StakeholderToEngage[] = stakeholders
    .filter((s) => s.strength < 3)
    .sort((a, b) => {
      const roleWeight: Record<string, number> = {
        'Decision Maker': 3,
        Champion: 2,
        Influencer: 1,
        Blocker: 3,
        Coach: 0,
      };
      return (roleWeight[b.role] ?? 0) - (roleWeight[a.role] ?? 0);
    })
    .slice(0, 3)
    .map((s) => ({
      name: s.name,
      title: s.title,
      role: s.role,
      currentStrength: s.strength,
      reason:
        s.role === 'Decision Maker'
          ? 'Required for deal approval — low engagement is a close risk'
          : s.role === 'Blocker'
          ? 'Potential blocker — must be neutralised before proposal stage'
          : 'Influencer in evaluation process — deeper engagement increases win probability',
    }));

  return {
    coverageSummary: {
      total: stakeholders.length,
      engaged: engaged.length,
      coveragePercent,
    },
    missingRoles,
    topToEngage,
    recommendedApproach: `For ${account?.name ?? 'this account'}, prioritise C-suite engagement through existing champions. Use the business case document as a door-opener for CFO conversations. Leverage HUMAIN executive sponsors for peer-to-peer introductions at Decision Maker level. For technical influencers, the PoC is the most effective engagement vehicle — invite them into the process early as 'technical advisors'.`,
    suggestedTalkingPoints: [
      `HUMAIN's sovereign AI platform is purpose-built for Vision 2030 compliance requirements`,
      `Reference deployment: [similar industry customer] achieved 30% reduction in platform costs within 6 months`,
      `Our KSA-region infrastructure means zero data leaves the Kingdom — meeting SAMA and NCA requirements`,
      `HUMAIN's national mandate positions us as a long-term strategic partner, not just a vendor`,
      `We offer a no-risk PoC structure: defined scope, fixed timeline, clear success criteria`,
    ],
    risksIfNotCompleted: [
      'Decision maker not engaged before proposal stage → deal blocked at approval',
      'Competitor gains access to C-suite while our relationship remains at VP level',
      'Technical blockers surface late in evaluation, extending deal timeline beyond close date',
      'Champion leaves or is reassigned, removing our internal advocacy',
      `Deal stalls past ${getDealForAccount(accountId)?.closeDate ?? 'close date'}, triggering quarter-end risk`,
    ],
  };
}
