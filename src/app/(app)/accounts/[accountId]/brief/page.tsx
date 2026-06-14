'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Avatar,
} from '@humain-foundation/ui';
import {
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Users,
  CheckSquare,
  Lightbulb,
  ChevronRight,
  Clock,
  DollarSign,
  Map,
  Printer,
} from 'lucide-react';
import {
  MOCK_ACCOUNTS,
  MOCK_DEALS,
  MOCK_STAKEHOLDERS,
  MOCK_SIGNALS,
  MOCK_TASKS,
  MOCK_MEETING_SUMMARY,
  type StakeholderRole,
} from '@/lib/mock-data';
import { computeAccountHealth, HEALTH_STYLE } from '@/lib/health';
import { AccountAvatar } from '@/components/account-avatar';

type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

const ROLE_COLOR: Record<StakeholderRole, BadgeColor> = {
  'Decision Maker': 'primary',
  Champion: 'success',
  Influencer: 'secondary',
  Blocker: 'destructive',
  Coach: 'secondary',
};

const STRENGTH_LABELS: Record<number, string> = {
  0: 'No contact', 1: 'Initial', 2: 'Developing', 3: 'Established', 4: 'Strong', 5: 'Trusted',
};

function StrengthPips({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((p) => (
        <span key={p} className={`inline-block h-1.5 w-4 rounded-sm ${p <= value ? 'bg-brand-500' : 'bg-muted'}`} />
      ))}
    </div>
  );
}

function generateTalkingPoints(
  account: (typeof MOCK_ACCOUNTS)[0],
  deals: typeof MOCK_DEALS,
  stakeholders: typeof MOCK_STAKEHOLDERS,
  signals: typeof MOCK_SIGNALS,
): string[] {
  const points: string[] = [];
  const deal = deals[0];
  const champion = stakeholders.find((s) => s.role === 'Champion' && s.strength >= 3);
  const noEconomicBuyer = !stakeholders.some((s) => s.role === 'Decision Maker' && s.strength >= 2);

  // Signal-based points
  const leadershipSignal = signals.find((s) => s.type === 'leadership');
  const fundingSignal = signals.find((s) => s.type === 'funding');
  const newsSignal = signals.find((s) => s.type === 'news');

  if (leadershipSignal) points.push(`Leadership change: ${leadershipSignal.title} — acknowledge the transition and ask how priorities may shift.`);
  if (fundingSignal) points.push(`Budget signal: ${fundingSignal.title} — connect your platform to where the investment is going.`);
  if (newsSignal) points.push(`Market move: ${newsSignal.title} — ask how this shapes their 2026 technology roadmap.`);

  // Deal stage points
  if (deal) {
    if (deal.stage === 'Develop Proposal') points.push('You\'re in Develop — focus on quantifying the business case. Push for specific metrics (cost savings, time-to-deployment) that will anchor the CFO conversation.');
    if (deal.stage === 'Submit Proposal' || deal.stage === 'Negotiate') points.push('You\'re at Propose — confirm the commercial terms are still aligned and ask explicitly: "Is there anything stopping us from proceeding?"');
    if (deal.daysSinceActivity > 14) points.push(`Deal has been idle ${deal.daysSinceActivity} days — address momentum directly. Ask what's changed internally and what you can do to re-engage.`);
  }

  // Stakeholder points
  if (champion) points.push(`Your champion is ${champion.name} (${champion.title}). Reference their support internally: "Sara mentioned X" is a powerful framing.`);
  if (noEconomicBuyer) points.push('Economic Buyer not yet engaged — use this meeting to ask your champion for a warm introduction path to the budget holder.');

  // Account-specific
  if (account.industry.includes('Energy') || account.industry.includes('Oil')) {
    points.push('KSA energy sector priority: lead with data residency and OT/IT integration — these are non-negotiable for O&G enterprises.');
  }
  if (account.industry.includes('Telecom')) {
    points.push('Telecom angle: emphasize platform scalability and AI services enablement — telcos are under pressure to monetize their networks.');
  }
  if (account.name === 'NEOM') {
    points.push('NEOM context: reference the SAR 1.9B infrastructure investment. Position as the AI backbone for the smart city stack, not just a point solution.');
  }

  // Always-on close
  points.push('End with a clear next step: a date, an owner, and a deliverable. Don\'t leave without scheduling the follow-up.');

  return points.slice(0, 5);
}

