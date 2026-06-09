'use client';

import { use, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Input,
  toast,
  Tooltip,
} from '@humain-foundation/ui';
import {
  ArrowLeft,
  Target,
  TrendingUp,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  Save,
  LayoutGrid,
  Zap,
  Eye,
  Info,
} from 'lucide-react';
import {
  MOCK_ACCOUNTS,
  MOCK_DEALS,
  MOCK_STAKEHOLDERS,
  MOCK_SIGNALS,
  MOCK_PRODUCTS,
  MOCK_DEPARTMENTS,
  type DealStage,
} from '@/lib/mock-data';
import {
  computeFitScore,
  computePotentialAcv,
  computeBlindSpots,
  computeTopOpportunities,
  nextCoverageState,
  COVERAGE_STYLE,
  formatAcv,
  type CoverageState,
} from '@/lib/account-planning';
import { useLocalStorage } from '@/hooks/use-local-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  quarter: string;
  text: string;
  done: boolean;
}

interface Risk {
  id: string;
  risk: string;
  impact: 'High' | 'Med' | 'Low';
  mitigation: string;
  status: 'Open' | 'Mitigated';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUARTERS = ['Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027'] as const;

const STAGE_COLOR: Partial<Record<DealStage, string>> & { default: string } = {
  'Qualification':    'secondary',
  'Develop Proposal': 'warning',
  'Submit Proposal':  'primary',
  'Negotiate':        'primary',
  'Won':              'success',
  'Lost':             'destructive',
  'Dropped':          'destructive',
  default:            'secondary',
};

// ─── Defaults ────────────────────────────────────────────────────────────────

function defaultMilestones(accountId: string, stage: DealStage | undefined): Milestone[] {
  const base: Omit<Milestone, 'id'>[] =
    !stage || stage === 'Qualification' ? [
      { quarter: 'Q2 2026', text: 'Complete discovery & qualify pain points', done: false },
      { quarter: 'Q2 2026', text: 'Identify economic buyer and champion', done: false },
      { quarter: 'Q3 2026', text: 'Deliver technical proof of concept', done: false },
    ] : stage === 'Develop Proposal' ? [
      { quarter: 'Q2 2026', text: 'Complete technical evaluation', done: false },
      { quarter: 'Q2 2026', text: 'Secure champion sponsorship', done: false },
      { quarter: 'Q3 2026', text: 'Submit commercial proposal', done: false },
    ] : stage === 'Submit Proposal' ? [
      { quarter: 'Q2 2026', text: 'Deliver business case to economic buyer', done: false },
      { quarter: 'Q2 2026', text: 'Conduct CFO / executive briefing', done: false },
      { quarter: 'Q3 2026', text: 'Navigate legal & procurement review', done: false },
    ] : stage === 'Negotiate' ? [
      { quarter: 'Q2 2026', text: 'Resolve all commercial objections', done: false },
      { quarter: 'Q2 2026', text: 'Secure verbal commitment', done: false },
      { quarter: 'Q3 2026', text: 'Close deal and initiate onboarding', done: false },
    ] : [
      { quarter: 'Q2 2026', text: 'Execute contract and kick off implementation', done: false },
      { quarter: 'Q3 2026', text: 'Complete phase-1 deployment', done: false },
      { quarter: 'Q4 2026', text: 'Expand adoption — new business unit', done: false },
    ];
  return base.map((m, i) => ({ ...m, id: `${accountId}-m${i}` }));
}

function defaultRisks(accountId: string): Risk[] {
  return [
    { id: `${accountId}-r0`, risk: 'Economic buyer not yet engaged — deal may stall at approval stage', impact: 'High', mitigation: 'Work with champion to schedule executive briefing within 30 days', status: 'Open' },
    { id: `${accountId}-r1`, risk: 'Competitor evaluation in parallel — risk of displacement', impact: 'Med', mitigation: 'Accelerate differentiation narrative; share reference architecture', status: 'Open' },
  ];
}

function parseTarget(val: string): number {
  const clean = val.replace(/[$,]/g, '').trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (/[Mm]/.test(val)) return num * 1_000_000;
  if (/[Kk]/.test(val)) return num * 1_000;
  return num;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, noMargin }: {
  icon: React.ReactNode; title: string; subtitle?: string; noMargin?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 ${noMargin ? '' : 'mb-4'}`}>
      <span className="text-brand-500">{icon}</span>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPlanPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);

  const account      = MOCK_ACCOUNTS.find((a) => a.id === accountId) ?? MOCK_ACCOUNTS[0];
  const deals        = MOCK_DEALS.filter((d) => d.accountId === account.id);
  const stakeholders = MOCK_STAKEHOLDERS.filter((s) => s.accountId === account.id);
  const signals      = MOCK_SIGNALS.filter((s) => s.accountId === account.id);
  const primaryDeal  = deals[0];
  const pipelineAcv  = deals.reduce((sum, d) => sum + d.acv, 0);

  // ── localStorage ────────────────────────────────────────────────────────────
  const [objective, setObjective] = useLocalStorage<string>(`plan:obj:${accountId}`, '');
  const [targetRaw, setTargetRaw] = useLocalStorage<string>(`plan:target:${accountId}`, formatAcv(account.totalAcv));
  const [coverage, setCoverage]   = useLocalStorage<Record<string, CoverageState>>(`plan:coverage:${accountId}`, {});
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>(`plan:milestones:${accountId}`, defaultMilestones(accountId, primaryDeal?.stage));
  const [risks, setRisks]         = useLocalStorage<Risk[]>(`plan:risks:${accountId}`, defaultRisks(accountId));

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState<Record<string, string>>({});
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const targetAcv     = parseTarget(targetRaw);
  const coverageRatio = targetAcv > 0 ? pipelineAcv / targetAcv : 0;
  const progressPct   = Math.min(coverageRatio * 100, 100);

  const getCellState = useCallback((productId: string, deptId: string): CoverageState => {
    const key = `${productId}:${deptId}`;
    if (coverage[key]) return coverage[key];
    const score = computeFitScore(account, MOCK_PRODUCTS.find(p => p.id === productId)!, MOCK_DEPARTMENTS.find(d => d.id === deptId)!, stakeholders, signals);
    return score < 30 ? 'not_applicable' : 'whitespace';
  }, [coverage, account, stakeholders, signals]);

  const cycleCell = useCallback((productId: string, deptId: string) => {
    const key = `${productId}:${deptId}`;
    const current = getCellState(productId, deptId);
    const next = nextCoverageState(current);
    setCoverage((prev) => ({ ...prev, [key]: next }));
    toast.success(`Coverage updated to "${COVERAGE_STYLE[next].label}"`);
  }, [getCellState, setCoverage]);

  const blindSpots = useMemo(() =>
    computeBlindSpots(account, MOCK_DEPARTMENTS, MOCK_PRODUCTS, stakeholders, signals, coverage),
    [account, stakeholders, signals, coverage]
  );

  const topOpportunities = useMemo(() =>
    computeTopOpportunities(account, MOCK_PRODUCTS, MOCK_DEPARTMENTS, stakeholders, signals, coverage),
    [account, stakeholders, signals, coverage]
  );

  const totalWhitespaceAcv = useMemo(() => {
    let total = 0;
    for (const prod of MOCK_PRODUCTS) {
      for (const dept of MOCK_DEPARTMENTS) {
        const state = getCellState(prod.id, dept.id);
        if (state === 'whitespace' || state === 'identified') {
          const fit = computeFitScore(account, prod, dept, stakeholders, signals);
          if (fit >= 45) total += computePotentialAcv(account, prod, dept, fit);
        }
      }
    }
    return total;
  }, [getCellState, account, stakeholders, signals]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleObjectiveBlur = useCallback(() => {
    setLastSaved(new Date());
    toast.success('Strategic objective saved');
  }, []);

  const toggleMilestone = (id: string) =>
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, done: !m.done } : m));

  const addMilestone = (quarter: string) => {
    const text = newMilestoneText[quarter]?.trim();
    if (!text) return;
    setMilestones((prev) => [...prev, { id: `${accountId}-m${Date.now()}`, quarter, text, done: false }]);
    setNewMilestoneText((prev) => ({ ...prev, [quarter]: '' }));
  };

  const removeMilestone = (id: string) =>
    setMilestones((prev) => prev.filter((m) => m.id !== id));

  const addRisk = () =>
    setRisks((prev) => [...prev, { id: `${accountId}-r${Date.now()}`, risk: '', impact: 'Med', mitigation: '', status: 'Open' }]);

  const updateRisk = (id: string, field: keyof Risk, value: string) =>
    setRisks((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));

  const removeRisk = (id: string) =>
    setRisks((prev) => prev.filter((r) => r.id !== id));

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <AppShellCard.Title>Account Plan — {account.name}</AppShellCard.Title>
          <AppShellCard.Subtitle>{account.industry} · {account.tier}</AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>
      <AppShellCard.Actions>
        <Button appearance="ghost" size="sm" render={<Link href={`/accounts/${accountId}`} />} startIcon={<ArrowLeft className="size-4" />}>
          Back to Account 360
        </Button>
        {lastSaved && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Save className="size-3.5" />
            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </AppShellCard.Actions>

      <div className="flex flex-col gap-10">

        {/* ── 1. Strategic Objective ──────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<Target className="size-4" />} title="Strategic Objective" subtitle="Vision, partnership depth, and 3-year horizon for this account" />
          <textarea
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 min-h-[110px]"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            onBlur={handleObjectiveBlur}
            placeholder="Define the strategic objective — vision, partnership depth, 3-year horizon…"
          />
        </section>

        {/* ── 2. Revenue Plan ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<TrendingUp className="size-4" />} title="Revenue Plan" subtitle="FY target vs. open pipeline" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-col gap-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revenue Targets</p>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">FY Target</label>
                <Input value={targetRaw} onChange={(e) => setTargetRaw(e.target.value)} placeholder="e.g. $1.2M" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Pipeline vs Target</span>
                  <span className="text-xs font-semibold text-foreground">{formatAcv(pipelineAcv)} / {formatAcv(targetAcv)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${progressPct >= 100 ? 'bg-success' : progressPct >= 70 ? 'bg-brand-500' : progressPct >= 40 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Pipeline Coverage</span>
                <Badge color={coverageRatio >= 1 ? 'success' : coverageRatio >= 0.7 ? 'primary' : coverageRatio >= 0.4 ? 'warning' : 'destructive'}>
                  {coverageRatio.toFixed(1)}x
                </Badge>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Open Deals</p>
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open deals.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {deals.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{d.accountName}</p>
                        <p className="text-xs text-muted-foreground">Close {d.closeDate}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge color={(STAGE_COLOR[d.stage] ?? STAGE_COLOR.default) as 'secondary' | 'warning' | 'primary' | 'success' | 'destructive'}>{d.stage}</Badge>
                        <span className="text-sm font-semibold text-foreground">{formatAcv(d.acv)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. Product Coverage Map ──────────────────────────────────────── */}
        <section>
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <SectionHeader
              icon={<LayoutGrid className="size-4" />}
              title="Product Coverage Map"
              subtitle="Click any cell to cycle its coverage state — track whitespace and active footprint"
              noMargin
            />
            <div className="flex items-center gap-2 shrink-0">
              <Zap className="size-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-foreground">Addressable whitespace:</span>
              <Badge color="warning">{formatAcv(totalWhitespaceAcv)}</Badge>
            </div>
          </div>

          {/* Blind spot alerts */}
          {blindSpots.length > 0 && (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="size-4 text-destructive shrink-0" />
                <p className="text-sm font-semibold text-foreground">
                  {blindSpots.length} blind spot{blindSpots.length > 1 ? 's' : ''} — departments with high-fit products but no stakeholder engagement
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {blindSpots.map((bs) => (
                  <div key={bs.department.id} className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-card px-3 py-1">
                    <span className="text-xs font-semibold text-foreground">{bs.department.shortName}</span>
                    <span className="text-xs text-muted-foreground">→ {bs.topProduct.name}</span>
                    <Badge color="destructive">{bs.fitScore}% fit</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap + Opportunities side by side */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">

            {/* Heatmap */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse" style={{ minWidth: '640px' }}>
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground w-44">Product</th>
                    {MOCK_DEPARTMENTS.map((dept) => (
                      <th key={dept.id} className="text-center px-1 py-2.5 text-xs font-semibold text-muted-foreground">
                        <Tooltip.Root>
                          <Tooltip.Trigger>
                            <span className="cursor-help underline decoration-dotted">{dept.shortName}</span>
                          </Tooltip.Trigger>
                          <Tooltip.Popup>
                            <p className="text-xs font-medium">{dept.name}</p>
                            <p className="text-xs text-muted-foreground">{dept.budgetType} · {dept.typicalRole}</p>
                          </Tooltip.Popup>
                        </Tooltip.Root>
                      </th>
                    ))}
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">Active ACV</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PRODUCTS.map((product) => {
                    const activeAcv = MOCK_DEPARTMENTS.reduce((sum, dept) => {
                      const state = getCellState(product.id, dept.id);
                      if (state !== 'active') return sum;
                      const fit = computeFitScore(account, product, dept, stakeholders, signals);
                      return sum + computePotentialAcv(account, product, dept, fit);
                    }, 0);

                    return (
                      <tr key={product.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none">{product.icon}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground leading-tight">{product.name}</p>
                              <p className="text-[10px] text-muted-foreground">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        {MOCK_DEPARTMENTS.map((dept) => {
                          const key = `${product.id}:${dept.id}`;
                          const state = getCellState(product.id, dept.id);
                          const fitScore = computeFitScore(account, product, dept, stakeholders, signals);
                          const potAcv = computePotentialAcv(account, product, dept, fitScore);
                          const style = COVERAGE_STYLE[state];
                          const isHovered = hoveredCell === key;

                          return (
                            <td key={dept.id} className="px-1 py-1.5">
                              <Tooltip.Root>
                                <Tooltip.Trigger>
                                  <button
                                    onClick={() => cycleCell(product.id, dept.id)}
                                    onMouseEnter={() => setHoveredCell(key)}
                                    onMouseLeave={() => setHoveredCell(null)}
                                    className={`w-full rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer
                                      ${style.bg} ${style.border}
                                      ${isHovered ? 'opacity-80 scale-95' : 'opacity-100'}
                                      ${state === 'not_applicable' ? 'opacity-40' : ''}
                                    `}
                                    style={{ height: '52px', minWidth: '68px' }}
                                  >
                                    <span className={`text-[10px] font-bold tracking-wide ${state === 'not_applicable' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                      {style.short}
                                    </span>
                                    {fitScore >= 30 && (
                                      <span className="text-[9px] text-muted-foreground">{fitScore}%</span>
                                    )}
                                  </button>
                                </Tooltip.Trigger>
                                <Tooltip.Popup>
                                  <div className="text-xs space-y-0.5">
                                    <p className="font-semibold">{product.name} → {dept.name}</p>
                                    <p>State: <span className="font-medium">{style.label}</span></p>
                                    <p>Fit score: <span className="font-medium">{fitScore}%</span></p>
                                    <p>Potential ACV: <span className="font-medium">{formatAcv(potAcv)}</span></p>
                                    <p className="text-muted-foreground pt-0.5">Click to change state</p>
                                  </div>
                                </Tooltip.Popup>
                              </Tooltip.Root>
                            </td>
                          );
                        })}
                        <td className="px-4 py-2 text-right">
                          <span className={`text-xs font-semibold ${activeAcv > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                            {activeAcv > 0 ? formatAcv(activeAcv) : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Top opportunities panel */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <Eye className="size-3.5 text-brand-500" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Top Opportunities</p>
              </div>
              {topOpportunities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No whitespace opportunities identified above the fit threshold.</p>
              ) : (
                topOpportunities.map((opp, i) => (
                  <div key={`${opp.product.id}:${opp.department.id}`}
                    className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm shrink-0">{opp.product.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{opp.product.name}</p>
                          <p className="text-[10px] text-muted-foreground">{opp.department.shortName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge color={opp.fitScore >= 75 ? 'success' : opp.fitScore >= 55 ? 'warning' : 'secondary'}>
                          {opp.fitScore}%
                        </Badge>
                        {i === 0 && <Badge color="primary">#1</Badge>}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-brand-500">{formatAcv(opp.potentialAcv)}</p>
                    <div className="flex flex-wrap gap-1">
                      {opp.reasons.map((r) => (
                        <span key={r} className="text-[10px] text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5">{r}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Info className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Legend:</span>
            </div>
            {Object.entries(COVERAGE_STYLE).map(([state, s]) => (
              <div key={state} className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${s.bg} ${s.border}`}>
                <span className="text-[10px] font-bold text-foreground">{s.short}</span>
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Quarterly Milestones ──────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<Calendar className="size-4" />} title="Quarterly Milestones" subtitle="Track key actions and commitments per quarter" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUARTERS.map((q) => {
              const qMilestones = milestones.filter((m) => m.quarter === q);
              return (
                <div key={q} className="rounded-xl border border-border bg-card px-4 py-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">{q}</p>
                  <div className="flex flex-col gap-2">
                    {qMilestones.map((m) => (
                      <div key={m.id} className="flex items-start gap-2 group">
                        <button onClick={() => toggleMilestone(m.id)} className="mt-0.5 shrink-0 text-muted-foreground hover:text-brand-500 transition-colors">
                          {m.done ? <CheckSquare className="size-4 text-success" /> : <Square className="size-4" />}
                        </button>
                        <p className={`text-xs flex-1 leading-relaxed ${m.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {m.text}
                        </p>
                        <button onClick={() => removeMilestone(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <input
                      type="text"
                      className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-500/40"
                      placeholder="Add milestone…"
                      value={newMilestoneText[q] ?? ''}
                      onChange={(e) => setNewMilestoneText((prev) => ({ ...prev, [q]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') addMilestone(q); }}
                    />
                    <button onClick={() => addMilestone(q)} className="shrink-0 rounded-md bg-brand-500/10 p-1 text-brand-500 hover:bg-brand-500/20 transition-colors">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. Risk Register ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionHeader icon={<ShieldAlert className="size-4" />} title="Risk Register" subtitle="Track risks, impact, mitigation and status" noMargin />
            <Button appearance="outline" size="sm" startIcon={<Plus className="size-4" />} onClick={addRisk}>
              Add Risk
            </Button>
          </div>
          {risks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No risks logged.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[32%]">Risk</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[10%]">Impact</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[35%]">Mitigation</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[15%]">Status</th>
                    <th className="px-4 py-2.5 w-[5%]" />
                  </tr>
                </thead>
                <tbody>
                  {risks.map((r, i) => (
                    <tr key={r.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-background'}`}>
                      <td className="px-4 py-2.5">
                        <input className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" value={r.risk} onChange={(e) => updateRisk(r.id, 'risk', e.target.value)} placeholder="Describe the risk…" />
                      </td>
                      <td className="px-4 py-2.5">
                        <select className="bg-transparent text-xs font-medium focus:outline-none text-foreground" value={r.impact} onChange={(e) => updateRisk(r.id, 'impact', e.target.value as Risk['impact'])}>
                          <option value="High">High</option>
                          <option value="Med">Med</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <input className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" value={r.mitigation} onChange={(e) => updateRisk(r.id, 'mitigation', e.target.value)} placeholder="Mitigation plan…" />
                      </td>
                      <td className="px-4 py-2.5">
                        <select className="bg-transparent text-xs font-medium focus:outline-none text-foreground" value={r.status} onChange={(e) => updateRisk(r.id, 'status', e.target.value as Risk['status'])}>
                          <option value="Open">Open</option>
                          <option value="Mitigated">Mitigated</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => removeRisk(r.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center gap-3 mt-3">
            <AlertTriangle className="size-3.5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Badge color="destructive">High</Badge>
              <Badge color="warning">Med</Badge>
              <Badge color="secondary">Low</Badge>
              <Badge color="success">Mitigated</Badge>
            </div>
          </div>
        </section>

      </div>
    </AppShellCard>
  );
}
