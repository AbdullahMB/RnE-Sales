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
  Target, BarChart2, ShieldAlert, Sparkles, LayoutDashboard,
  Clock, Activity, ListChecks, Radar,
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
  d3: { icon: <TrendingUp className="size-3" />,    label: 'New signal', color: 'text-brand-500' },
  d4: { icon: <TrendingDown className="size-3" />,  label: 'Slipped',    color: 'text-destructive' },
  d5: { icon: <Minus className="size-3" />,         label: 'No change',  color: 'text-muted-foreground' },
};

// ─── Building blocks (aligned with AI Agents / Collateral pages) ──────────────

/** Section heading — brand-tinted square icon chip + title + subtitle, no flourishes. */
function SectionHeader({
  icon, title, subtitle, badge,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Numbered marker mirroring the AI Agents step indicator. */
function StepCircle({ n, filled = false }: { n: number; filled?: boolean }) {
  return (
    <span
      className={[
        'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        filled
          ? 'bg-brand-500 text-white'
          : 'border-2 border-brand-500 bg-brand-500/10 text-brand-500',
      ].join(' ')}
    >
      {n}
    </span>
  );
}

/** Brand-tinted square icon chip (matches the reference pages). */
function IconChip({ children, size = 'md' }: { children: React.ReactNode; size?: 'md' | 'lg' }) {
  return (
    <div
      className={[
        'flex shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500',
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
    { label: 'Active Pipeline',   value: fmtAcv(totalPipeline), sub: `${activeDeals.length} open deals`, icon: <BarChart2 className="size-5" /> },
    { label: 'Weighted Forecast', value: fmtAcv(weightedFcast), sub: 'Probability-adjusted',             icon: <Target className="size-5" /> },
    { label: 'Stalled Deals',     value: stalledDeals.length,   sub: 'More than 14 days idle',           icon: <Clock className="size-5" />,       alert: stalledDeals.length > 0 },
    { label: 'High Risk',         value: highRiskDeals.length,  sub: 'Require attention',                icon: <ShieldAlert className="size-5" />, alert: highRiskDeals.length > 0 },
  ];

  return (
    <AppShellCard className="page-enter">
      {/* ── HEADER (shared AppShellCard pattern) ─────────────────────────── */}
      <AppShellCard.Header>
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="size-5 text-brand-500" />
            <AppShellCard.Title>{greeting}, Abdullah</AppShellCard.Title>
          </div>
          <AppShellCard.Subtitle>
            {priorityItems.length > 0
              ? `You have ${priorityItems.length} item${priorityItems.length > 1 ? 's' : ''} needing attention today.`
              : 'Pipeline is looking healthy — keep the momentum going.'}
          </AppShellCard.Subtitle>
        </div>
        <AppShellCard.Actions>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> Synced 2 min ago
          </span>
        </AppShellCard.Actions>
      </AppShellCard.Header>

      <div className="flex flex-col gap-10">

        {/* ── KPI STRIP ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center gap-3.5 rounded-xl border border-border bg-card px-4 py-4"
            >
              <IconChip size="lg">{kpi.icon}</IconChip>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="count-in text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
                  {kpi.alert && <span className="pulse-dot size-1.5 rounded-full bg-destructive" />}
                </div>
                <p className="text-xs font-semibold text-foreground">{kpi.label}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── TODAY'S PRIORITIES ────────────────────────────────────────── */}
        {priorityItems.length > 0 && (
          <section>
            <SectionHeader
              icon={<ListChecks className="size-4" />}
              title="Today's Priorities"
              subtitle="Highest-impact items to action first"
              badge={<Badge color="primary">{priorityItems.length}</Badge>}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {priorityItems.map((item, i) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={[
                    'group flex flex-col gap-3 rounded-xl border p-4 transition-all duration-150',
                    item.urgent
                      ? 'border-brand-500/60 bg-brand-500/5 ring-1 ring-brand-500/20 hover:bg-brand-500/[0.08]'
                      : 'border-border bg-card hover:border-brand-500/40 hover:bg-accent',
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
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{item.label}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-brand-500">
                    Open account
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── PIPELINE OVERVIEW ─────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<BarChart2 className="size-4" />}
            title="Pipeline Overview"
            subtitle="Active deal value and risk posture"
          />
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card px-5 pb-3 pt-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">Pipeline by Stage</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Active deal value in SAR M</p>
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
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-5">
              <div>
                <p className="text-sm font-bold text-foreground">Risk Distribution</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Active deals only</p>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center">
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
              <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
                {[
                  { label: 'High',     val: riskCounts.high,   color: 'text-destructive' },
                  { label: 'Medium',   val: riskCounts.medium, color: 'text-warning' },
                  { label: 'On Track', val: riskCounts.low,    color: 'text-brand-500' },
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

        {/* ── ACCOUNT SIGNALS ───────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Radar className="size-4" />}
            title="Account Signals"
            subtitle="Buying signals detected across your accounts"
            badge={<Badge color="secondary">{MOCK_SIGNALS.length} new</Badge>}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MOCK_SIGNALS.map((signal) => {
              const s = SIGNAL_ICON[signal.type];
              return (
                <div
                  key={signal.id}
                  className="group flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-brand-500/40 hover:bg-accent"
                >
                  <IconChip>{s.icon}</IconChip>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-brand-500">{s.label}</span>
                      <span className="text-xs font-semibold text-foreground">{signal.accountName}</span>
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{signal.date}</span>
                    </div>
                    <p className="text-sm font-semibold leading-snug text-foreground">{signal.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{signal.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SUGGESTED ACTIONS ─────────────────────────────────────────── */}
        {activeTasks.length > 0 && (
          <section>
            <SectionHeader
              icon={<Sparkles className="size-4" />}
              title="AI-Suggested Actions"
              subtitle="Recommended next steps generated from account intelligence"
              badge={<Badge color="primary">{activeTasks.length}</Badge>}
            />
            <div className="flex flex-col gap-2.5">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start gap-3.5 rounded-xl border border-border bg-card px-4 py-4 transition-all duration-150 hover:border-brand-500/40 hover:bg-accent"
                >
                  <IconChip><Sparkles className="size-4" /></IconChip>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
                      <span className="text-xs font-semibold text-muted-foreground">{task.accountName}</span>
                    </div>
                    <p className="text-sm font-semibold leading-snug text-foreground">{task.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{task.reason}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      aria-label="Dismiss"
                      onClick={() => {
                        setDismissedTasks((s) => new Set([...s, task.id]));
                        toast.success('Task dismissed');
                      }}
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

        {/* ── ALL OPEN DEALS ────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Activity className="size-4" />}
            title="All Open Deals"
            subtitle="Click a row to open the account"
            badge={<Badge color="secondary">{activeDeals.length}</Badge>}
          />

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {['Account / Deal', 'Stage', 'Value', 'Probability', 'Status', 'Health', ''].map((h) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-muted-foreground ${h === 'Value' || h === 'Probability' ? 'hidden text-right sm:table-cell' : h === '' ? '' : 'text-left'} ${h === 'Health' ? 'hidden md:table-cell' : ''}`}>
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
                    <tr key={deal.id} className="group cursor-pointer transition-colors hover:bg-brand-500/[0.04]">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <AccountAvatar accountId={deal.accountId} name={deal.customer} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold leading-tight text-foreground">{deal.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{deal.customer} · {deal.subSector}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-medium text-muted-foreground">{deal.stage}</span>
                      </td>
                      <td className="hidden px-4 py-3.5 text-right font-bold text-foreground sm:table-cell">
                        {fmtAcv(deal.acv)}
                      </td>
                      <td className="hidden px-4 py-3.5 text-right sm:table-cell">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${deal.probability}%` }} />
                          </div>
                          <span className="w-8 text-right text-xs text-muted-foreground">{deal.probability}%</span>
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
                      <td className="hidden px-4 py-3.5 md:table-cell">
                        {hs && (
                          <Tooltip.Root>
                            <Tooltip.Trigger>
                              <Badge color={hs.color}>{hs.label}</Badge>
                            </Tooltip.Trigger>
                            <Tooltip.Popup>
                              <div className="space-y-1 text-xs">
                                {health!.reasons.map((r) => <p key={r}>{r}</p>)}
                              </div>
                            </Tooltip.Popup>
                          </Tooltip.Root>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/accounts/${deal.accountId}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-500 opacity-0 transition-opacity hover:bg-brand-500/10 group-hover:opacity-100"
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