export default function BriefPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);
  const [generating, setGenerating] = useState(true);

  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId) ?? MOCK_ACCOUNTS[0];
  const deals = MOCK_DEALS.filter((d) => d.accountId === account.id);
  const stakeholders = MOCK_STAKEHOLDERS.filter((s) => s.accountId === account.id);
  const signals = MOCK_SIGNALS.filter((s) => s.accountId === account.id);
  const tasks = MOCK_TASKS.filter((t) => deals.some((d) => d.id === t.dealId));
  const meetingSummary = MOCK_MEETING_SUMMARY.accountId === account.id ? MOCK_MEETING_SUMMARY : null;

  const health = computeAccountHealth(account, deals, stakeholders, signals);
  const hs = HEALTH_STYLE[health.status];
  const deal = deals[0];
  const openActionItems = meetingSummary?.actionItems.filter((a) => !a.checked) ?? [];
  const talkingPoints = generateTalkingPoints(account, deals, stakeholders, signals);

  // Fake brief generation on first render
  if (generating) {
    setTimeout(() => setGenerating(false), 1400);
    return (
      <AppShellCard>
        <AppShellCard.Header>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-brand-500" />
            <AppShellCard.Title>Pre-Meeting Brief</AppShellCard.Title>
          </div>
        </AppShellCard.Header>
        <div className="flex flex-col items-center gap-5 py-24">
          <div className="relative flex items-center justify-center">
            <div className="size-14 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
            <Sparkles className="absolute size-5 text-brand-500" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">Generating your brief…</p>
            <p className="text-sm text-muted-foreground mt-1">Pulling account intel, signals, and suggested angles</p>
          </div>
        </div>
      </AppShellCard>
    );
  }

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div className="flex items-center gap-3">
          <AccountAvatar accountId={account.id} name={account.name} size="md" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <AppShellCard.Title>Pre-Meeting Brief</AppShellCard.Title>
              <Badge color="secondary">{account.name}</Badge>
              <Badge color={hs.color}>{hs.label}</Badge>
            </div>
            <AppShellCard.Subtitle>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              {' · '}AI-generated · For Turki Bin Nader
            </AppShellCard.Subtitle>
          </div>
        </div>
      </AppShellCard.Header>
      <AppShellCard.Actions>
        <Button appearance="ghost" size="sm" render={<Link href={`/accounts/${account.id}`} />}
          startIcon={<ArrowLeft className="size-4" />}>
          Back to Account
        </Button>
        <Button appearance="outline" size="sm" startIcon={<Printer className="size-4" />}
          onClick={() => window.print()}>
          Print
        </Button>
      </AppShellCard.Actions>

      <div className="flex flex-col gap-8">

        {/* ── DEAL SNAPSHOT ──────────────────────────────────────── */}
        {deal && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Deal Stage', value: deal.stage, icon: <TrendingUp className="size-3.5" /> },
              { label: 'ACV', value: `SAR ${(deal.acv / 1000).toFixed(0)}K`, icon: <DollarSign className="size-3.5" /> },
              { label: 'Close Date', value: deal.closeDate, icon: <Clock className="size-3.5" /> },
              { label: 'Days Idle', value: `${deal.daysSinceActivity}d`, icon: <AlertTriangle className="size-3.5" />, warn: deal.daysSinceActivity > 14 },
            ].map(({ label, value, icon, warn }) => (
              <div key={label} className={`rounded-xl border px-4 py-3 ${warn ? 'border-warning/40 bg-warning/5' : 'border-border bg-card'}`}>
                <div className={`flex items-center gap-1.5 mb-1 ${warn ? 'text-warning' : 'text-muted-foreground'}`}>
                  {icon}
                  <p className="text-xs font-medium">{label}</p>
                </div>
                <p className={`text-lg font-bold ${warn ? 'text-warning' : 'text-foreground'}`}>{value}</p>
              </div>
            ))}
          </section>
        )}

        {/* ── ACCOUNT HEALTH ──────────────────────────────────────── */}
        <section className="rounded-xl border border-border bg-card px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-foreground">Account Health — {hs.label}</h3>
            <Badge color={hs.color}>{health.score}/100</Badge>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
            <div className={`h-full rounded-full transition-all ${hs.color === 'success' ? 'bg-success' : hs.color === 'warning' ? 'bg-warning' : 'bg-destructive'}`}
              style={{ width: `${health.score}%` }} />
          </div>
          <div className="flex flex-col gap-1.5">
            {health.reasons.map((r) => (
              <div key={r} className="flex items-start gap-2 text-sm text-foreground">
                <AlertTriangle className="size-3.5 text-warning shrink-0 mt-0.5" />
                {r}
              </div>
            ))}
          </div>
        </section>

        {/* ── SIGNALS ──────────────────────────────────────────────── */}
        {signals.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-foreground">Recent Signals</h3>
              <Badge color="secondary">{signals.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {signals.map((s) => (
                <div key={s.id} className="flex items-start gap-3 rounded-lg border border-brand-500/20 bg-brand-500/5 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.summary}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{s.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── WHO'S IN THE ROOM ─────────────────────────────────── */}
        {stakeholders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-foreground">Who&apos;s in the Room</h3>
              </div>
              <Button appearance="ghost" size="sm" render={<Link href={`/accounts/${account.id}/map`} />}
                endIcon={<Map className="size-4" />}>
                Full Map
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {stakeholders.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <Avatar fallback={s.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      <Badge color={ROLE_COLOR[s.role]}>{s.role}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.title}</p>
                    <StrengthPips value={s.strength} />
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 text-right">
                    <p>{STRENGTH_LABELS[s.strength]}</p>
                    <p>Last: {s.lastContact === 'Never' ? <span className="text-destructive">Never</span> : s.lastContact}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── OPEN ACTION ITEMS ─────────────────────────────────── */}
        {openActionItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckSquare className="size-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-foreground">Open Action Items</h3>
              <Badge color="warning">{openActionItems.length}</Badge>
            </div>
            <div className="flex flex-col gap-2">
              {openActionItems.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <div className="size-4 rounded-full border-2 border-border mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Owner: {a.owner} · Due: {a.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SUGGESTED TALKING POINTS ─────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="size-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-foreground">Suggested Talking Points</h3>
            <Badge color="secondary">AI</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {talkingPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-500 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground">{point}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Sparkles className="size-3" />
            Talking points are AI-generated from account signals and deal context. Review before use.
          </p>
        </section>

        {/* ── PENDING HIGH-PRIORITY TASKS ──────────────────────── */}
        {tasks.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-4 text-warning" />
              <h3 className="text-sm font-semibold text-foreground">Pending Actions for This Account</h3>
            </div>
            <div className="flex flex-col gap-2">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge color={t.priority === 'high' ? 'destructive' : t.priority === 'medium' ? 'warning' : 'secondary'}>
                        {t.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{t.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.reason}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </AppShellCard>
  );
}
