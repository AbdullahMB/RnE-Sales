'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@humain-foundation/ui';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Avatar,
  Tooltip,
  BarChart,
  DonutChart,
} from '@humain-foundation/ui';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  ChevronRight,
  Check,
  X,
  Newspaper,
  UserMinus,
  DollarSign,
  ArrowRight,
  Minus,
  CircleDot,
} from 'lucide-react';
import {
  MOCK_DEALS,
  MOCK_SIGNALS,
  MOCK_TASKS,
  MOCK_STAKEHOLDERS,
  MOCK_ACCOUNTS,
  type RiskLevel,
  type Signal,
  type SuggestedTask,
} from '@/lib/mock-data';
import {
  computeAccountHealth,
  HEALTH_STYLE,
} from '@/lib/health';

type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

const RISK_BADGE: Record<RiskLevel, { color: BadgeColor; label: string }> = {
  high:   { color: 'destructive', label: 'High Risk' },
  medium: { color: 'warning',     label: 'Medium Risk' },
  low:    { color: 'success',     label: 'On Track' },
};

const SIGNAL_ICON: Record<Signal['type'], React.ReactNode> = {
  leadership: <UserMinus className="size-4" />,
  funding:    <DollarSign className="size-4" />,
  news:       <Newspaper className="size-4" />,
  product:    <Zap className="size-4" />,
};

const PRIORITY_COLOR: Record<SuggestedTask['priority'], BadgeColor> = {
  high:   'destructive',
  medium: 'warning',
  low:    'secondary',
};

