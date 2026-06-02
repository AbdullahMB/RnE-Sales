'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShellCard, Badge, Button } from '@humain-foundation/ui';
import { toast } from '@humain-foundation/ui';
import {
  AlertTriangle, Clock, TrendingUp, Users, Sparkles,
  CheckCircle2, XCircle, Target, Calendar,
  ShieldAlert, ChevronRight, BrainCircuit, Lightbulb,
  ChevronDown, ChevronUp, StickyNote, Save,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  MOCK_DEALS,
  MOCK_ACCOUNTS,
  MOCK_STAKEHOLDERS,
  MOCK_SIGNALS,
  MOCK_TASKS,
  MOCK_MEETING_SUMMARY,
  type Deal,
} from '@/lib/mock-data';
import { computeAccountHealth, HEALTH_STYLE } from '@/lib/health';
import { AccountAvatar } from '@/components/account-avatar';

// Stage weights for weighted ACV
const STAGE_WEIGHT: Record<string, number> = {
  'Stage 1': 0.10, 'Stage 2': 0.20, 'Stage 3': 0.40,
  'Stage 4': 0.70, 'Stage 5': 0.90,
};

// Derive MEDDIC completeness per account from available data
function getMeddicScore(accountId: string): { filled: number; total: 6; gaps: string[] } {
  const staks = MOCK_STAKEHOLDERS.filter((s) => s.accountId === accountId);
  const gaps: string[] = [];

  // Use real MEDDIC data for Aramco Digital
  if (accountId === MOCK_MEETING_SUMMARY.accountId) {
    const m = MOCK_MEETING_SUMMARY.meddic;
    const fields = [
      { key: 'metrics',          label: 'Metrics',           val: m.metrics },
      { key: 'economicBuyer',    label: 'Economic Buyer',    val: m.economicBuyer },
      { key: 'decisionCriteria', label: 'Decision Criteria', val: m.decisionCriteria },
      { key: 'decisionProcess',  label: 'Decision Process',  val: m.decisionProcess },
      { key: 'identifiedPain',   label: 'Identified Pain',   val: m.identifiedPain },
      { key: 'champion',         label: 'Champion',          val: m.champion },
    ];
    const filled = fields.filter((f) => !!f.val).length;
    fields.filter((f) => !f.val).forEach((f) => gaps.push(f.label));
    return { filled, total: 6, gaps };
  }

  // Derive from stakeholder data for other accounts
  const hasChampion      = staks.some((s) => s.role === 'Champion' && s.strength >= 3);
  const hasEcoBuyer      = staks.some((s) => s.role === 'Decision Maker' && s.strength >= 2);
  const hasCoach         = staks.some((s) => s.role === 'Coach');
  const hasPain          = staks.some((s) => s.notes?.length > 20);
  const hasMetrics       = staks.length >= 2;
  const hasDecisionProc  = hasCoach || staks.length >= 3;

  if (!hasMetrics)      gaps.push('Metrics');
  if (!hasEcoBuyer)     gaps.push('Economic Buyer');
  if (!staks.length)    gaps.push('Decision Criteria');
  if (!hasDecisionProc) gaps.push('Decision Process');
  if (!hasPain)         gaps.push('Identified Pain');
  if (!hasChampion)     gaps.push('Champion');

  const filled = 6 - gaps.length;
  return { filled, total: 6, gaps };
}

function daysUntil(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - new Date('2026-05-04').getTime()) / 86400000);
}

