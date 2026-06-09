'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@humain-foundation/ui';
import Link from 'next/link';
import {
  AppShellCard, Badge, Button, Avatar, Tooltip, BarChart, DonutChart,
} from '@humain-foundation/ui';
import {
  AlertTriangle, TrendingUp, TrendingDown, Zap, ChevronRight,
  Check, X, Newspaper, UserMinus, DollarSign, ArrowRight, Minus,
  Target, Activity, BarChart2, ShieldAlert, Sparkles, Calendar,
  CircleDot, Clock, Building2,
} from 'lucide-react';
import { AccountAvatar } from '@/components/account-avatar';
import {
  MOCK_DEALS, MOCK_SIGNALS, MOCK_TASKS, MOCK_STAKEHOLDERS,
  MOCK_ACCOUNTS, type RiskLevel, type Signal, type SuggestedTask,
} from '@/lib/mock-data';
import { computeAccountHealth, HEALTH_STYLE } from '@/lib/health';

// ─── Types & constants ────────────────────────────────────────────────────────

type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

const RISK_BADGE: Record<RiskLevel, { color: BadgeColor; label: string }> = {
  high:   { color: 'destructive', label: 'High Risk' },
  medium: { color: 'warning',     label: 'Medium' },
  low:    { color: 'success',     label: 'On Track' },
};

