'use client';

import { useState, useCallback } from 'react';
import { AppShellCard, Badge, Button, Avatar } from '@humain-foundation/ui';
import {
  Bot,
  FileCheck2,
  Layers,
  Map,
  Users,
  Check,
  Copy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  UserX,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  Building2,
  BarChart3,
  FileText,
  Zap,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import {
  MOCK_ACCOUNTS,
  MOCK_DEALS,
  MOCK_STAKEHOLDERS,
  MOCK_SIGNALS,
  MOCK_WIKI_ASSETS,
  MOCK_MEETING_SUMMARY,
  MOCK_ACTIVITIES,
} from '@/lib/mock-data';
import { computeAccountHealth, HEALTH_STYLE } from '@/lib/health';
import {
  getProposalReadiness,
  getPocScoping,
  getAccountStrategy,
  getStakeholderEngagement,
  type ProposalStatus,
} from '@/lib/agent-insights';

// ─── Types ────────────────────────────────────────────────────────────────────

type AgentId =
  | 'proposal-readiness'
  | 'scope'
  | 'account-strategy'
  | 'stakeholder-engagement';

type Step = 1 | 2 | 3 | 4;
type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

// ─── Agent definitions ────────────────────────────────────────────────────────

interface AgentDef {
  id: AgentId;
  title: string;
  description: string;
  whenToUse: string;
  expectedOutput: string;
  icon: React.ReactNode;
  suggestedNext?: AgentId;
}

const AGENTS: AgentDef[] = [
  {
    id: 'proposal-readiness',
    title: 'Proposal Readiness Agent',
    description: 'Evaluates whether an account is ready for a formal proposal submission.',
    whenToUse: 'Deal is at Develop Proposal or Submit Proposal and you need to confirm qualification before committing to a proposal.',
    expectedOutput: 'Readiness score, status badge, key gaps, missing information, recommended actions, and suggested proposal structure.',
    icon: <FileCheck2 className="size-5" />,
    suggestedNext: 'scope',
  },
  {
    id: 'scope',
    title: 'Scope Agent',
    description: 'Structures scope across any engagement type — PoC, pilot, proposal, discovery, or technical handover.',
    whenToUse: 'You need to define clear boundaries, objectives, and handover requirements for any scoped engagement with a client.',
    expectedOutput: 'Scope objective, recommended scope type, in-scope and out-of-scope items, client inputs, success criteria, and handover notes.',
    icon: <Layers className="size-5" />,
    suggestedNext: 'proposal-readiness',
  },
  {
    id: 'account-strategy',
    title: 'Account Strategy Agent',
    description: 'Produces a strategic account plan with priority level, positioning, and a 30/60/90 day action roadmap.',
    whenToUse: 'Aligning the team on account direction, preparing for a QBR, or refreshing strategy after a leadership change.',
    expectedOutput: 'Account priority, strategic rationale, key gaps, positioning statement, action plan, and risk mitigations.',
    icon: <Map className="size-5" />,
    suggestedNext: 'stakeholder-engagement',
  },
  {
    id: 'stakeholder-engagement',
    title: 'Stakeholder Engagement Agent',
    description: 'Analyses stakeholder coverage and recommends who to engage next and how.',
    whenToUse: 'Stakeholder map is incomplete or you are preparing for an executive introduction or deal advancement.',
    expectedOutput: 'Coverage summary, missing roles, top stakeholders to engage, talking points, and engagement risks.',
    icon: <Users className="size-5" />,
    suggestedNext: 'account-strategy',
  },
];

const AGENT_MAP = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<AgentId, AgentDef>;

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEP_LABELS: Record<Step, string> = {
  1: 'Agent',
  2: 'Account',
  3: 'Context',
  4: 'Output',
};

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = [1, 2, 3, 4];
  return (
    <div className="flex items-center select-none">
      {steps.map((step, i) => {
        const done   = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${
                  done
                    ? 'bg-brand-500 text-white'
                    : active
                    ? 'border-2 border-brand-500 bg-brand-500/10 text-brand-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {done ? <Check className="size-3.5" /> : step}
              </div>
              <span
                className={`text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                  active ? 'text-brand-500' : done ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 mb-5 h-px w-12 transition-colors duration-300 sm:w-16 ${
                  done ? 'bg-brand-500' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Choose Agent ─────────────────────────────────────────────────────

function AgentSelector({
  selected,
  onSelect,
}: {
  selected: AgentId | null;
  onSelect: (id: AgentId) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-foreground">Choose an Agent</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Select the agent that best matches your current sales situation.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {AGENTS.map((agent) => {
          const isSelected = selected === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => onSelect(agent.id)}
              className={`flex flex-col gap-3 rounded-xl border p-5 text-left transition-all duration-150 hover:border-brand-500/40 hover:bg-accent ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/20'
                  : 'border-border bg-card'
              }`}
            >
              {/* Icon row */}
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    isSelected ? 'bg-brand-500 text-white' : 'bg-brand-500/10 text-brand-500'
                  }`}
                >
                  {agent.icon}
                </span>
                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500">
                    <Check className="size-3 text-white" />
                  </span>
                )}
              </div>

              {/* Title + description */}
              <div>
                <p className="font-semibold text-foreground">{agent.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{agent.description}</p>
              </div>

              {/* When to use */}
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  When to use
                </p>
                <p className="text-xs text-foreground">{agent.whenToUse}</p>
              </div>

              {/* Expected output */}
              <div>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Output
                </p>
                <p className="text-xs text-muted-foreground">{agent.expectedOutput}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Choose Account ───────────────────────────────────────────────────

function AccountSelector({
  agentId,
  selected,
  onSelect,
}: {
  agentId: AgentId;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const agent = AGENT_MAP[agentId];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-500">
            {agent.icon}
          </span>
          <Badge color="primary">{agent.title}</Badge>
        </div>
        <h2 className="text-lg font-bold text-foreground">Select an Account</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Choose the account you want the agent to analyse.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_ACCOUNTS.map((account) => {
          const deals      = MOCK_DEALS.filter((d) => d.accountId === account.id);
          const staks      = MOCK_STAKEHOLDERS.filter((s) => s.accountId === account.id);
          const sigs       = MOCK_SIGNALS.filter((s) => s.accountId === account.id);
          const health     = computeAccountHealth(account, deals, staks, sigs);
          const hs         = HEALTH_STYLE[health.status];
          const deal       = deals[0];
          const isSelected = selected === account.id;

          return (
            <button
              key={account.id}
              onClick={() => onSelect(account.id)}
              className={`flex flex-col gap-2.5 rounded-xl border p-4 text-left transition-all duration-150 hover:border-brand-500/40 hover:bg-accent ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/20'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar fallback={account.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{account.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{account.industry}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500">
                    <Check className="size-3 text-white" />
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge color={account.tier === 'Strategic' ? 'primary' : 'secondary'}>
                  {account.tier}
                </Badge>
                <Badge color={hs.color}>{hs.label}</Badge>
              </div>
              {deal && (
                <p className="text-xs text-muted-foreground">
                  {deal.stage} · SAR {(deal.acv / 1_000).toFixed(0)}K ACV · closes {deal.closeDate}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{account.hq ?? account.region}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Context Panel ────────────────────────────────────────────────────

function ContextPanel({ agentId, accountId }: { agentId: AgentId; accountId: string }) {
  const agent   = AGENT_MAP[agentId];
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId)!;
  const deals   = MOCK_DEALS.filter((d) => d.accountId === accountId);
  const staks   = MOCK_STAKEHOLDERS.filter((s) => s.accountId === accountId);
  const sigs    = MOCK_SIGNALS.filter((s) => s.accountId === accountId);
  const health  = computeAccountHealth(account, deals, staks, sigs);
  const hs      = HEALTH_STYLE[health.status];
  const deal    = deals[0];
  const engaged = staks.filter((s) => s.strength >= 2);

  const hasMeeting = MOCK_MEETING_SUMMARY.accountId === accountId;
  const openTasks  = MOCK_ACTIVITIES
    .filter((a) => a.accountId === accountId && a.type === 'action_item')
    .slice(0, 3);

  const relevantAssets = MOCK_WIKI_ASSETS.filter(
    (w: { industry: string[]; tags: string[]; id: string; title: string }) =>
      w.industry.some((i: string) => account.industry.includes(i)) ||
      w.tags.includes(account.region.toLowerCase())
  ).slice(0, 2);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-500">
            {agent.icon}
          </span>
          <Badge color="primary">{agent.title}</Badge>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm font-semibold text-foreground">{account.name}</span>
        </div>
        <h2 className="text-lg font-bold text-foreground">Context Used by Agent</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Review the account data the agent will use to generate its output.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Account */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="size-4 text-brand-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Account</p>
          </div>
          <p className="font-semibold text-foreground">{account.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{account.industry}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge color={account.tier === 'Strategic' ? 'primary' : 'secondary'}>{account.tier}</Badge>
            <Badge color={hs.color}>{hs.label} · {health.score}/100</Badge>
          </div>
          <ul className="mt-2 space-y-0.5">
            {health.reasons.map((r, i) => (
              <li key={i} className="text-xs text-muted-foreground">· {r}</li>
            ))}
          </ul>
        </div>

        {/* Active deal */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="size-4 text-brand-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Opportunity</p>
          </div>
          {deal ? (
            <>
              <p className="font-semibold text-foreground">{deal.stage}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                ACV: SAR {(deal.acv / 1_000).toFixed(0)}K · Closes: {deal.closeDate}
              </p>
              <div className="mt-2">
                <Badge
                  color={deal.risk === 'high' ? 'destructive' : deal.risk === 'medium' ? 'warning' : 'success'}
                >
                  {deal.risk} risk
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Owner: {deal.owner}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No active opportunity on record.</p>
          )}
        </div>

        {/* Stakeholders */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Users className="size-4 text-brand-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stakeholders</p>
            <span className="ml-auto text-xs text-muted-foreground">
              {engaged.length}/{staks.length} engaged
            </span>
          </div>
          {staks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stakeholders mapped.</p>
          ) : (
            <div className="space-y-2">
              {staks.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <Avatar fallback={s.name} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{s.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{s.title} · {s.role}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div
                        key={j}
                        className={`h-1.5 w-2 rounded-sm ${j < s.strength ? 'bg-brand-500' : 'bg-muted'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileText className="size-4 text-brand-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</p>
          </div>
          {hasMeeting ? (
            <div className="mb-3">
              <p className="text-xs font-semibold text-foreground">Latest Meeting</p>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {MOCK_MEETING_SUMMARY.meetingTitle} · {MOCK_MEETING_SUMMARY.date}
              </p>
            </div>
          ) : (
            <p className="mb-3 text-xs text-muted-foreground">No meeting summary on record.</p>
          )}
          {openTasks.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-foreground">Open Action Items</p>
              {openTasks.map((t) => (
                <p key={t.id} className="text-xs text-muted-foreground">· {t.title}</p>
              ))}
            </div>
          )}
          {openTasks.length === 0 && !hasMeeting && (
            <p className="text-xs text-muted-foreground">No recent activity on record.</p>
          )}
        </div>

        {/* Risk signals */}
        {sigs.length > 0 && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="size-4 text-warning" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Risk Signals</p>
            </div>
            {sigs.map((s) => (
              <p key={s.id} className="text-xs text-foreground">· {s.title}</p>
            ))}
          </div>
        )}

        {/* Wiki / collateral assets */}
        {relevantAssets.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-brand-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Relevant Assets</p>
            </div>
            {relevantAssets.map((a: { id: string; title: string }) => (
              <p key={a.id} className="text-xs text-muted-foreground">· {a.title}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generate button panel ────────────────────────────────────────────────────

function GeneratePanel({
  agentId,
  accountId,
  onGenerate,
}: {
  agentId: AgentId;
  accountId: string;
  onGenerate: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const agent   = AGENT_MAP[agentId];
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId)!;

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onGenerate(); }, 800);
  };

  return (
    <div className="flex flex-col items-center gap-5 rounded-xl border border-brand-500/20 bg-brand-500/5 py-12">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
        {agent.icon}
      </div>
      <div className="text-center px-4">
        <p className="font-semibold text-foreground">{agent.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ready to analyse <strong>{account.name}</strong>
        </p>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">{agent.expectedOutput}</p>
      </div>
      <Button
        size="lg"
        variant="primary"
        onClick={handleClick}
        disabled={loading}
        startIcon={loading ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
      >
        {loading ? 'Generating…' : 'Generate Agent Output'}
      </Button>
    </div>
  );
}

// ─── Shared output micro-components ──────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function BulletList({ items, icon }: { items: string[]; icon?: React.ReactNode }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          {icon ?? <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />}
          {item}
        </li>
      ))}
    </ul>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? 'text-success' : score >= 45 ? 'text-warning' : 'text-destructive';
  const ring  = score >= 75 ? 'border-success/40 bg-success/10' : score >= 45 ? 'border-warning/40 bg-warning/10' : 'border-destructive/40 bg-destructive/10';
  return (
    <div className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-2 ${ring}`}>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] text-muted-foreground">/ 100</span>
    </div>
  );
}

const PROPOSAL_STATUS_STYLE: Record<ProposalStatus, { color: BadgeColor; icon: React.ReactNode }> = {
  'Ready for Proposal':   { color: 'success',    icon: <CheckCircle2 className="size-3.5" /> },
  'Needs More Discovery': { color: 'warning',    icon: <AlertTriangle className="size-3.5" /> },
  'High Risk':            { color: 'destructive', icon: <XCircle className="size-3.5" /> },
};

// ─── Proposal Readiness Output ────────────────────────────────────────────────

function ProposalOutput({ accountId }: { accountId: string }) {
  const insight = getProposalReadiness(accountId);
  const badge   = PROPOSAL_STATUS_STYLE[insight.status];

  return (
    <div className="space-y-6">
      {/* Score + Status */}
      <div className="flex items-center gap-5">
        <ScoreRing score={insight.score} />
        <div>
          <Badge color={badge.color} className="mb-2 gap-1.5">
            {badge.icon} {insight.status}
          </Badge>
          <p className="text-sm text-muted-foreground">
            Readiness score based on stakeholder coverage, deal stage, and discovery completeness.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Key Gaps */}
        <div>
          <SectionLabel>Key Gaps</SectionLabel>
          {insight.missingInformation.length === 0 ? (
            <p className="text-sm text-success">No critical gaps identified.</p>
          ) : (
            <BulletList
              items={insight.missingInformation}
              icon={<XCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />}
            />
          )}
        </div>

        {/* Recommended Actions */}
        <div>
          <SectionLabel>Recommended Actions</SectionLabel>
          <BulletList items={insight.recommendedNextActions} />
        </div>
      </div>

      {/* Suggested Proposal Structure */}
      <div>
        <SectionLabel>Suggested Proposal Structure</SectionLabel>
        <div className="space-y-1.5">
          {insight.suggestedProposalStructure.map((item, i) => (
            <div key={i} className="rounded-md bg-muted/40 px-3 py-1.5 text-sm text-foreground">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scope Agent Output ───────────────────────────────────────────────────────

// Scope type is derived from deal stage and account context
function deriveScopeType(accountId: string): { label: string; description: string } {
  const deal    = MOCK_DEALS.find((d) => d.accountId === accountId);
  const stageNum = deal ? parseInt(deal.stage.replace('Stage ', ''), 10) : 0;

  if (stageNum <= 1)
    return { label: 'Discovery Scope', description: 'Structure initial requirements and qualify the engagement before advancing.' };
  if (stageNum === 2)
    return { label: 'PoC Scope', description: 'Define a time-boxed proof-of-concept to validate the core technical hypothesis.' };
  if (stageNum === 3)
    return { label: 'Pilot Scope', description: 'Expand from PoC into a limited production pilot with agreed success criteria.' };
  if (stageNum >= 4)
    return { label: 'Proposal Scope', description: 'Finalise scope boundaries to anchor the commercial proposal and implementation plan.' };
  return { label: 'Technical Handover Scope', description: 'Document requirements and handover criteria for the engineering team.' };
}

function ScopeOutput({ accountId }: { accountId: string }) {
  const insight   = getPocScoping(accountId); // reuses existing logic
  const scopeType = deriveScopeType(accountId);
  const account   = MOCK_ACCOUNTS.find((a) => a.id === accountId);

  return (
    <div className="space-y-5">
      {/* Scope Objective */}
      <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 p-4">
        <SectionLabel>Scope Objective</SectionLabel>
        <p className="text-sm text-foreground">
          Define and agree on a structured engagement scope for {account?.name ?? 'the client'} that
          establishes clear boundaries, client commitments, and measurable outcomes to move the
          opportunity forward.
        </p>
      </div>

      {/* Recommended Scope Type */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
        <ClipboardList className="mt-0.5 size-5 shrink-0 text-brand-500" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SectionLabel>Recommended Scope Type</SectionLabel>
          </div>
          <Badge color="primary" className="mb-2">{scopeType.label}</Badge>
          <p className="text-sm text-muted-foreground">{scopeType.description}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* In-Scope */}
        <div>
          <SectionLabel>In-Scope Items</SectionLabel>
          <BulletList
            items={insight.inScope}
            icon={<CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />}
          />
        </div>

        {/* Out-of-Scope */}
        <div>
          <SectionLabel>Out-of-Scope Items</SectionLabel>
          <BulletList
            items={insight.outOfScope}
            icon={<XCircle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />}
          />
        </div>

        {/* Client Inputs */}
        <div>
          <SectionLabel>Client Inputs Required</SectionLabel>
          <BulletList items={insight.clientInputsRequired} />
        </div>

        {/* Internal Dependencies */}
        <div>
          <SectionLabel>Internal Dependencies</SectionLabel>
          <BulletList items={insight.internalDependencies} />
        </div>
      </div>

      {/* Success Criteria */}
      <div>
        <SectionLabel>Success Criteria</SectionLabel>
        <div className="space-y-1.5">
          {insight.successCriteria.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-md border border-success/20 bg-success/5 px-3 py-1.5 text-sm text-foreground"
            >
              <Target className="mt-0.5 size-3.5 shrink-0 text-success" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Scope Summary / Handover Notes */}
      <div>
        <SectionLabel>Scope Summary &amp; Handover Notes</SectionLabel>
        <p className="text-sm text-muted-foreground">{insight.technicalHandoverSummary}</p>
      </div>
    </div>
  );
}

// ─── Account Strategy Output ──────────────────────────────────────────────────

function StrategyOutput({ accountId }: { accountId: string }) {
  const insight      = getAccountStrategy(accountId);
  const priorityColor: BadgeColor = insight.accountPriority.startsWith('P1')
    ? 'destructive'
    : insight.accountPriority.startsWith('P2')
    ? 'warning'
    : 'secondary';

  return (
    <div className="space-y-5">
      {/* Strategic Rationale + Priority */}
      <div className="flex items-start gap-4">
        <Badge color={priorityColor} className="shrink-0">{insight.accountPriority}</Badge>
        <p className="text-sm text-muted-foreground">{insight.strategicRationale}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Key Gaps */}
        <div>
          <SectionLabel>Key Gaps</SectionLabel>
          <BulletList
            items={insight.keyRelationshipGaps}
            icon={<AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />}
          />
        </div>

        {/* Recommended Positioning */}
        <div>
          <SectionLabel>Recommended Positioning</SectionLabel>
          <p className="text-sm text-foreground">{insight.recommendedPositioning}</p>
        </div>
      </div>

      {/* 30/60/90 Action Plan */}
      <div>
        <SectionLabel>30 / 60 / 90 Day Action Plan</SectionLabel>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              { label: '30 Days', items: insight.actionPlan.thirtyDay,  bg: 'border-success/30 bg-success/5' },
              { label: '60 Days', items: insight.actionPlan.sixtyDay,   bg: 'border-warning/30 bg-warning/5' },
              { label: '90 Days', items: insight.actionPlan.ninetyDay,  bg: 'border-brand-500/30 bg-brand-500/5' },
            ] as const
          ).map(({ label, items, bg }) => (
            <div key={label} className={`rounded-lg border p-3 ${bg}`}>
              <p className="mb-2 text-xs font-bold text-foreground">{label}</p>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="text-xs text-foreground">
                    <span className="font-medium">{item.action}</span>
                    <span className="ml-1 text-muted-foreground">— {item.owner}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Risks & Mitigation */}
      <div>
        <SectionLabel>Risks &amp; Mitigations</SectionLabel>
        <div className="space-y-2">
          {insight.risksAndMitigation.map((item, i) => (
            <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.risk}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="font-semibold text-success">Mitigation:</span> {item.mitigation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stakeholder Engagement Output ───────────────────────────────────────────

function StakeholderOutput({ accountId }: { accountId: string }) {
  const insight  = getStakeholderEngagement(accountId);
  const pct      = insight.coverageSummary.coveragePercent;
  const barColor = pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-destructive';

  return (
    <div className="space-y-5">
      {/* Coverage Summary */}
      <div>
        <SectionLabel>Stakeholder Coverage Summary</SectionLabel>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Engagement coverage</span>
          <span className="font-semibold text-foreground">
            {insight.coverageSummary.engaged} / {insight.coverageSummary.total} engaged
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{pct}% of mapped stakeholders engaged</p>
      </div>

      {/* Missing Roles */}
      {insight.missingRoles.length > 0 && (
        <div>
          <SectionLabel>Missing Roles</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {insight.missingRoles.map((role, i) => (
              <span key={i} className="flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs text-destructive">
                <UserX className="size-3" /> {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top to Engage */}
      <div>
        <SectionLabel>Stakeholders to Engage Next</SectionLabel>
        <div className="space-y-2">
          {insight.topToEngage.map((s, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <UserCheck className="mt-0.5 size-4 shrink-0 text-brand-500" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  <span className="text-xs text-muted-foreground">— {s.title}</span>
                  <Badge color="secondary" className="ml-auto text-[10px]">{s.role}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className={`h-1.5 w-3 rounded-sm ${j < s.currentStrength ? 'bg-brand-500' : 'bg-muted'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Relationship strength</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Engagement Approach */}
      <div>
        <SectionLabel>Recommended Engagement Approach</SectionLabel>
        <p className="text-sm text-muted-foreground">{insight.recommendedApproach}</p>
      </div>

      {/* Talking Points */}
      <div>
        <SectionLabel>Suggested Talking Points</SectionLabel>
        <BulletList
          items={insight.suggestedTalkingPoints}
          icon={<TrendingUp className="mt-0.5 size-3.5 shrink-0 text-brand-500" />}
        />
      </div>

      {/* Engagement Risks */}
      <div>
        <SectionLabel>Engagement Risks</SectionLabel>
        <BulletList
          items={insight.risksIfNotCompleted}
          icon={<AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-destructive" />}
        />
      </div>
    </div>
  );
}

// ─── Output dispatcher ────────────────────────────────────────────────────────

function AgentOutputPanel({
  agentId,
  accountId,
}: {
  agentId: AgentId;
  accountId: string;
}) {
  const agent   = AGENT_MAP[agentId];
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId)!;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-500">
            {agent.icon}
          </span>
          <Badge color="primary">{agent.title}</Badge>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm font-semibold text-foreground">{account.name}</span>
        </div>
        <h2 className="text-lg font-bold text-foreground">Agent Output</h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        {agentId === 'proposal-readiness'    && <ProposalOutput    accountId={accountId} />}
        {agentId === 'scope'                 && <ScopeOutput       accountId={accountId} />}
        {agentId === 'account-strategy'      && <StrategyOutput    accountId={accountId} />}
        {agentId === 'stakeholder-engagement' && <StakeholderOutput accountId={accountId} />}
      </div>
    </div>
  );
}

// ─── Next actions bar ─────────────────────────────────────────────────────────

interface NextAction {
  label: string;
  icon: React.ReactNode;
  nextAgent?: AgentId;
  description: string;
}

const NEXT_ACTIONS: Record<AgentId, NextAction[]> = {
  'proposal-readiness': [
    { label: 'Run Scope Agent',             icon: <Layers className="size-4" />,   nextAgent: 'scope',                  description: 'Structure the engagement scope before writing the proposal.' },
    { label: 'Run Stakeholder Agent',       icon: <Users className="size-4" />,    nextAgent: 'stakeholder-engagement', description: 'Ensure all key stakeholders are covered before submitting.' },
    { label: 'Run Account Strategy Agent',  icon: <Map className="size-4" />,      nextAgent: 'account-strategy',       description: 'Refresh the account strategy to support the proposal.' },
  ],
  'scope': [
    { label: 'Run Proposal Readiness',      icon: <FileCheck2 className="size-4" />, nextAgent: 'proposal-readiness',  description: 'Confirm readiness to submit a formal proposal.' },
    { label: 'Run Stakeholder Agent',       icon: <Users className="size-4" />,    nextAgent: 'stakeholder-engagement', description: 'Verify stakeholder coverage before scope kick-off.' },
    { label: 'Run Account Strategy Agent',  icon: <Map className="size-4" />,      nextAgent: 'account-strategy',       description: 'Review the broader account strategy for alignment.' },
  ],
  'account-strategy': [
    { label: 'Run Stakeholder Agent',       icon: <Users className="size-4" />,    nextAgent: 'stakeholder-engagement', description: 'Map engagement gaps against the account strategy.' },
    { label: 'Run Proposal Readiness',      icon: <FileCheck2 className="size-4" />, nextAgent: 'proposal-readiness',  description: 'Check proposal readiness to action the plan.' },
    { label: 'Run Scope Agent',             icon: <Layers className="size-4" />,   nextAgent: 'scope',                  description: 'Define scope for the next engagement milestone.' },
  ],
  'stakeholder-engagement': [
    { label: 'Run Account Strategy Agent',  icon: <Map className="size-4" />,      nextAgent: 'account-strategy',       description: 'Refresh account strategy with updated coverage.' },
    { label: 'Run Proposal Readiness',      icon: <FileCheck2 className="size-4" />, nextAgent: 'proposal-readiness',  description: 'Check readiness now that stakeholders are mapped.' },
    { label: 'Run Scope Agent',             icon: <Layers className="size-4" />,   nextAgent: 'scope',                  description: 'Define scope for the highest-priority engagement.' },
  ],
};

function NextActionsBar({
  agentId,
  accountId,
  onRunAgent,
  onReset,
  onChangeAccount,
  onCopyOutput,
  copied,
}: {
  agentId: AgentId;
  accountId: string;
  onRunAgent: (id: AgentId) => void;
  onReset: () => void;
  onChangeAccount: () => void;
  onCopyOutput: () => void;
  copied: boolean;
}) {
  const actions = NEXT_ACTIONS[agentId];

  return (
    <div className="flex flex-col gap-5">
      {/* Success banner */}
      <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
        <CheckCircle2 className="size-5 shrink-0 text-success" />
        <div>
          <p className="text-sm font-semibold text-foreground">Output ready</p>
          <p className="text-xs text-muted-foreground">
            {MOCK_ACCOUNTS.find((a) => a.id === accountId)?.name} · {AGENT_MAP[agentId].title}
          </p>
        </div>
      </div>

      {/* Contextual next agents */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Suggested Next Actions</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => action.nextAgent && onRunAgent(action.nextAgent)}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-brand-500/40 hover:bg-accent"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                {action.icon}
              </span>
              <p className="text-xs font-semibold text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
              <div className="mt-auto flex items-center gap-1 text-xs font-medium text-brand-500">
                Run <ChevronRight className="size-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Utility buttons */}
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button
          appearance="outline"
          size="sm"
          onClick={onCopyOutput}
          startIcon={copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        >
          {copied ? 'Copied' : 'Copy Output'}
        </Button>
        <Button
          appearance="outline"
          size="sm"
          onClick={onChangeAccount}
          startIcon={<Building2 className="size-4" />}
        >
          Change Account
        </Button>
        <Button
          appearance="outline"
          size="sm"
          onClick={onReset}
          startIcon={<RotateCcw className="size-4" />}
        >
          Back to Agent Selection
        </Button>
      </div>
    </div>
  );
}

// ─── Copy output helper ───────────────────────────────────────────────────────

function buildCopyText(agentId: AgentId, accountId: string): string {
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId);
  const agent   = AGENT_MAP[agentId];
  const header  = `${agent.title} — ${account?.name ?? accountId}\n${'─'.repeat(60)}\n\n`;

  if (agentId === 'proposal-readiness') {
    const i = getProposalReadiness(accountId);
    return `${header}Readiness Score: ${i.score}/100\nStatus: ${i.status}\n\nKey Gaps:\n${i.missingInformation.map((x) => `• ${x}`).join('\n')}\n\nRecommended Actions:\n${i.recommendedNextActions.map((x) => `• ${x}`).join('\n')}\n\nProposal Structure:\n${i.suggestedProposalStructure.join('\n')}`;
  }
  if (agentId === 'scope') {
    const i = getPocScoping(accountId);
    const t = deriveScopeType(accountId);
    return `${header}Scope Type: ${t.label}\n${t.description}\n\nIn-Scope:\n${i.inScope.map((x) => `• ${x}`).join('\n')}\n\nOut-of-Scope:\n${i.outOfScope.map((x) => `• ${x}`).join('\n')}\n\nSuccess Criteria:\n${i.successCriteria.map((x) => `• ${x}`).join('\n')}\n\nHandover Notes:\n${i.technicalHandoverSummary}`;
  }
  if (agentId === 'account-strategy') {
    const i = getAccountStrategy(accountId);
    return `${header}Priority: ${i.accountPriority}\n\n${i.strategicRationale}\n\nKey Gaps:\n${i.keyRelationshipGaps.map((x) => `• ${x}`).join('\n')}\n\nPositioning:\n${i.recommendedPositioning}\n\nRisks:\n${i.risksAndMitigation.map((x) => `• ${x.risk} → ${x.mitigation}`).join('\n')}`;
  }
  if (agentId === 'stakeholder-engagement') {
    const i = getStakeholderEngagement(accountId);
    return `${header}Coverage: ${i.coverageSummary.engaged}/${i.coverageSummary.total} (${i.coverageSummary.coveragePercent}%)\n\nMissing Roles:\n${i.missingRoles.map((x) => `• ${x}`).join('\n')}\n\nTop to Engage:\n${i.topToEngage.map((x) => `• ${x.name} (${x.title}) — ${x.reason}`).join('\n')}\n\nTalking Points:\n${i.suggestedTalkingPoints.map((x) => `• ${x}`).join('\n')}\n\nRisks:\n${i.risksIfNotCompleted.map((x) => `• ${x}`).join('\n')}`;
  }
  return header;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [step,      setStep]      = useState<Step>(1);
  const [agentId,   setAgentId]   = useState<AgentId | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [copied,    setCopied]    = useState(false);

  // Selecting a new agent resets downstream state
  const handleSelectAgent = useCallback((id: AgentId) => {
    setAgentId(id);
    setAccountId(null);
  }, []);

  // Changing account resets output
  const handleSelectAccount = useCallback((id: string) => {
    setAccountId(id);
  }, []);

  // Jump to another agent (keep account)
  const handleRunAgent = useCallback((id: AgentId) => {
    setAgentId(id);
    setStep(3);
  }, []);

  // Full reset
  const handleReset = useCallback(() => {
    setStep(1);
    setAgentId(null);
    setAccountId(null);
    setCopied(false);
  }, []);

  // Change account, keep agent
  const handleChangeAccount = useCallback(() => {
    setAccountId(null);
    setStep(2);
  }, []);

  // Copy full output to clipboard
  const handleCopyOutput = useCallback(() => {
    if (!agentId || !accountId) return;
    const text = buildCopyText(agentId, accountId);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [agentId, accountId]);

  const canProceed =
    (step === 1 && agentId !== null) ||
    (step === 2 && accountId !== null) ||
    step === 3;

  const handleNext = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  return (
    <AppShellCard>
      {/* Page header */}
      <AppShellCard.Header>
        <div>
          <div className="flex items-center gap-2">
            <Bot className="size-5 text-brand-500" />
            <AppShellCard.Title>AI Sales Agents</AppShellCard.Title>
          </div>
          <AppShellCard.Subtitle>
            A guided workspace that converts account intelligence into structured sales outputs.
          </AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>

      <div className="flex flex-col gap-8">
        {/* Step indicator */}
        <div className="flex justify-center">
          <StepIndicator current={step} />
        </div>

        {/* Step content */}
        <div>
          {step === 1 && (
            <AgentSelector selected={agentId} onSelect={handleSelectAgent} />
          )}

          {step === 2 && agentId && (
            <AccountSelector
              agentId={agentId}
              selected={accountId}
              onSelect={handleSelectAccount}
            />
          )}

          {step === 3 && agentId && accountId && (
            <div className="flex flex-col gap-6">
              <ContextPanel agentId={agentId} accountId={accountId} />
              <GeneratePanel
                agentId={agentId}
                accountId={accountId}
                onGenerate={() => setStep(4)}
              />
            </div>
          )}

          {step === 4 && agentId && accountId && (
            <div className="flex flex-col gap-8">
              <AgentOutputPanel agentId={agentId} accountId={accountId} />
              <NextActionsBar
                agentId={agentId}
                accountId={accountId}
                onRunAgent={handleRunAgent}
                onReset={handleReset}
                onChangeAccount={handleChangeAccount}
                onCopyOutput={handleCopyOutput}
                copied={copied}
              />
            </div>
          )}
        </div>

        {/* Navigation footer */}
        {step < 4 && (
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              appearance="ghost"
              onClick={handleBack}
              disabled={step === 1}
              startIcon={<ChevronLeft className="size-4" />}
            >
              Back
            </Button>

            {/* Step 3 uses the Generate button as the CTA — no Next shown */}
            {step !== 3 && (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed}
                endIcon={<ChevronRight className="size-4" />}
              >
                {step === 1 ? 'Select Account' : 'Review Context'}
              </Button>
            )}
          </div>
        )}
      </div>
    </AppShellCard>
  );
}
