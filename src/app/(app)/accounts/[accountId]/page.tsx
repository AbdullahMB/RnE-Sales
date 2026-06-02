'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Avatar,
  Tabs,
} from '@humain-foundation/ui';
import {
  Building2,
  Users,
  TrendingUp,
  FileText,
  ChevronRight,
  UserMinus,
  DollarSign,
  Newspaper,
  Zap,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  History,
  Mail,
  Video,
  GitCommitHorizontal,
  ListChecks,
} from 'lucide-react';
import { ExecutiveProfiles } from '@/components/executive-profiles';
import { AccountHero } from '@/components/account-hero';
import { toast } from '@humain-foundation/ui';
import {
  MOCK_ACCOUNTS,
  MOCK_DEALS,
  MOCK_STAKEHOLDERS,
  MOCK_SIGNALS,
  MOCK_WIKI_ASSETS,
  MOCK_MEETING_SUMMARY,
  MOCK_ACTIVITIES,
  type Signal,
  type StakeholderRole,
  type ActivityType,
} from '@/lib/mock-data';
import { computeAccountHealth, HEALTH_STYLE } from '@/lib/health';

type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

const SIGNAL_ICON: Record<Signal['type'], React.ReactNode> = {
  leadership: <UserMinus className="size-4" />,
  funding: <DollarSign className="size-4" />,
  news: <Newspaper className="size-4" />,
  product: <Zap className="size-4" />,
};

const ROLE_COLOR: Record<StakeholderRole, BadgeColor> = {
  'Decision Maker': 'primary',
  Champion: 'success',
  Influencer: 'secondary',
  Blocker: 'destructive',
  Coach: 'secondary',
};

const ACTIVITY_ICON: Record<ActivityType, React.ReactNode> = {
  meeting:      <Video className="size-3.5" />,
  email:        <Mail className="size-3.5" />,
  signal:       <Zap className="size-3.5" />,
  stage_change: <GitCommitHorizontal className="size-3.5" />,
  action_item:  <ListChecks className="size-3.5" />,
};

const ACTIVITY_COLOR: Record<ActivityType, string> = {
  meeting:      'bg-brand-500 text-white',
  email:        'bg-secondary text-secondary-foreground',
  signal:       'bg-warning text-warning-foreground',
  stage_change: 'bg-success text-success-foreground',
  action_item:  'bg-destructive text-destructive-foreground',
};

const STRENGTH_LABELS: Record<number, string> = {
  0: 'No contact',
  1: 'Initial',
  2: 'Developing',
  3: 'Established',
  4: 'Strong',
  5: 'Trusted',
};

const MEDDIC_FIELDS: { key: keyof typeof MOCK_MEETING_SUMMARY.meddic; label: string }[] = [
  { key: 'metrics',         label: 'Metrics' },
  { key: 'economicBuyer',   label: 'Economic Buyer' },
  { key: 'decisionCriteria', label: 'Decision Criteria' },
  { key: 'decisionProcess', label: 'Decision Process' },
  { key: 'identifiedPain',  label: 'Identified Pain' },
  { key: 'champion',        label: 'Champion' },
];