const SIGNAL_STYLE: Record<Signal['type'], { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  leadership: { bg: 'bg-blue-500/10',    text: 'text-blue-500',   icon: <UserMinus className="size-3.5" />,  label: 'Leadership' },
  funding:    { bg: 'bg-success/10',     text: 'text-success',    icon: <DollarSign className="size-3.5" />, label: 'Funding' },
  news:       { bg: 'bg-amber-500/10',   text: 'text-amber-500',  icon: <Newspaper className="size-3.5" />, label: 'News' },
  product:    { bg: 'bg-brand-500/10',   text: 'text-brand-500',  icon: <Zap className="size-3.5" />,       label: 'Product' },
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

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, accent, icon, trend,
}: {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
  icon: React.ReactNode;
  trend?: { dir: 'up' | 'down' | 'neutral'; text: string };
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card px-5 py-5 overflow-hidden group card-lift">
      {/* Top accent bar */}
      <div className={`absolute top-0 inset-x-0 h-[3px] rounded-t-2xl ${accent}`} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className={`size-8 rounded-xl flex items-center justify-center ${accent.replace('bg-', 'bg-').replace('/100', '/10')} bg-muted/60 text-muted-foreground`}>
          {icon}
        </div>
      </div>

      <p className="text-3xl font-extrabold tracking-tight text-foreground count-in">{value}</p>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">{sub}</p>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
            trend.dir === 'up' ? 'text-success' : trend.dir === 'down' ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {trend.dir === 'up' ? <TrendingUp className="size-3" /> : trend.dir === 'down' ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
            {trend.text}
          </span>
        )}
      </div>
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
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1000).toFixed(0)}K`;

  return (
    <AppShellCard>
      {/* ── GREETING BANNER ───────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 border border-border">
        {/* gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/90 via-brand-700/95 to-brand-900" />
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 size-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-8 size-36 rounded-full bg-white/5" />

        <div className="relative px-6 py-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-white/60 mb-1 flex items-center gap-1.5">
                <Calendar className="size-3" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                <span className="opacity-40">·</span>
                <span className="text-white/50">Synced 2 min ago</span>
              </p>
              <h1 className="text-2xl font-bold tracking-tight">{greeting}, Turki</h1>
              <p className="text-sm text-white/70 mt-1">
                {priorityItems.length > 0
                  ? `You have ${priorityItems.length} item${priorityItems.length > 1 ? 's' : ''} needing attention today`
                  : 'Pipeline is looking healthy — keep the momentum going'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-white/50 mb-0.5">Active pipeline</p>
                <p className="text-xl font-bold text-white">{fmtAcv(totalPipeline)}</p>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-right">
                <p className="text-xs text-white/50 mb-0.5">Weighted</p>
                <p className="text-xl font-bold text-white">{fmtAcv(weightedFcast)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-10">

        {/* ── TODAY'S PRIORITIES ─────────────────────────────────────── */}
        {priorityItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="size-2 rounded-full bg-destructive pulse-dot" />
              <h2 className="text-sm font-bold text-foreground">Today's Priorities</h2>
              <Badge color="destructive">{priorityItems.length}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {priorityItems.map((item, i) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3.5 hover:shadow-md transition-all ${
                    item.urgent
                      ? 'border-destructive/30 bg-destructive/5 hover:bg-destructive/8'
                      : 'border-border bg-card hover:bg-accent hover:border-brand-500/30'
                  }`}
                >
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    item.urgent ? 'bg-destructive/15 text-destructive' : 'bg-brand-500/10 text-brand-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">{item.label}</p>
                    <p className={`text-xs mt-0.5 truncate ${item.urgent ? 'text-destructive/70' : 'text-muted-foreground'}`}>{item.sub}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-500 shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── KPI STATS ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Pipeline Health</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Active Pipeline" icon={<BarChart2 className="size-4" />}
              value={fmtAcv(totalPipeline)} sub={`${activeDeals.length} open deals`}
              accent="bg-brand-500" trend={{ dir: 'up', text: '+12% this quarter' }}
            />
            <StatCard
              label="Weighted Forecast" icon={<Target className="size-4" />}
              value={fmtAcv(weightedFcast)} sub="probability-adjusted"
              accent="bg-indigo-500"
            />
            <StatCard
              label="Stalled Deals" icon={<Clock className="size-4" />}
              value={stalledDeals.length} sub=">14 days idle"
              accent={stalledDeals.length > 0 ? 'bg-warning' : 'bg-success'}
              trend={stalledDeals.length > 0 ? { dir: 'down', text: 'needs action' } : { dir: 'neutral', text: 'all clear' }}
            />
            <StatCard
              label="High Risk" icon={<ShieldAlert className="size-4" />}
              value={highRiskDeals.length} sub="require attention"
              accent={highRiskDeals.length > 0 ? 'bg-destructive' : 'bg-success'}
              trend={highRiskDeals.length > 0 ? { dir: 'down', text: 'act now' } : { dir: 'neutral', text: 'all clear' }}
            />
          </div>
        </section>

        {/* ── CHARTS ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Pipeline by Stage</p>
                <p className="text-xs text-muted-foreground mt-0.5">Active deal value in $M</p>
              </div>
              <Badge color="secondary">ACV</Badge>
            </div>
            <BarChart
              data={pipelineByStage}
              series={[{ id: 'acv', label: 'ACV ($M)', color: 'var(--color-brand-500)' }]}
              showYAxis showXAxis showTooltip
              yAxisFormat={(v) => `$${v}M`}
              size="sm"
              aria-label="Pipeline ACV by stage"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card px-5 py-5 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Risk Distribution</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active deals only</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <DonutChart
                data={[
                  { value: riskCounts.high,   maxValue: activeDeals.length, color: 'var(--color-destructive)' },
                  { value: riskCounts.medium, maxValue: activeDeals.length, color: 'var(--color-warning)' },
                  { value: riskCounts.low,    maxValue: activeDeals.length, color: 'var(--color-success)' },
                ]}
                series={[
                  { id: 'high',   label: 'High Risk', color: 'var(--color-destructive)' },
                  { id: 'medium', label: 'Medium',    color: 'var(--color-warning)' },
                  { id: 'low',    label: 'On Track',  color: 'var(--color-success)' },
                ]}
                centerValue={activeDeals.length}
                centerLabel="Deals"
                legendPosition="bottom"
                showTooltip
                size="sm"
                aria-label="Deal risk distribution"
              />
            </div>
            {/* quick stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
              {[
                { label: 'High', val: riskCounts.high, color: 'text-destructive' },
                { label: 'Medium', val: riskCounts.medium, color: 'text-warning' },
                { label: 'On Track', val: riskCounts.low, color: 'text-success' },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-lg font-bold ${color}`}>{val}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ACCOUNT SIGNALS ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-foreground">Account Signals</h2>
              <Badge color="secondary">{MOCK_SIGNALS.length} new</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MOCK_SIGNALS.map((signal) => {
              const style = SIGNAL_STYLE[signal.type];
              return (
                <div
                  key={signal.id}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-4 hover:shadow-md hover:border-brand-500/20 transition-all card-lift"
                >
                  {/* type icon */}
                  <div className={`mt-0.5 size-8 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                    <span className={style.text}>{style.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>{style.label}</span>
                      <span className="text-xs font-semibold text-foreground">{signal.accountName}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{signal.date}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug">{signal.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{signal.summary}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SUGGESTED ACTIONS ──────────────────────────────────────── */}
        {activeTasks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="size-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-foreground">AI-Suggested Actions</h2>
              <Badge color="primary">{activeTasks.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-start gap-4 rounded-xl border px-4 py-4 transition-all hover:shadow-sm ${
                    task.priority === 'high'
                      ? 'border-destructive/25 bg-destructive/[0.03] hover:bg-destructive/[0.05]'
                      : 'border-border bg-card hover:bg-accent'
                  }`}
                >
                  {/* priority indicator */}
                  <div className={`mt-0.5 size-2 rounded-full shrink-0 mt-2 ${
                    task.priority === 'high' ? 'bg-destructive' : task.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={PRIORITY_COLOR[task.priority]}>{task.priority}</Badge>
                      <span className="text-xs font-semibold text-muted-foreground">{task.accountName}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground leading-snug">{task.action}</p>
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

        {/* ── ALL DEALS ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-foreground">All Open Deals</h2>
              <Badge color="secondary">{activeDeals.length}</Badge>
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block">Click to open account</span>
          </div>

          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {['Account / Deal', 'Stage', 'Value', 'Probability', 'Status', 'Health', ''].map((h) => (
                    <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground ${h === 'Value' || h === 'Probability' ? 'text-right hidden sm:table-cell' : h === '' ? '' : 'text-left'} ${h === 'Health' ? 'hidden md:table-cell' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {activeDeals.map((deal) => {
                  const risk   = RISK_BADGE[deal.risk];
                  const delta  = DEAL_DELTA[deal.id];
                  const acct   = MOCK_ACCOUNTS.find((a) => a.id === deal.accountId);
                  const staks  = MOCK_STAKEHOLDERS.filter((s) => s.accountId === deal.accountId);
                  const sigs   = MOCK_SIGNALS.filter((s) => s.accountId === deal.accountId);
                  const health = acct ? computeAccountHealth(acct, [deal], staks, sigs) : null;
                  const hs     = health ? HEALTH_STYLE[health.status] : null;
                  const isStalled = deal.daysSinceActivity > 14;

                  return (
                    <tr
                      key={deal.id}
                      className={`group transition-colors cursor-pointer ${isStalled ? 'bg-warning/[0.03] hover:bg-warning/[0.06]' : 'hover:bg-accent'}`}
                    >
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
                            <div
                              className="h-full rounded-full bg-brand-500"
                              style={{ width: `${deal.probability}%` }}
                            />
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
                        <Button appearance="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity"
                          render={<Link href={`/accounts/${deal.accountId}`} />}
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