// Simulated deal deltas (in real app, derived from CRM history)
const DEAL_DELTA: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  d1: { icon: <TrendingUp className="size-3" />,  label: 'Advanced',  color: 'text-success' },
  d2: { icon: <AlertTriangle className="size-3" />, label: 'Stalled', color: 'text-destructive' },
  d3: { icon: <TrendingUp className="size-3" />,  label: 'New signal', color: 'text-brand-500' },
  d4: { icon: <TrendingDown className="size-3" />, label: 'Slipped',  color: 'text-destructive' },
  d5: { icon: <Minus className="size-3" />,        label: 'No change', color: 'text-muted-foreground' },
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color ?? 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [dismissedArr, setDismissedArr] = useLocalStorage<string[]>('dismissed-tasks', []);
  const dismissedTasks = new Set(dismissedArr);
  const setDismissedTasks = (fn: (prev: Set<string>) => Set<string>) =>
    setDismissedArr((arr) => [...fn(new Set(arr))]);

  // Pipeline by stage for BarChart (active deals only)
  const stageOrder = ['Qualification', 'Develop Proposal', 'Submit Proposal', 'Negotiate', 'Won'] as const;
  const pipelineByStage = stageOrder.map((s) => ({
    id: s,
    label: s === 'Develop Proposal' ? 'Develop' : s === 'Submit Proposal' ? 'Submit' : s,
    values: {
      acv: MOCK_DEALS.filter((d) => d.stage === s).reduce((sum, d) => sum + d.acv, 0) / 1_000_000,
    },
  })).filter((d) => d.values.acv > 0);

  // Risk split for DonutChart
  const riskCounts = {
    high:   MOCK_DEALS.filter((d) => d.risk === 'high').length,
    medium: MOCK_DEALS.filter((d) => d.risk === 'medium').length,
    low:    MOCK_DEALS.filter((d) => d.risk === 'low').length,
  };

  const stalledDeals  = MOCK_DEALS.filter((d) => d.daysSinceActivity > 14);
  const highRiskDeals = MOCK_DEALS.filter((d) => d.risk === 'high');
  const activeTasks   = MOCK_TASKS.filter((t) => !dismissedTasks.has(t.id));
  const highPriorityTasks = activeTasks.filter((t) => t.priority === 'high');
  const totalAcv = MOCK_DEALS.reduce((s, d) => s + d.acv, 0);

  // Top 3 priority items: high-risk stalled deals first, then high-priority tasks
  const priorityItems: Array<{ type: 'deal' | 'task'; id: string; label: string; sub: string; href: string }> = [
    ...stalledDeals.filter((d) => d.risk === 'high').map((d) => ({
      type: 'deal' as const,
      id: d.id,
      label: `${d.accountName} — ${d.daysSinceActivity} days idle at ${d.stage}`,
      sub: 'Stalled deal · Action required today',
      href: `/accounts/${d.accountId}`,
    })),
    ...highPriorityTasks.map((t) => ({
      type: 'task' as const,
      id: t.id,
      label: t.action,
      sub: t.accountName,
      href: `/accounts/${MOCK_DEALS.find((d) => d.id === t.dealId)?.accountId ?? ''}`,
    })),
  ].slice(0, 3);

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <AppShellCard.Title>Good morning, Turki</AppShellCard.Title>
          <AppShellCard.Subtitle>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {' · '}
            <span className="text-muted-foreground">Synced 2 min ago</span>
          </AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>

      <div className="flex flex-col gap-10">

        {/* ── TODAY'S PRIORITIES ─────────────────────────────────────── */}
        {priorityItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CircleDot className="size-4 text-brand-500" />
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
                Today's Priorities
              </h2>
              <Badge color="destructive">{priorityItems.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {priorityItems.map((item, i) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:bg-accent hover:border-brand-500/30 transition-all"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-500">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-500 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── PIPELINE METRICS ───────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pipeline Health</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Pipeline ACV" value={`$${(totalAcv / 1_000_000).toFixed(1)}M`} sub="5 open deals" color="text-brand-500" />
            <StatCard label="Active Deals" value={MOCK_DEALS.length} sub="in your book" />
            <StatCard label="Stalled" value={stalledDeals.length} sub=">14 days idle" color={stalledDeals.length > 0 ? 'text-warning' : undefined} />
            <StatCard label="High Risk" value={highRiskDeals.length} sub="need action" color={highRiskDeals.length > 0 ? 'text-destructive' : undefined} />
          </div>
        </section>

        {/* ── PIPELINE CHARTS ────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">ACV by Stage ($K)</p>
            <BarChart
              data={pipelineByStage}
              series={[{ id: 'acv', label: 'ACV ($K)', color: 'var(--color-brand-500)' }]}
              showYAxis
              showXAxis
              showTooltip
              yAxisFormat={(v) => `$${v}K`}
              size="sm"
              aria-label="Pipeline ACV by stage"
            />
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-col items-center justify-center gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide self-start">Risk Split</p>
            <DonutChart
              data={[
                { value: riskCounts.high,   maxValue: MOCK_DEALS.length, color: 'var(--color-destructive)' },
                { value: riskCounts.medium, maxValue: MOCK_DEALS.length, color: 'var(--color-warning)' },
                { value: riskCounts.low,    maxValue: MOCK_DEALS.length, color: 'var(--color-success)' },
              ]}
              series={[
                { id: 'high',   label: 'High Risk',  color: 'var(--color-destructive)' },
                { id: 'medium', label: 'Medium',     color: 'var(--color-warning)' },
                { id: 'low',    label: 'On Track',   color: 'var(--color-success)' },
              ]}
              centerValue={MOCK_DEALS.length}
              centerLabel="Deals"
              legendPosition="bottom"
              showTooltip
              size="sm"
              aria-label="Deal risk distribution"
            />
          </div>
        </section>

        {/* ── ACCOUNT SIGNALS ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-foreground">Account Signals</h2>
              <Badge color="secondary">{MOCK_SIGNALS.length} new</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_SIGNALS.map((signal) => (
              <div key={signal.id} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
                <span className="mt-0.5 text-muted-foreground shrink-0">{SIGNAL_ICON[signal.type]}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-brand-500">{signal.accountName}</span>
                    <span className="text-xs text-muted-foreground">{signal.date}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{signal.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{signal.summary}</p>
                </div>
                <Button appearance="ghost" size="sm" className="shrink-0" render={<Link href={`/accounts/${signal.accountId}`} />}>
                  View
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* ── SUGGESTED ACTIONS ──────────────────────────────────────── */}
        {activeTasks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-foreground">Suggested Actions</h2>
              <Badge color="secondary">{activeTasks.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {activeTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
                      <span className="text-xs font-semibold text-muted-foreground">{task.accountName}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{task.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.reason}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button appearance="ghost" size="icon" aria-label="Dismiss"
                      onClick={() => {
                        setDismissedTasks((s) => new Set([...s, task.id]));
                        toast.success('Task dismissed', { description: task.action });
                      }}>
                      <X className="size-4" />
                    </Button>
                    <Button appearance="outline" size="sm" startIcon={<Check className="size-4" />}
                      onClick={() => toast.success('Marked done', { description: task.action })}>
                      Do it
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── ALL DEALS TABLE ─────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">All Open Deals</h2>
            <span className="text-xs text-muted-foreground">Click a row to open account</span>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Account</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Stage</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground">ACV</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Close</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">This week</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Risk</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Health</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {MOCK_DEALS.map((deal) => {
                  const risk   = RISK_BADGE[deal.risk];
                  const delta  = DEAL_DELTA[deal.id];
                  const acct   = MOCK_ACCOUNTS.find((a) => a.id === deal.accountId);
                  const staks  = MOCK_STAKEHOLDERS.filter((s) => s.accountId === deal.accountId);
                  const sigs   = MOCK_SIGNALS.filter((s) => s.accountId === deal.accountId);
                  const health = acct ? computeAccountHealth(acct, [deal], staks, sigs) : null;
                  const hs     = health ? HEALTH_STYLE[health.status] : null;

                  return (
                    <tr key={deal.id} className="hover:bg-accent transition-colors cursor-pointer group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar fallback={deal.accountName} size="xs" />
                          <span className="font-semibold text-foreground">{deal.accountName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{deal.stage}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        ${(deal.acv / 1000).toFixed(0)}K
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{deal.closeDate}</td>
                      <td className="px-4 py-3">
                        {delta && (
                          <span className={`flex items-center gap-1 text-xs font-medium ${delta.color}`}>
                            {delta.icon}{delta.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={risk.color}>{risk.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3">
                        <Button appearance="ghost" size="sm" render={<Link href={`/accounts/${deal.accountId}`} />}
                          endIcon={<ChevronRight className="size-4" />}>
                          View
                        </Button>
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