function CloseDateChip({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr);
  const color = days < 30 ? 'text-destructive' : days < 60 ? 'text-warning' : 'text-success';
  const bg = days < 30 ? 'bg-destructive/10 border-destructive/20' : days < 60 ? 'bg-warning/10 border-warning/20' : 'bg-success/10 border-success/20';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${color} ${bg}`}>
      <Calendar className="size-3" />
      {days > 0 ? `${days}d to close` : 'Overdue'}
    </span>
  );
}

function MeddicRing({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
  const color = pct === 100 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-destructive';
  const strokeColor = pct === 100 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const r = 14; const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-1.5">
      <svg width="36" height="36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/40" />
        <circle cx="18" cy="18" r={r} fill="none" stroke={strokeColor} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - filled / total)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <div>
        <p className={`text-sm font-bold leading-none ${color}`}>{filled}/{total}</p>
        <p className="text-xs text-muted-foreground leading-none mt-0.5">MEDDIC</p>
      </div>
    </div>
  );
}

function HealthBar({ score, label, color }: { score: number; label: string; color: 'success' | 'warning' | 'destructive' }) {
  const barColor = color === 'success' ? 'bg-success' : color === 'warning' ? 'bg-warning' : 'bg-destructive';
  const textColor = color === 'success' ? 'text-success' : color === 'warning' ? 'text-warning' : 'text-destructive';
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-[60px]">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-semibold shrink-0 ${textColor}`}>{label}</span>
    </div>
  );
}

const COACHING_TIPS: Record<string, { action: string; why: string; priority: 'high' | 'medium' }> = {
  'Champion': {
    action: 'Identify an internal advocate who uses the platform daily and has budget influence. Schedule a working session — not a demo — to co-build the business case together.',
    why: 'Deals without a champion are 3× more likely to stall. A champion pulls from the inside while you push from outside.',
    priority: 'high',
  },
  'Economic Buyer': {
    action: 'Ask your champion: "Who owns the budget for this initiative?" Then request an executive briefing — not a sales call. Bring a 1-page financial impact summary (ROI, payback period, risk of inaction).',
    why: 'Without Economic Buyer engagement, proposals sit in queues. The EB is the one person who can say "yes" regardless of consensus.',
    priority: 'high',
  },
  'Metrics': {
    action: 'Run a value quantification session. Ask: "What does this cost you per month in lost productivity / revenue / compliance risk?" Anchor the deal to a number they already care about.',
    why: 'Without agreed metrics, any price feels arbitrary. Metrics give your champion ammunition to justify the spend internally.',
    priority: 'high',
  },
  'Decision Criteria': {
    action: 'Ask to review the evaluation framework or be included in the RFP process. If none exists, offer to help build it — and make sure your strengths are reflected in the criteria.',
    why: 'Letting the customer define criteria without your input means competitors who got there first shaped the rules.',
    priority: 'medium',
  },
  'Decision Process': {
    action: 'Map the full approval chain with your champion. Ask: "Walk me through the last time you bought something at this spend level — who signed, who reviewed, who could veto?"',
    why: 'Surprise stakeholders kill deals at the finish line. You need to know every person who can say no before you reach Stage 4.',
    priority: 'medium',
  },
  'Identified Pain': {
    action: 'Re-run discovery focused entirely on business impact. Use the Pain Chain: operational pain → business problem → financial impact → executive priority. If you can\'t state the pain in their words, you don\'t own it yet.',
    why: 'Pain is the engine of urgency. Without it, every competitor looks the same and price becomes the differentiator.',
    priority: 'high',
  },
};

const RISK_COACHING: Record<Deal['risk'], { headline: string; actions: string[] }> = {
  high: {
    headline: 'This deal needs immediate attention',
    actions: [
      'Schedule an urgent account review with your manager this week',
      'Identify the single biggest blocker and create a targeted action plan',
      'Reach out to your executive sponsor for top-down support',
      'Consider whether a "mutual close plan" document would add structure',
    ],
  },
  medium: {
    headline: 'Watch for early warning signs',
    actions: [
      'Confirm close date is still realistic with your champion',
      'Ensure all decision-makers are aligned — no surprises late in the process',
      'Validate that the budget is still approved and allocated',
    ],
  },
  low: {
    headline: 'Keep momentum — don\'t let it coast',
    actions: [
      'Keep cadence high — weekly touchpoints to maintain velocity',
      'Start procurement / legal prep now to avoid last-minute delays',
      'Lock in the mutual close plan dates to hold the customer accountable',
    ],
  },
};

function CoachingNote({ dealId }: { dealId: string }) {
  const [note, setNote] = useLocalStorage<string>(`coach-note:${dealId}`, '');
  const [draft, setDraft] = useState(note);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <StickyNote className="size-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coach's Note</p>
      </div>
      <textarea
        className="w-full min-h-[80px] resize-y rounded-lg border border-border bg-background p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        placeholder="Log your coaching insights, next steps, or blockers here…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <Button
        size="sm"
        appearance="outline"
        startIcon={<Save className="size-3.5" />}
        onClick={() => { setNote(draft); toast.success('Note saved'); }}
      >
        Save note
      </Button>
    </div>
  );
}

