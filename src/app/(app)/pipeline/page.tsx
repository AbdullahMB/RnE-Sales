'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShellCard, Badge, Button } from '@humain-foundation/ui';
import { toast } from '@humain-foundation/ui';
import {
  AlertTriangle, Clock, TrendingUp, Users, Sparkles,
  CheckCircle2, XCircle, Target, Calendar,
  ShieldAlert, ChevronRight, BrainCircuit, Lightbulb,
  ChevronDown, ChevronUp, StickyNote, Save, Trophy,
  Layers, BarChart3, Filter, Database,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePipelineData } from '@/hooks/use-pipeline-data';
import { ExcelImportDialog } from '@/components/excel-import-dialog';
import {
  MOCK_ACCOUNTS,
  MOCK_STAKEHOLDERS,
  MOCK_SIGNALS,
  MOCK_TASKS,
  MOCK_MEETING_SUMMARY,
  type Deal,
} from '@/lib/mock-data';
import { computeAccountHealth, HEALTH_STYLE } from '@/lib/health';
import { AccountAvatar } from '@/components/account-avatar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLOSED_STAGES = new Set<Deal['stage']>(['Won', 'Lost', 'Dropped']);

const STAGE_WEIGHT: Record<string, number> = {
  'Qualification':   0.20,
  'Develop Proposal':0.40,
  'Submit Proposal': 0.60,
  'Negotiate':       0.80,
  'Won':             1.00,
  'Lost':            0,
  'Dropped':         0,
};

function fmtAcv(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function daysUntil(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - new Date('2026-06-09').getTime()) / 86400000);
}

// ─── MEDDIC ──────────────────────────────────────────────────────────────────