function MeddicGapBar({ meddic }: { meddic: typeof MOCK_MEETING_SUMMARY.meddic }) {
  const filled = MEDDIC_FIELDS.filter((f) => !!meddic[f.key]).length;
  const pct = Math.round((filled / MEDDIC_FIELDS.length) * 100);
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">MEDDIC Qualification</h4>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-destructive'}`}>
          {pct}% complete
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : pct >= 60 ? 'bg-warning' : 'bg-destructive'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {MEDDIC_FIELDS.map((f) => {
          const ok = !!meddic[f.key];
          return (
            <div key={f.key} className={`flex items-start gap-2 rounded-lg px-3 py-2 ${ok ? 'bg-success/5 border border-success/20' : 'bg-destructive/5 border border-destructive/20'}`}>
              {ok
                ? <CheckCircle2 className="size-3.5 text-success shrink-0 mt-0.5" />
                : <AlertCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
              }
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{f.label}</p>
                {ok && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{meddic[f.key]}</p>}
                {!ok && <p className="text-xs text-destructive mt-0.5">Not captured</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StrengthPips({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((pip) => (
        <span
          key={pip}
          className={`inline-block h-2 w-2 rounded-full ${pip <= value ? 'bg-brand-500' : 'bg-muted'}`}
        />
      ))}
    </div>
  );
}

export default function AccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId) ?? MOCK_ACCOUNTS[0];
  const deals = MOCK_DEALS.filter((d) => d.accountId === account.id);
  const stakeholders = MOCK_STAKEHOLDERS.filter((s) => s.accountId === account.id);
  const signals = MOCK_SIGNALS.filter((s) => s.accountId === account.id);

  const suggestedAssets = MOCK_WIKI_ASSETS.filter((w) =>
    w.industry.some((i) => account.industry.includes(i)) || w.tags.includes(account.region.toLowerCase())
  ).slice(0, 3);

  const hasEconomicBuyer = stakeholders.some(
    (s) => s.role === 'Decision Maker' && s.strength >= 2
  );
  const hasChampion = stakeholders.some((s) => s.role === 'Champion' && s.strength >= 3);

  const health = computeAccountHealth(account, deals, stakeholders, signals);
  const hs = HEALTH_STYLE[health.status];

  // Latest meeting summary for this account (MEDDIC data)
  const meetingSummary = MOCK_MEETING_SUMMARY.accountId === account.id ? MOCK_MEETING_SUMMARY : null;

  // Activity timeline for this account, newest first
  const activities = MOCK_ACTIVITIES
    .filter((a) => a.accountId === account.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="flex flex-col gap-4">
      {/* Hero card — no padding so the banner bleeds edge-to-edge */}
      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-visible">
        <AccountHero account={account} health={health} />
      </div>

      <AppShellCard>
      <div className="flex flex-col gap-8">
        {/* Coverage gap warnings */}
        {(!hasEconomicBuyer || !hasChampion) && (
          <div className="flex flex-col gap-2">
            {!hasEconomicBuyer && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                <Badge color="destructive">Coverage Gap</Badge>
                <p className="text-sm text-foreground">
                  No engaged Economic Buyer — required before Stage 4 transition.
                </p>
              </div>
            )}
            {!hasChampion && (
              <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
                <Badge color="warning">Coverage Gap</Badge>
                <p className="text-sm text-foreground">
                  No strong Champion identified — internal advocacy is at risk.
                </p>
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Trigger value="overview">
              <Building2 className="size-4" />
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger value="stakeholders">
              <Users className="size-4" />
              Stakeholders
            </Tabs.Trigger>
            <Tabs.Trigger value="signals">
              <TrendingUp className="size-4" />
              Signals {signals.length > 0 && `(${signals.length})`}
            </Tabs.Trigger>
            <Tabs.Trigger value="executives">
              <Briefcase className="size-4" />
              Executives
            </Tabs.Trigger>
            <Tabs.Trigger value="content">
              <FileText className="size-4" />
              Relevant Content
            </Tabs.Trigger>
            <Tabs.Trigger value="timeline">
              <History className="size-4" />
              Timeline
            </Tabs.Trigger>
          </Tabs.List>

          {/* Overview tab */}
          <Tabs.Content value="overview" className="mt-4">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Open Opportunities</h3>
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open opportunities. Data sourced from Salesforce.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{deal.stage}</p>
                        <p className="text-xs text-muted-foreground">
                          Close: {deal.closeDate} · Owner: {deal.owner}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          ${(deal.acv / 1000).toFixed(0)}K ACV
                        </span>
                        <Badge
                          color={
                            deal.risk === 'high'
                              ? 'destructive'
                              : deal.risk === 'medium'
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {deal.risk}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Opportunity data is read-only. To update stage or amount,{' '}
                <button
                  className="text-brand-500 hover:underline"
                  onClick={() => toast.info('Opening Salesforce…', { description: 'CRM integration coming soon.' })}
                >
                  open in Salesforce
                </button>.
              </p>

              {/* MEDDICC gap bar */}
              {meetingSummary && (
                <MeddicGapBar meddic={meetingSummary.meddic} />
              )}
            </div>
          </Tabs.Content>

          {/* Stakeholders tab */}
          <Tabs.Content value="stakeholders" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Stakeholders ({stakeholders.length})
              </h3>
              <Button
                appearance="outline"
                size="sm"
                render={<Link href={`/accounts/${account.id}/map`} />}
                endIcon={<ChevronRight className="size-4" />}
              >
                Full Map
              </Button>
            </div>
            {stakeholders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stakeholders mapped yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {stakeholders.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <Avatar fallback={s.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <Badge color={ROLE_COLOR[s.role]}>{s.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StrengthPips value={s.strength} />
                      <p className="text-xs text-muted-foreground mt-1">{STRENGTH_LABELS[s.strength]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>

          {/* Executives tab */}
          <Tabs.Content value="executives" className="mt-4">
            <ExecutiveProfiles accountId={account.id} initialExecs={account.executives ?? []} />
          </Tabs.Content>

          {/* Signals tab */}
          <Tabs.Content value="signals" className="mt-4">
            {signals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No signals detected for this account.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <span className="mt-0.5 text-muted-foreground shrink-0">
                      {SIGNAL_ICON[signal.type]}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge color="secondary">{signal.type}</Badge>
                        <span className="text-xs text-muted-foreground">{signal.date}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{signal.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{signal.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>

          {/* Content tab */}
          <Tabs.Content value="content" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Suggested Content</h3>
              <Button
                appearance="ghost"
                size="sm"
                render={<Link href="/wiki" />}
                endIcon={<ChevronRight className="size-4" />}
              >
                Browse Wiki
              </Button>
            </div>
            {suggestedAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No content matched for this account.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {suggestedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge color="secondary">{asset.type}</Badge>
                        {asset.expiresAt && new Date(asset.expiresAt) < new Date(Date.now() + 30 * 86400_000) && (
                          <Badge color="warning">Expires soon</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{asset.title}</p>
                    </div>
                    <Button
                      appearance="outline"
                      size="sm"
                      onClick={() => toast.success('Content copied to clipboard', { description: asset.title })}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>
          {/* Timeline tab */}
          <Tabs.Content value="timeline" className="mt-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded for this account.</p>
            ) : (
              <div className="border-l-2 border-border ml-4 flex flex-col gap-6">
                {activities.map((event) => (
                  <div key={event.id} className="flex gap-4 relative">
                    {/* Icon dot */}
                    <div className={`-ml-[1.15rem] shrink-0 flex h-6 w-6 items-center justify-center rounded-full ${ACTIVITY_COLOR[event.type]}`}>
                      {ACTIVITY_ICON[event.type]}
                    </div>
                    {/* Card */}
                    <div className="flex-1 rounded-xl border border-border bg-card px-4 py-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">{event.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{event.date}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{event.body}</p>
                      {event.author && (
                        <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {event.author}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tabs.Content>
        </Tabs>
      </div>
      </AppShellCard>
    </div>
  );
}