function CoachingPanel({ deal, meddic, onClose }: {
  deal: Deal;
  meddic: { filled: number; total: number; gaps: string[] };
  onClose: () => void;
}) {
  const riskCoach = RISK_COACHING[deal.risk];
  return (
    <div className="border-t border-brand-500/20 bg-brand-500/[0.03] px-5 py-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="size-4 text-brand-500" />
          <p className="text-sm font-semibold text-foreground">Deal Coach</p>
          <Badge color="primary">AI Assist</Badge>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronUp className="size-4" />
        </button>
      </div>

      {/* Risk guidance */}
      <div className={`rounded-xl border px-4 py-3 ${
        deal.risk === 'high' ? 'border-destructive/30 bg-destructive/5' :
        deal.risk === 'medium' ? 'border-warning/30 bg-warning/5' : 'border-success/30 bg-success/5'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className={`size-3.5 ${deal.risk === 'high' ? 'text-destructive' : deal.risk === 'medium' ? 'text-warning' : 'text-success'}`} />
          <p className="text-xs font-semibold text-foreground">{riskCoach.headline}</p>
        </div>
        <ul className="flex flex-col gap-1">
          {riskCoach.actions.map((a) => (
            <li key={a} className="flex items-start gap-2 text-xs text-muted-foreground">
              <ChevronRight className="size-3 shrink-0 mt-0.5 text-muted-foreground/60" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      {/* MEDDIC gap coaching */}
      {meddic.gaps.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <Lightbulb className="size-3.5 text-warning" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              MEDDIC Gap Coaching ({meddic.gaps.length} gaps)
            </p>
          </div>
          {meddic.gaps.map((gap) => {
            const tip = COACHING_TIPS[gap];
            if (!tip) return null;
            return (
              <div key={gap} className={`rounded-xl border px-4 py-3 ${tip.priority === 'high' ? 'border-destructive/20 bg-destructive/5' : 'border-warning/20 bg-warning/5'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  {tip.priority === 'high'
                    ? <XCircle className="size-3.5 text-destructive shrink-0" />
                    : <AlertTriangle className="size-3.5 text-warning shrink-0" />
                  }
                  <p className="text-xs font-bold text-foreground">{gap}</p>
                  <Badge color={tip.priority === 'high' ? 'destructive' : 'warning'}>{tip.priority}</Badge>
                </div>
                <p className="text-xs text-foreground mb-1.5">{tip.action}</p>
                <p className="text-xs text-muted-foreground italic">Why: {tip.why}</p>
              </div>
            );
          })}
        </div>
      )}

      {meddic.gaps.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3">
          <CheckCircle2 className="size-4 text-success" />
          <p className="text-sm text-foreground font-medium">MEDDIC complete — this deal is well qualified.</p>
        </div>
      )}

      {/* Coach note */}
      <CoachingNote dealId={deal.id} />
    </div>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const [coachOpen, setCoachOpen] = useState(false);
  const account = MOCK_ACCOUNTS.find((a) => a.id === deal.accountId)!;
  const staks   = MOCK_STAKEHOLDERS.filter((s) => s.accountId === deal.accountId);
  const sigs    = MOCK_SIGNALS.filter((s) => s.accountId === deal.accountId);
  const health  = computeAccountHealth(account, [deal], staks, sigs);
  const hs      = HEALTH_STYLE[health.status];
  const meddic  = getMeddicScore(deal.accountId);
  const nextAction = MOCK_TASKS.find((t) => t.dealId === deal.id);
  const isStalled  = deal.daysSinceActivity > 14;

  const riskColor: Record<Deal['risk'], 'destructive' | 'warning' | 'success'> = {
    high: 'destructive', medium: 'warning', low: 'success',
  };

  return (
    <div className={`flex flex-col gap-4 rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow ${
      isStalled ? 'border-warning/40' : 'border-border'
    }`}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AccountAvatar accountId={deal.accountId} name={deal.accountName} size="md" />
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate">{deal.accountName}</p>
            <p className="text-xs text-muted-foreground">{account.industry}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <Badge color="secondary">{deal.stage}</Badge>
          <Badge color={riskColor[deal.risk]}>{deal.risk === 'low' ? 'On Track' : deal.risk === 'medium' ? 'Medium' : 'High Risk'}</Badge>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/40 px-4 py-3">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">${(deal.acv / 1000).toFixed(0)}K</p>
          <p className="text-xs text-muted-foreground">ACV</p>
        </div>
        <div className="text-center border-x border-border">
          <p className={`text-lg font-bold ${isStalled ? 'text-warning' : 'text-foreground'}`}>{deal.daysSinceActivity}d</p>
          <p className="text-xs text-muted-foreground">Idle</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-brand-500">
            ${(deal.acv * STAGE_WEIGHT[deal.stage] / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-muted-foreground">Weighted</p>
        </div>
      </div>

      {/* Health + MEDDIC row */}
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1.5">Account Health</p>
          <HealthBar score={health.score} label={hs.label} color={hs.color} />
        </div>
        <div className="shrink-0">
          <MeddicRing filled={meddic.filled} total={meddic.total} />
        </div>
      </div>

      {/* Risk reasons */}
      {health.reasons.filter((r) => r !== 'All good — keep the momentum').length > 0 && (
        <div className="flex flex-col gap-1">
          {health.reasons.slice(0, 2).map((r) => (
            <div key={r} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldAlert className="size-3 text-warning shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}

      {/* Close date */}
      <CloseDateChip dateStr={deal.closeDate} />

      {/* Next best action */}
      {nextAction && (
        <div className="rounded-lg border border-brand-500/20 bg-brand-500/5 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="size-3 text-brand-500" />
            <p className="text-xs font-semibold text-brand-500">Next Best Action</p>
            <Badge color={nextAction.priority === 'high' ? 'destructive' : 'warning'}>{nextAction.priority}</Badge>
          </div>
          <p className="text-xs text-foreground">{nextAction.action}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <Button appearance="outline" size="sm" className="flex-1"
          render={<Link href={`/accounts/${deal.accountId}`} />}
          endIcon={<ChevronRight className="size-4" />}>
          Account 360
        </Button>
        <Button variant="primary" size="sm"
          render={<Link href={`/accounts/${deal.accountId}/brief`} />}
          startIcon={<Sparkles className="size-4" />}>
          Brief
        </Button>
        <Button
          appearance={coachOpen ? 'solid' : 'outline'}
          variant={coachOpen ? 'primary' : undefined}
          size="sm"
          startIcon={<BrainCircuit className="size-4" />}
          endIcon={coachOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          onClick={() => setCoachOpen((v) => !v)}
        >
          Coach
        </Button>
      </div>

      {/* Coaching panel */}
      {coachOpen && (
        <div className="-mx-5 -mb-5 mt-1 rounded-b-2xl overflow-hidden">
          <CoachingPanel deal={deal} meddic={meddic} onClose={() => setCoachOpen(false)} />
        </div>
      )}
    </div>
  );
}

export default function DealIntelligencePage() {
  const totalAcv    = MOCK_DEALS.reduce((s, d) => s + d.acv, 0);
  const weightedAcv = MOCK_DEALS.reduce((s, d) => s + d.acv * STAGE_WEIGHT[d.stage], 0);
  const atRisk      = MOCK_DEALS.filter((d) => d.risk === 'high').length;
  const daysToQEnd  = daysUntil('2026-06-30');

  // Stage funnel data
  const STAGES = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'];
  const STAGE_LABEL: Record<string, string> = {
    'Stage 1': 'Prospect', 'Stage 2': 'Qualify', 'Stage 3': 'Develop',
    'Stage 4': 'Propose', 'Stage 5': 'Close',
  };
  const stageAcvs = STAGES.map((s) =>
    MOCK_DEALS.filter((d) => d.stage === s).reduce((sum, d) => sum + d.acv, 0)
  );

  // Gap analysis
  const gaps = MOCK_DEALS.map((deal) => {
    const staks  = MOCK_STAKEHOLDERS.filter((s) => s.accountId === deal.accountId);
    const meddic = getMeddicScore(deal.accountId);
    return {
      deal,
      noChampion:  !staks.some((s) => s.role === 'Champion' && s.strength >= 3),
      noEcoBuyer:  !staks.some((s) => s.role === 'Decision Maker' && s.strength >= 2),
      meddicPct:   Math.round((meddic.filled / 6) * 100),
      meddicGaps:  meddic.gaps,
      stalled:     deal.daysSinceActivity > 14,
    };
  });

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <AppShellCard.Title>Deal Intelligence</AppShellCard.Title>
          <AppShellCard.Subtitle>AI-powered pipeline health · {MOCK_DEALS.length} active deals</AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>

      <div className="flex flex-col gap-8">

        {/* ── PIPELINE SUMMARY ───────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Pipeline', value: `$${(totalAcv / 1_000_000).toFixed(1)}M`, sub: 'open ACV', color: 'text-brand-500' },
              { label: 'Weighted Forecast', value: `$${(weightedAcv / 1_000_000).toFixed(2)}M`, sub: 'risk-adjusted', color: 'text-foreground' },
              { label: 'At Risk', value: atRisk, sub: 'high-risk deals', color: atRisk > 0 ? 'text-destructive' : 'text-success' },
              { label: 'Days to Q-End', value: daysToQEnd, sub: 'Jun 30, 2026', color: daysToQEnd < 30 ? 'text-warning' : 'text-foreground' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Stage funnel bar */}
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">ACV by Stage</p>
            <div className="flex gap-1.5 items-end h-12">
              {STAGES.map((stage, i) => {
                const acv = stageAcvs[i];
                const pct = totalAcv > 0 ? (acv / totalAcv) * 100 : 0;
                const opacity = ['opacity-30', 'opacity-45', 'opacity-65', 'opacity-80', 'opacity-100'];
                return (
                  <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-xs font-semibold text-foreground">{acv > 0 ? `$${(acv / 1000).toFixed(0)}K` : '—'}</p>
                    <div className={`w-full rounded-t-md bg-brand-500 ${opacity[i]} transition-all`}
                      style={{ height: `${Math.max(pct * 0.8, acv > 0 ? 8 : 0)}%`, minHeight: acv > 0 ? '8px' : '0' }} />
                    <p className="text-xs text-muted-foreground">{STAGE_LABEL[stage]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── DEAL HEALTH CARDS ───────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="size-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-foreground">Deal Health</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {MOCK_DEALS.map((deal) => <DealCard key={deal.id} deal={deal} />)}
          </div>
        </section>

        {/* ── GAP ANALYSIS ────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="size-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-foreground">Pipeline Gap Analysis</h2>
            <Badge color="secondary">For pipeline review</Badge>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Account</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center">Champion</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center">Econ. Buyer</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center">MEDDIC</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center">Idle</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center hidden md:table-cell">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {gaps.map(({ deal, noChampion, noEcoBuyer, meddicPct, meddicGaps, stalled }) => (
                  <tr key={deal.id} className="hover:bg-accent transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AccountAvatar accountId={deal.accountId} name={deal.accountName} size="xs" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">{deal.accountName}</p>
                          <p className="text-xs text-muted-foreground">{deal.stage}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {noChampion
                        ? <XCircle className="size-4 text-destructive mx-auto" />
                        : <CheckCircle2 className="size-4 text-success mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {noEcoBuyer
                        ? <XCircle className="size-4 text-destructive mx-auto" />
                        : <CheckCircle2 className="size-4 text-success mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${meddicPct >= 80 ? 'text-success' : meddicPct >= 50 ? 'text-warning' : 'text-destructive'}`}>
                        {meddicPct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${stalled ? 'text-warning' : 'text-muted-foreground'}`}>
                        {deal.daysSinceActivity}d
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {meddicGaps.slice(0, 2).map((g) => (
                          <span key={g} className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">{g}</span>
                        ))}
                        {meddicGaps.length > 2 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{meddicGaps.length - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppShellCard>
  );
}