function getMeddicScore(accountId: string): { filled: number; total: 6; gaps: string[] } {
  const staks = MOCK_STAKEHOLDERS.filter((s) => s.accountId === accountId);
  const gaps: string[] = [];

  if (accountId === MOCK_MEETING_SUMMARY.accountId) {
    const m = MOCK_MEETING_SUMMARY.meddic;
    const fields = [
      { label: 'Metrics',           val: m.metrics },
      { label: 'Economic Buyer',    val: m.economicBuyer },
      { label: 'Decision Criteria', val: m.decisionCriteria },
      { label: 'Decision Process',  val: m.decisionProcess },
      { label: 'Identified Pain',   val: m.identifiedPain },
      { label: 'Champion',          val: m.champion },
    ];
    const filled = fields.filter((f) => !!f.val).length;
    fields.filter((f) => !f.val).forEach((f) => gaps.push(f.label));
    return { filled, total: 6, gaps };
  }

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function CloseDateChip({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr);
  const color = days < 30 ? 'text-destructive' : days < 60 ? 'text-warning' : 'text-success';
  const bg    = days < 30 ? 'bg-destructive/10 border-destructive/20' : days < 60 ? 'bg-warning/10 border-warning/20' : 'bg-success/10 border-success/20';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${color} ${bg}`}>
      <Calendar className="size-3" />
      {days > 0 ? `${days}d to close` : days === 0 ? 'Today' : 'Overdue'}
    </span>
  );
}

function MeddicRing({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
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
        <p className={`text-sm font-bold leading-none ${pct === 100 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-destructive'}`}>{filled}/{total}</p>
        <p className="text-xs text-muted-foreground leading-none mt-0.5">MEDDIC</p>
      </div>
    </div>
  );
}

function HealthBar({ score, label, color }: { score: number; label: string; color: 'success' | 'warning' | 'destructive' }) {
  const barColor  = color === 'success' ? 'bg-success' : color === 'warning' ? 'bg-warning' : 'bg-destructive';
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

// ─── Coaching ─────────────────────────────────────────────────────────────────

const COACHING_TIPS: Record<string, { action: string; why: string; priority: 'high' | 'medium' }> = {
  'Champion': {
    action: 'Identify an internal advocate who uses the platform daily and has budget influence. Schedule a working session — not a demo — to co-build the business case together.',
    why: 'Deals without a champion are 3× more likely to stall.',
    priority: 'high',
  },
  'Economic Buyer': {
    action: 'Ask your champion: "Who owns the budget for this initiative?" Then request an executive briefing with a 1-page financial impact summary.',
    why: 'Without Economic Buyer engagement, proposals sit in queues.',
    priority: 'high',
  },
  'Metrics': {
    action: 'Run a value quantification session. Ask: "What does this cost you per month?" Anchor the deal to a number they already care about.',
    why: 'Without agreed metrics, any price feels arbitrary.',
    priority: 'high',
  },
  'Decision Criteria': {
    action: 'Ask to review the evaluation framework or be included in the RFP process. Offer to help build it — make sure your strengths are reflected.',
    why: 'Letting the customer define criteria without your input means competitors shaped the rules.',
    priority: 'medium',
  },
  'Decision Process': {
    action: 'Map the full approval chain with your champion. Ask: "Walk me through the last time you bought something at this spend level."',
    why: 'Surprise stakeholders kill deals at the finish line.',
    priority: 'medium',
  },
  'Identified Pain': {
    action: 'Re-run discovery focused entirely on business impact. Use the Pain Chain: operational pain → business problem → financial impact → executive priority.',
    why: 'Pain is the engine of urgency. Without it, price becomes the differentiator.',
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
      <Button size="sm" appearance="outline" startIcon={<Save className="size-3.5" />}
        onClick={() => { setNote(draft); toast.success('Note saved'); }}>
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
                    : <AlertTriangle className="size-3.5 text-warning shrink-0" />}
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

      <CoachingNote dealId={deal.id} />
    </div>
  );
}

// ─── Deal Card ────────────────────────────────────────────────────────────────

function DealCard({ deal }: { deal: Deal }) {
  const [coachOpen, setCoachOpen] = useState(false);
  const account = MOCK_ACCOUNTS.find((a) => a.id === deal.accountId);
  const staks   = MOCK_STAKEHOLDERS.filter((s) => s.accountId === deal.accountId);
  const sigs    = MOCK_SIGNALS.filter((s) => s.accountId === deal.accountId);
  const health  = account
    ? computeAccountHealth(account, [deal], staks, sigs)
    : { status: 'at-risk' as const, score: 50, reasons: [] };
  const hs      = HEALTH_STYLE[health.status];
  const meddic  = getMeddicScore(deal.accountId);
  const nextAction = MOCK_TASKS.find((t) => t.dealId === deal.id);
  const isStalled  = deal.daysSinceActivity > 14;

  const riskColor: Record<Deal['risk'], 'destructive' | 'warning' | 'success'> = {
    high: 'destructive', medium: 'warning', low: 'success',
  };

  const weighted = deal.acv * (deal.probability / 100);

  return (
    <div className={`flex flex-col gap-4 rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow ${
      isStalled ? 'border-warning/40' : 'border-border'
    }`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AccountAvatar accountId={deal.accountId} name={deal.accountName} size="md" />
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate leading-tight">{deal.title}</p>
            <p className="text-xs text-muted-foreground truncate">{deal.customer} · {deal.subSector}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
          <Badge color="secondary">{deal.stage}</Badge>
          <Badge color={riskColor[deal.risk]}>{deal.risk === 'low' ? 'On Track' : deal.risk === 'medium' ? 'Medium' : 'High Risk'}</Badge>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/40 px-4 py-3">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{fmtAcv(deal.acv)}</p>
          <p className="text-xs text-muted-foreground">Deal Value</p>
        </div>
        <div className="text-center border-x border-border">
          <p className={`text-lg font-bold ${isStalled ? 'text-warning' : 'text-foreground'}`}>{deal.daysSinceActivity}d</p>
          <p className="text-xs text-muted-foreground">Idle</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-brand-500">{fmtAcv(weighted)}</p>
          <p className="text-xs text-muted-foreground">Weighted ({deal.probability}%)</p>
        </div>
      </div>

      {/* Health + MEDDIC */}
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

      {/* Actions */}
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

      {coachOpen && (
        <div className="-mx-5 -mb-5 mt-1 rounded-b-2xl overflow-hidden">
          <CoachingPanel deal={deal} meddic={meddic} onClose={() => setCoachOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Sub Sector Breakdown ─────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  'Energy':                  'bg-amber-500/10 border-amber-400/30 text-amber-600 dark:text-amber-400',
  'Mining':                  'bg-stone-500/10 border-stone-400/30 text-stone-600 dark:text-stone-400',
  'Industrial Manufacturing':'bg-blue-500/10 border-blue-400/30 text-blue-600 dark:text-blue-400',
  'Utilities & Services':    'bg-teal-500/10 border-teal-400/30 text-teal-600 dark:text-teal-400',
};

function getSectorColor(sector: string) {
  return SECTOR_COLORS[sector] ?? 'bg-brand-500/10 border-brand-400/30 text-brand-600';
}

function SubSectorBreakdown({ deals }: { deals: Deal[] }) {
  const sectors = useMemo(() => {
    const map: Record<string, { totalAcv: number; weightedAcv: number; active: number; won: number; lost: number }> = {};
    for (const d of deals) {
      if (!map[d.subSector]) map[d.subSector] = { totalAcv: 0, weightedAcv: 0, active: 0, won: 0, lost: 0 };
      const s = map[d.subSector];
      if (d.stage === 'Won') { s.totalAcv += d.acv; s.weightedAcv += d.acv; s.won++; }
      else if (d.stage === 'Lost' || d.stage === 'Dropped') { s.lost++; }
      else { s.totalAcv += d.acv; s.weightedAcv += d.acv * (d.probability / 100); s.active++; }
    }
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.totalAcv - a.totalAcv);
  }, [deals]);

  const grandTotal = sectors.reduce((s, sec) => s + sec.totalAcv, 0);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {sectors.map((sec) => {
        const pct = grandTotal > 0 ? Math.round((sec.totalAcv / grandTotal) * 100) : 0;
        const cls = getSectorColor(sec.name);
        return (
          <div key={sec.name} className={`rounded-xl border p-4 flex flex-col gap-3 ${cls}`}>
            <div className="flex items-start justify-between">
              <p className="font-semibold text-sm leading-tight">{sec.name}</p>
              <span className="text-xs font-medium opacity-70">{pct}%</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{fmtAcv(sec.totalAcv)}</p>
              <p className="text-xs opacity-70 mt-0.5">total pipeline</p>
            </div>
            <div className="h-1.5 rounded-full bg-current/20 overflow-hidden">
              <div className="h-full rounded-full bg-current transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex gap-3 text-xs opacity-80">
              <span>{sec.active} active</span>
              {sec.won > 0 && <span className="text-success font-semibold">{sec.won} won</span>}
              {sec.lost > 0 && <span className="text-destructive font-semibold">{sec.lost} lost</span>}
              <span className="ml-auto">{fmtAcv(sec.weightedAcv)} wtd</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DealIntelligencePage() {
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(false);
  const { deals, importDeals, resetImport, hasCustomData } = usePipelineData();

  const activeDeals = deals.filter((d) => !CLOSED_STAGES.has(d.stage));
  const closedDeals = deals.filter((d) => CLOSED_STAGES.has(d.stage));
  const wonDeals    = closedDeals.filter((d) => d.stage === 'Won');

  const totalPipeline = activeDeals.reduce((s, d) => s + d.acv, 0);
  const weightedAcv   = activeDeals.reduce((s, d) => s + d.acv * (d.probability / 100), 0);
  const wonAcv        = wonDeals.reduce((s, d) => s + d.acv, 0);
  const atRisk        = activeDeals.filter((d) => d.risk === 'high').length;
  const daysToQEnd    = daysUntil('2026-06-30');

  const allSectors    = [...new Set(deals.map((d) => d.subSector))];

  const filteredActive = sectorFilter
    ? activeDeals.filter((d) => d.subSector === sectorFilter)
    : activeDeals;

  // Stage funnel for active deals
  const STAGES = ['Qualification', 'Develop Proposal', 'Submit Proposal', 'Negotiate'];
  const stageAcvs = STAGES.map((s) =>
    activeDeals.filter((d) => d.stage === s).reduce((sum, d) => sum + d.acv, 0)
  );

  // Gap analysis
  const gaps = activeDeals.map((deal) => {
    const staks  = MOCK_STAKEHOLDERS.filter((s) => s.accountId === deal.accountId);
    const meddic = getMeddicScore(deal.accountId);
    return {
      deal,
      noChampion: !staks.some((s) => s.role === 'Champion' && s.strength >= 3),
      noEcoBuyer: !staks.some((s) => s.role === 'Decision Maker' && s.strength >= 2),
      meddicPct:  Math.round((meddic.filled / 6) * 100),
      meddicGaps: meddic.gaps,
      stalled:    deal.daysSinceActivity > 14,
    };
  });

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <div className="flex items-center gap-2">
            <AppShellCard.Title>Deal Intelligence</AppShellCard.Title>
            {hasCustomData && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 text-xs font-medium text-brand-500">
                <Database className="size-3" /> Imported data
              </span>
            )}
          </div>
          <AppShellCard.Subtitle>
            {activeDeals.length} active deals · {wonDeals.length} won · {closedDeals.filter((d) => d.stage === 'Lost').length} lost
          </AppShellCard.Subtitle>
        </div>
        <ExcelImportDialog
          onImport={(newDeals) => { importDeals(newDeals); toast.success(`Imported ${newDeals.length} deals from Excel`); }}
          onReset={() => { resetImport(); toast.success('Reset to default pipeline data'); }}
          hasCustomData={hasCustomData}
        />
      </AppShellCard.Header>

      <div className="flex flex-col gap-8">

        {/* ── KPI SUMMARY ──────────────────────────────────────────── */}
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Active Pipeline',    value: fmtAcv(totalPipeline), sub: `${activeDeals.length} open deals`,   color: 'text-brand-500' },
              { label: 'Weighted Forecast',  value: fmtAcv(weightedAcv),   sub: 'probability-adjusted',               color: 'text-foreground' },
              { label: 'Won (Closed)',       value: fmtAcv(wonAcv),         sub: `${wonDeals.length} deal${wonDeals.length !== 1 ? 's' : ''} closed won`, color: 'text-success' },
              { label: 'Days to Q-End',      value: daysToQEnd,             sub: 'Jun 30, 2026',                       color: daysToQEnd < 30 ? 'text-warning' : 'text-foreground' },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card px-5 py-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Stage funnel */}
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Active Pipeline by Stage</p>
            <div className="flex gap-1.5 items-end h-14">
              {STAGES.map((stage, i) => {
                const acv = stageAcvs[i];
                const pct = totalPipeline > 0 ? (acv / totalPipeline) * 100 : 0;
                const opacity = ['opacity-30', 'opacity-50', 'opacity-70', 'opacity-100'];
                const count = activeDeals.filter((d) => d.stage === stage).length;
                return (
                  <div key={stage} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-xs font-semibold text-foreground">{acv > 0 ? fmtAcv(acv) : '—'}</p>
                    <div className={`w-full rounded-t-md bg-brand-500 ${opacity[i]} transition-all`}
                      style={{ height: `${Math.max(pct * 0.8, acv > 0 ? 8 : 0)}%`, minHeight: acv > 0 ? '8px' : '0' }} />
                    <p className="text-xs text-muted-foreground leading-tight text-center">{stage.replace(' ', ' ')}</p>
                    {count > 0 && <p className="text-[10px] text-muted-foreground/70">{count} deal{count > 1 ? 's' : ''}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SUB SECTOR BREAKDOWN ─────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="size-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-foreground">Sub Sector Breakdown</h2>
            <Badge color="secondary">{allSectors.length} sectors</Badge>
          </div>
          <SubSectorBreakdown deals={deals} />
        </section>

        {/* ── DEAL HEALTH CARDS ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-foreground">Active Deals</h2>
              <Badge color="secondary">{filteredActive.length} deals</Badge>
            </div>

            {/* Sub sector filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="size-3.5 text-muted-foreground" />
              <button
                onClick={() => setSectorFilter(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  sectorFilter === null
                    ? 'bg-brand-500 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {allSectors.filter((s) => activeDeals.some((d) => d.subSector === s)).map((sector) => (
                <button
                  key={sector}
                  onClick={() => setSectorFilter(sectorFilter === sector ? null : sector)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    sectorFilter === sector
                      ? 'bg-brand-500 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredActive.map((deal) => <DealCard key={deal.id} deal={deal} />)}
          </div>
        </section>

        {/* ── CLOSED DEALS ─────────────────────────────────────────── */}
        <section>
          <button
            onClick={() => setShowClosed((v) => !v)}
            className="flex items-center gap-2 mb-4 group w-full text-left"
          >
            <Trophy className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Closed Deals</h2>
            <Badge color="secondary">{closedDeals.length} deals</Badge>
            <ChevronDown className={`size-4 text-muted-foreground ml-auto transition-transform ${showClosed ? 'rotate-180' : ''}`} />
          </button>

          {showClosed && (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Deal</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-right">Value</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Sub Sector</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {closedDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-accent transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <AccountAvatar accountId={deal.accountId} name={deal.accountName} size="xs" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">{deal.title}</p>
                            <p className="text-xs text-muted-foreground">{deal.customer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge color={deal.stage === 'Won' ? 'success' : 'destructive'}>{deal.stage}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-foreground">{fmtAcv(deal.acv)}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">{deal.subSector}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">{deal.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── GAP ANALYSIS ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="size-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-foreground">Pipeline Gap Analysis</h2>
            <Badge color="secondary">Active deals only</Badge>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Deal</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center">Champion</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center">Econ. Buyer</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center">MEDDIC</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-center">Idle</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Missing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {gaps.map(({ deal, noChampion, noEcoBuyer, meddicPct, meddicGaps, stalled }) => (
                  <tr key={deal.id} className="hover:bg-accent transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AccountAvatar accountId={deal.accountId} name={deal.accountName} size="xs" />
                        <div>
                          <p className="font-semibold text-foreground text-sm">{deal.title}</p>
                          <p className="text-xs text-muted-foreground">{deal.customer} · {deal.stage}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {noChampion ? <XCircle className="size-4 text-destructive mx-auto" /> : <CheckCircle2 className="size-4 text-success mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {noEcoBuyer ? <XCircle className="size-4 text-destructive mx-auto" /> : <CheckCircle2 className="size-4 text-success mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${meddicPct >= 80 ? 'text-success' : meddicPct >= 50 ? 'text-warning' : 'text-destructive'}`}>
                        {meddicPct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-semibold ${stalled ? 'text-warning' : 'text-muted-foreground'}`}>{deal.daysSinceActivity}d</span>
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
