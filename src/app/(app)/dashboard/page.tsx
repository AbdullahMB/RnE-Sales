'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  MetricCard,
  Avatar,
} from '@humain-foundation/ui';
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
  Check,
  X,
  Newspaper,
  UserMinus,
  DollarSign,
} from 'lucide-react';
import {
  MOCK_DEALS,
  MOCK_SIGNALS,
  MOCK_TASKS,
  type RiskLevel,
  type Signal,
  type SuggestedTask,
} from '@/lib/mock-data';

type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

const RISK_BADGE: Record<RiskLevel, { color: BadgeColor; label: string }> = {
  high: { color: 'destructive', label: 'High Risk' },
  medium: { color: 'warning', label: 'Medium Risk' },
  low: { color: 'success', label: 'On Track' },
};

const SIGNAL_ICON: Record<Signal['type'], React.ReactNode> = {
  leadership: <UserMinus className="size-4" />,
  funding: <DollarSign className="size-4" />,
  news: <Newspaper className="size-4" />,
  product: <Zap className="size-4" />,
};

const PRIORITY_BADGE: Record<SuggestedTask['priority'], BadgeColor> = {
  high: 'destructive',
  medium: 'warning',
  low: 'secondary',
};

export default function DashboardPage() {
  const [dismissedTasks, setDismissedTasks] = useState<Set<string>>(new Set());
  const stalledDeals = MOCK_DEALS.filter((d) => d.daysSinceActivity > 14);
  const highRiskDeals = MOCK_DEALS.filter((d) => d.risk === 'high');
  const activeTasks = MOCK_TASKS.filter((t) => !dismissedTasks.has(t.id));

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <AppShellCard.Title>Dashboard</AppShellCard.Title>
        <AppShellCard.Subtitle>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </AppShellCard.Subtitle>
      </AppShellCard.Header>

      <div className="flex flex-col gap-8">
        {/* Pipeline metrics */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Pipeline Health
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              title="Active Deals"
              value={MOCK_DEALS.length}
              changeSentiment="neutral"
              description="in your book"
            />
            <MetricCard
              title="Pipeline ACV"
              value={MOCK_DEALS.reduce((s, d) => s + d.acv, 0)}
              change={12}
              changeSentiment="positive"
              description="vs last quarter"
              valueFormatter={(n) => `$${(n / 1_000_000).toFixed(1)}M`}
            />
            <MetricCard
              title="Stalled Deals"
              value={stalledDeals.length}
              changeSentiment={stalledDeals.length > 1 ? 'negative' : 'neutral'}
              description=">14 days no activity"
            />
            <MetricCard
              title="High Risk"
              value={highRiskDeals.length}
              changeSentiment={highRiskDeals.length > 0 ? 'negative' : 'positive'}
              description="need attention today"
            />
          </div>
        </section>

        {/* Stalled deals */}
        {stalledDeals.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">Deals Needing Attention</h2>
              <Badge color="warning">{stalledDeals.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {stalledDeals.map((deal) => {
                const risk = RISK_BADGE[deal.risk];
                return (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar fallback={deal.accountName} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{deal.accountName}</p>
                        <p className="text-xs text-muted-foreground">
                          {deal.stage} · ${(deal.acv / 1000).toFixed(0)}K ACV · {deal.daysSinceActivity} days idle
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge color={risk.color}>{risk.label}</Badge>
                      <Button
                        appearance="ghost"
                        size="sm"
                        render={<Link href={`/accounts/${deal.accountId}`} />}
                        endIcon={<ChevronRight className="size-4" />}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Account signals */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-foreground">Account Signals</h2>
            <Badge color="secondary">{MOCK_SIGNALS.length} new</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {MOCK_SIGNALS.map((signal) => (
              <div
                key={signal.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <span className="mt-0.5 text-muted-foreground shrink-0">
                  {SIGNAL_ICON[signal.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-brand-500">{signal.accountName}</span>
                    <span className="text-xs text-muted-foreground">{signal.date}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{signal.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{signal.summary}</p>
                </div>
                <Button
                  appearance="ghost"
                  size="sm"
                  className="shrink-0"
                  render={<Link href={`/accounts/${signal.accountId}`} />}
                >
                  Account
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* AI-suggested tasks */}
        {activeTasks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-foreground">Suggested Actions</h2>
              <Badge color="secondary">{activeTasks.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge color={PRIORITY_BADGE[task.priority]}>{task.priority}</Badge>
                      <span className="text-xs font-semibold text-muted-foreground">{task.accountName}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{task.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.reason}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      appearance="ghost"
                      size="icon"
                      aria-label="Dismiss"
                      onClick={() => setDismissedTasks((s) => new Set([...s, task.id]))}
                    >
                      <X className="size-4" />
                    </Button>
                    <Button appearance="outline" size="sm" startIcon={<Check className="size-4" />}>
                      Do it
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All deals table */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">All Open Deals</h2>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Account</th>
                  <th className="text-left px-4 py-2 font-medium">Stage</th>
                  <th className="text-right px-4 py-2 font-medium">ACV</th>
                  <th className="text-left px-4 py-2 font-medium">Close</th>
                  <th className="text-left px-4 py-2 font-medium">Risk</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {MOCK_DEALS.map((deal) => {
                  const risk = RISK_BADGE[deal.risk];
                  return (
                    <tr key={deal.id} className="hover:bg-accent transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar fallback={deal.accountName} size="xs" />
                          <span className="font-medium text-foreground">{deal.accountName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{deal.stage}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        ${(deal.acv / 1000).toFixed(0)}K
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{deal.closeDate}</td>
                      <td className="px-4 py-3">
                        <Badge color={risk.color}>{risk.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          appearance="ghost"
                          size="sm"
                          render={<Link href={`/accounts/${deal.accountId}`} />}
                        >
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
