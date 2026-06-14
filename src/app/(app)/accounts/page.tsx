'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Input,
} from '@humain-foundation/ui';
import {
  Search,
  Building2,
  TrendingUp,
  Users,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { AccountAvatar } from '@/components/account-avatar';
import {
  MOCK_ACCOUNTS,
  MOCK_DEALS,
  MOCK_STAKEHOLDERS,
  MOCK_SIGNALS,
  type Account,
} from '@/lib/mock-data';
import { computeAccountHealth, HEALTH_STYLE } from '@/lib/health';

type BadgeColor = 'primary' | 'secondary' | 'warning';

const TIER_COLOR: Record<Account['tier'], BadgeColor> = {
  Strategic: 'primary',
  Enterprise: 'secondary',
  'Mid-Market': 'warning',
};

const TIER_BORDER: Record<Account['tier'], string> = {
  Strategic:    'border-l-brand-500',
  Enterprise:   'border-l-brand-300',
  'Mid-Market': 'border-l-border',
};

const HEALTH_RING: Record<string, string> = {
  Healthy:  'ring-1 ring-success/30',
  'At Risk': 'ring-1 ring-warning/30',
  Critical: 'ring-1 ring-destructive/30',
};

const HEALTH_DOT: Record<string, string> = {
  Healthy:  'bg-success',
  'At Risk': 'bg-warning',
  Critical: 'bg-destructive',
};

const ALL_TIERS   = ['All', 'Strategic', 'Enterprise', 'Mid-Market'] as const;
const ALL_HEALTH  = ['All', 'Healthy', 'At Risk', 'Critical'] as const;

function fmtAcv(v: number) {
  if (v >= 1_000_000) return `SAR ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `SAR ${(v / 1_000).toFixed(0)}K`;
  return `SAR ${v}`;
}

export default function AccountsPage() {
  const [query, setQuery]   = useState('');
  const [tier, setTier]     = useState<string>('All');
  const [health, setHealth] = useState<string>('All');

  const enriched = useMemo(() =>
    MOCK_ACCOUNTS.map((a) => {
      const deals   = MOCK_DEALS.filter((d) => d.accountId === a.id);
      const staks   = MOCK_STAKEHOLDERS.filter((s) => s.accountId === a.id);
      const sigs    = MOCK_SIGNALS.filter((s) => s.accountId === a.id);
      const h       = computeAccountHealth(a, deals, staks, sigs);
      const hs      = HEALTH_STYLE[h.status];
      const openAcv = deals
        .filter((d) => d.stage !== 'Won' && d.stage !== 'Lost' && d.stage !== 'Dropped')
        .reduce((s, d) => s + d.acv, 0);
      return { ...a, health: h, hs, openAcv, dealCount: deals.length, stakeholderCount: staks.length };
    }), []);

  const filtered = useMemo(() =>
    enriched.filter((a) => {
      if (tier !== 'All' && a.tier !== tier) return false;
      if (health !== 'All' && a.hs.label !== health) return false;
      if (query) {
        const q = query.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q);
      }
      return true;
    }), [enriched, tier, health, query]);

  return (
    <AppShellCard className="page-enter">
      <AppShellCard.Header>
        <div>
          <AppShellCard.Title>Accounts</AppShellCard.Title>
          <AppShellCard.Subtitle>{MOCK_ACCOUNTS.length} accounts in your book of business</AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>

      <div className="flex flex-col gap-6">
        {/* ── Search + filters ── */}
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search by name or industry…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            startIcon={<Search className="size-4" />}
          />
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mr-1">Tier</span>
              {ALL_TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={[
                    'px-3 py-1 rounded-full text-xs font-medium transition-all',
                    tier === t
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mr-1">Health</span>
              {ALL_HEALTH.map((h) => (
                <button
                  key={h}
                  onClick={() => setHealth(h)}
                  className={[
                    'px-3 py-1 rounded-full text-xs font-medium transition-all',
                    health === h
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  ].join(' ')}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {MOCK_ACCOUNTS.length} accounts
          </p>
        </div>

        {/* ── Card grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
              <Building2 className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No accounts match</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((account) => (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`}
                className={[
                  'group relative flex flex-col gap-4 rounded-2xl border border-l-4 bg-card p-5',
                  'transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5',
                  TIER_BORDER[account.tier],
                  HEALTH_RING[account.hs.label] ?? '',
                ].join(' ')}
              >
                {/* ── Header ── */}
                <div className="flex items-start gap-3">
                  <AccountAvatar accountId={account.id} name={account.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground leading-tight truncate">{account.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {account.industry} · {account.hq ?? account.region}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Badge color={TIER_COLOR[account.tier]}>{account.tier}</Badge>
                      <span className={[
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                        account.hs.label === 'Healthy'
                          ? 'bg-success/15 text-success'
                          : account.hs.label === 'At Risk'
                            ? 'bg-warning/15 text-warning'
                            : 'bg-destructive/15 text-destructive',
                      ].join(' ')}>
                        <span className={['size-1.5 rounded-full', HEALTH_DOT[account.hs.label]].join(' ')} />
                        {account.hs.label}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </div>

                {/* ── Divider ── */}
                <div className="h-px bg-border" />

                {/* ── Stats row ── */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-brand-500 mb-1">
                      <TrendingUp className="size-3.5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">{fmtAcv(account.openAcv)}</p>
                    <p className="text-[10px] text-muted-foreground">Open ACV</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-brand-500 mb-1">
                      <Briefcase className="size-3.5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">{account.dealCount}</p>
                    <p className="text-[10px] text-muted-foreground">Deals</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-brand-500 mb-1">
                      <Users className="size-3.5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">{account.stakeholderCount}</p>
                    <p className="text-[10px] text-muted-foreground">Contacts</p>
                  </div>
                </div>

                {/* ── Revenue footer ── */}
                {account.revenue && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-semibold text-foreground">{account.revenue}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShellCard>
  );
}
