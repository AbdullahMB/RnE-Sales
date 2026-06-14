'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@humain-foundation/ui';
import Link from 'next/link';
import {
  AppShellCard, Badge, Button, Tooltip, BarChart, DonutChart,
} from '@humain-foundation/ui';
import {
  AlertTriangle, TrendingUp, TrendingDown, Zap, ChevronRight,
  Check, X, Newspaper, UserMinus, DollarSign, ArrowRight, Minus,
  Target, BarChart2, ShieldAlert, Sparkles,
  Clock,
} from 'lucide-react';
import { AccountAvatar } from '@/components/account-avatar';
import {
  MOCK_DEALS, MOCK_SIGNALS, MOCK_TASKS, MOCK_STAKEHOLDERS,
  MOCK_ACCOUNTS, type Signal, type SuggestedTask,
} from '@/lib/mock-data';
import { computeAccountHealth, HEALTH_STYLE } from '@/lib/health';

// ─── Types & constants ────────────────────────────────────────────────────────

type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

const SIGNAL_ICON: Record<Signal['type'], { icon: React.ReactNode; label: string }> = {
  leadership: { icon: <UserMinus className="size-4" />,  label: 'Leadership' },
  funding:    { icon: <DollarSign className="size-4" />, label: 'Funding' },
  news:       { icon: <Newspaper className="size-4" />,  label: 'News' },
  product:    { icon: <Zap className="size-4" />,        label: 'Product' },
};

const PRIORITY_COLOR: Record<SuggestedTask['priority'], BadgeColor> = {
  high: 'destructive', medium: 'warning', low: 'secondary',
};

const DEAL_DELTA: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  d1: { icon: <TrendingUp className="size-3" />,    label: 'Advanced',   color: 'text-success' },
  d2: { icon: <AlertTriangle className="size-3" />, label: 'Stalled',    color: 'text-destructive' },
  d3: { icon: <TrendingUp className="size-3" />,    label: 'New signal', color: 'text-brand-600' },
  d4: { icon: <TrendingDown className="size-3" />,  label: 'Slipped',    color: 'text-destructive' },
  d5: { icon: <Minus className="size-3" />,         label: 'No change',  color: 'text-muted-foreground' },
};

// ─── Brand building blocks (HUMAIN visual language) ───────────────────────────

/** Bold title with the short brand underline used across HUMAIN decks. */
function SectionTitle({ children, badge }: { children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5">
        <h2 className="text-base font-bold tracking-tight text-foreground">{children}</h2>
        {badge}
      </div>
      <div className="mt-1.5 h-0.5 w-9 rounded-full bg-brand-500" />
    </div>
  );
}

/** Outlined numbered circle, like the step markers on HUMAIN slides. */
function StepCircle({ n, filled = false }: { n: number; filled?: boolean }) {
  return (
    <span
      className={[
        'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        filled
          ? 'bg-brand-500 text-white'
          : 'border-2 border-brand-500 text-brand-600 dark:text-brand-400',
      ].join(' ')}
    >
      {n}
    </span>
  );
}

/** Light brand-tinted circular icon chip. */
function IconChip({ children, size = 'md' }: { children: React.ReactNode; size?: 'md' | 'lg' }) {
  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400',
        size === 'lg' ? 'size-11' : 'size-9',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [dismissedArr, setDismissedArr] = useLocalStorage<string[]>('dismissed-tasks', []);
  const dismissedTasks = new Set(dismissedArr);
  const setDismissedTasks = (fn: (prev: Set<string>) => Set<string>) =>
    setDismissedArr((arr) => [...fn(new Set(arr))]);

  // Pipeline by stage
  const stageOrder = ['Qualification', 'Develop Proposal', 'Submit Proposal', 'Negotiate', 'Won'] as const;
  const pipelineByStage = stageOrder.map((s) => ({
    id: s,
    label: s === 'Develop Proposal' ? 'Develop' : s === 'Submit Proposal' ? 'Submit' : s,
    values: {
      acv: MOCK_DEALS.filter((d) => d.stage === s).reduce((sum, d) => sum + d.acv, 0) / 1_000_000,
    },
  })).filter((d) => d.values.acv > 0);

  // Risk split
  const riskCounts = {
    high:   MOCK_DEALS.filter((d) => d.risk === 'high').length,
    medium: MOCK_DEALS.filter((d) => d.risk === 'medium').length,
    low:    MOCK_DEALS.filter((d) => d.risk === 'low').length,
  };

  const activeDeals    = MOCK_DEALS.filter((d) => !['Won','Lost','Dropped'].includes(d.stage));
  const stalledDeals   = activeDeals.filter((d) => d.daysSinceActivity > 14);
  const highRiskDeals  = activeDeals.filter((d) => d.risk === 'high');
  const activeTasks    = MOCK_TASKS.filter((t) => !dismissedTasks.has(t.id));
  const totalPipeline  = activeDeals.reduce((s, d) => s + d.acv, 0);
  const weightedFcast  = activeDeals.reduce((s, d) => s + d.acv * (d.probability / 100), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const priorityItems: Array<{ type: 'deal' | 'task'; id: string; label: string; sub: string; href: string; urgent: boolean }> = [
    ...stalledDeals.filter((d) => d.risk === 'high').map((d) => ({
      type: 'deal' as const,
      id: d.id,
      label: d.title,
      sub: `${d.customer} · ${d.daysSinceActivity}d idle · ${d.stage}`,
      href: `/accounts/${d.accountId}`,
      urgent: true,
    })),
    ...activeTasks.filter((t) => t.priority === 'high').map((t) => ({
      type: 'task' as const,
      id: t.id,
      label: t.action,
      sub: t.accountName,
      href: `/accounts/${MOCK_DEALS.find((d) => d.id === t.dealId)?.accountId ?? ''}`,
      urgent: false,
    })),
  ].slice(0, 4);

  const fmtAcv = (v: number) =>
    v >= 1_000_000 ? `SAR ${(v / 1_000_000).toFixed(1)}M` : `SAR ${(v / 1000).toFixed(0)}K`;

  const kpis = [
    { label: 'Active Pipeline',   value: fmtAcv(totalPipeline), sub: `${activeDeals.length} open deals`, icon: <BarChart2 className="size-4.5" /> },
    { label: 'Weighted Forecast', value: fmtAcv(weightedFcast), sub: 'Probability-adjusted',             icon: <Target className="size-4.5" /> },
    { label: 'Stalled Deals',     value: stalledDeals.length,   sub: 'More than 14 days idle',           icon: <Clock className="size-4.5" />,       alert: stalledDeals.length > 0 },
    { label: 'High Risk',         value: highRiskDeals.length,  sub: 'Require attention',                icon: <ShieldAlert className="size-4.5" />, alert: highRiskDeals.length > 0 },
  ];

  return (
    <AppShellCard className="page-enter">
      {/* ── HUMAIN brand banner ──────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl mb-7"
        style={{
          background: 'linear-gradient(135deg, var(--brand-950) 0%, var(--brand-900) 45%, var(--brand-700) 100%)',
          height: '7rem',
        }}
      >
        {/* concentric ripple rings */}
        <svg className="absolute inset-0 size-full opacity-20" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="9%"  cy="125%" r="90"  fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="9%"  cy="125%" r="135" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="9%"  cy="125%" r="180" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="9%"  cy="125%" r="225" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="93%" cy="-25%" r="100" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="93%" cy="-25%" r="150" fill="none" stroke="white" strokeWidth="1.5" />
          <circle cx="93%" cy="-25%" r="200" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>

        {/* soft lagoon glow */}
        <div className="absolute -right-12 -bottom-20 size-64 rounded-full blur-3xl" style={{ background: 'color-mix(in srgb, var(--brand-400) 35%, transparent)' }} />

        {/* bokeh dots */}
        <div className="absolute right-[18%] top-[28%] size-1.5 rounded-full blur-[1px]" style={{ background: 'rgba(255,255,255,0.4)' }} />
        <div className="absolute right-[32%] top-[62%] size-1 rounded-full blur-[1px]" style={{ background: 'rgba(255,255,255,0.3)' }} />
        <div className="absolute right-[8%] top-[55%] size-2 rounded-full blur-[2px]" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <div className="absolute left-[38%] top-[20%] size-1 rounded-full blur-[1px]" style={{ background: 'rgba(255,255,255,0.2)' }} />
      </div>

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-9">
        <div>
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Clock className="size-3" />
            Synced 2 min ago
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{greeting}, Abdullah</h1>
          <div className="mt-2.5 h-0.5 w-12 rounded-full bg-brand-500" />
          <p className="text-sm text-muted-foreground mt-3 max-w-lg">
            {priorityItems.length > 0
              ? `You have ${priorityItems.length} item${priorityItems.length > 1 ? 's' : ''} needing attention today.`
              : 'Pipeline is looking healthy — keep the momentum going.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12">

        {/* ── KPI STRIP (Expected-Outcomes style pills) ────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-4"
            >
              <IconChip size="lg">{kpi.icon}</IconChip>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold tracking-tight text-foreground count-in">{kpi.value}</p>
                  {kpi.alert && <span className="size-1.5 rounded-full bg-destructive pulse-dot" />}
                </div>
                <p className="text-xs font-semibold text-foreground">{kpi.label}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── TODAY'S PRIORITIES (numbered step cards) ─────────────────── */}
        {priorityItems.length > 0 && (
          <section>
            <SectionTitle badge={<Badge color="primary">{priorityItems.length}</Badge>}>
              Today&apos;s Priorities
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {priorityItems.map((item, i) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={[
                    'group flex flex-col gap-3 rounded-2xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5',
                    item.urgent
                      ? 'border-brand-500/60 bg-brand-500/[0.06]'
                      : 'border-border bg-card hover:border-brand-500/40',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <StepCircle n={i + 1} filled={item.urgent} />
                    {item.urgent && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive">
                        <AlertTriangle className="size-3" /> Urgent
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{item.sub}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Open account
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CHARTS ───────────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Pipeline Overview</SectionTitle>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-foreground">Pipeline by Stage</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Active deal value in SAR M</p>
                </div>
                <Badge color="secondary">ACV</Badge>
              </div>
              <BarChart
                data={pipelineByStage}
                series={[{ id: 'acv', label: 'ACV (SAR M)', color: 'var(--color-brand-500)' }]}
                showYAxis showXAxis showTooltip
                yAxisFormat={(v) => `SAR ${v}M`}
                size="sm"
                aria-label="Pipeline ACV by stage"
              />
            </div>
            <div className="rounded-2xl border border-border bg-card px-5 py-5 flex flex-col gap-4">
              <div>
                <p className="text-sm font-bold text-foreground">Risk Distribution</p>
                <p className="text-xs text-muted-foreground mt-0.5">Active deals only</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <DonutChart
                  data={[
                    { value: riskCounts.high,   maxValue: activeDeals.length, color: 'var(--color-destructive)' },
                    { value: riskCounts.medium, maxValue: activeDeals.length, color: 'var(--color-warning)' },
                    { value: riskCounts.low,    maxValue: activeDeals.length, color: 'var(--color-brand-500)' },
                  ]}
                  series={[
                    { id: 'high',   label: 'High Risk', color: 'var(--color-destructive)' },
                    { id: 'medium', label: 'Medium',    color: 'var(--color-warning)' },
                    { id: 'low',    label: 'On Track',  color: 'var(--color-brand-500)' },
                  ]}
                  centerValue={activeDeals.length}
                  centerLabel="Deals"
                  legendPosition="bottom"
                  showTooltip
                  size="sm"
                  aria-label="Deal risk distribution"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                {[
                  { label: 'High',     val: riskCounts.high,   color: 'text-destructive' },
                  { label: 'Medium',   val: riskCounts.medium, color: 'text-warning' },
                  { label: 'On Track', val: riskCounts.low,    color: 'text-brand-600 dark:text-brand-400' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="text-center">
                    <p className={`text-lg font-bold ${color}`}>{val}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ACCOUNT SIGNALS ──────────────────────────────────────────── */}
        <section>
          <SectionTitle badge={<Badge color="secondary">{MOCK_SIGNALS.length} new</Badge>}>
            Account Signals
          </SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MOCK_SIGNALS.map((signal) => {
              const s = SIGNAL_ICON[signal.type];
              return (
                <div
                  key={signal.id}
                  className="group flex items-start gap-3.5 rounded-2xl border border-border bg-card p-4 transition-all hover:border-brand-500/40 hover:shadow-md"
                >
                  <IconChip>{s.icon}</IconChip>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">{s.label}</span>
                      <span className="text-xs font-semibold text-foreground">{signal.accountName}</span>
                      <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{signal.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{signal.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{signal.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SUGGESTED ACTIONS ────────────────────────────────────────── */}
        {activeTasks.length > 0 && (
          <section>
            <SectionTitle badge={<Badge color="primary">{activeTasks.length}</Badge>}>
              AI-Suggested Actions
            </SectionTitle>
            <div className="flex flex-col gap-2.5">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start gap-3.5 rounded-2xl border border-border bg-card px-4 py-4 transition-all hover:border-brand-500/40 hover:shadow-sm"
                >
                  <IconChip><Sparkles className="size-4" /></IconChip>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
                      <span className="text-xs font-semibold text-muted-foreground">{task.accountName}</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{task.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{task.reason}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      aria-label="Dismiss"
                      onClick={() => {
                        setDismissedTasks((s) => new Set([...s, task.id]));
                        toast.success('Task dismissed');
                      }}
                      className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                    <Button appearance="outline" size="sm" startIcon={<Check className="size-3.5" />}
                      onClick={() => toast.success('Marked done', { description: task.action })}>
                      Done
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── ALL DEALS ────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between">
            <SectionTitle badge={<Badge color="secondary">{activeDeals.length}</Badge>}>
              All Open Deals
            </SectionTitle>
            <span className="text-xs text-muted-foreground hidden sm:block mb-5">Click a row to open the account</span>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Account / Deal', 'Stage', 'Value', 'Probability', 'Status', 'Health', ''].map((h) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground ${h === 'Value' || h === 'Probability' ? 'text-right hidden sm:table-cell' : h === '' ? '' : 'text-left'} ${h === 'Health' ? 'hidden md:table-cell' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {activeDeals.map((deal) => {
                  const delta  = DEAL_DELTA[deal.id];
                  const acct   = MOCK_ACCOUNTS.find((a) => a.id === deal.accountId);
                  const staks  = MOCK_STAKEHOLDERS.filter((s) => s.accountId === deal.accountId);
                  const sigs   = MOCK_SIGNALS.filter((s) => s.accountId === deal.accountId);
                  const health = acct ? computeAccountHealth(acct, [deal], staks, sigs) : null;
                  const hs     = health ? HEALTH_STYLE[health.status] : null;
                  const isStalled = deal.daysSinceActivity > 14;

                  return (
                    <tr key={deal.id} className="group transition-colors hover:bg-brand-500/[0.04] cursor-pointer">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <AccountAvatar accountId={deal.accountId} name={deal.customer} size="sm" />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate leading-tight">{deal.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{deal.customer} · {deal.subSector}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium text-muted-foreground">{deal.stage}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-foreground hidden sm:table-cell">
                        {fmtAcv(deal.acv)}
                      </td>
                      <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${deal.probability}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {isStalled ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                            <AlertTriangle className="size-3" /> {deal.daysSinceActivity}d idle
                          </span>
                        ) : delta ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${delta.color}`}>
                            {delta.icon}{delta.label}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {hs && (
                          <Tooltip.Root>
                            <Tooltip.Trigger>
                              <Badge color={hs.color}>{hs.label}</Badge>
                            </Tooltip.Trigger>
                            <Tooltip.Popup>
                              <div className="text-xs space-y-1">
                                {health!.reasons.map((r) => <p key={r}>{r}</p>)}
                              </div>
                            </Tooltip.Popup>
                          </Tooltip.Root>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/accounts/${deal.accountId}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                        >
                          View
                          <ChevronRight className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppShellCard>
  );
}
