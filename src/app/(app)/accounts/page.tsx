'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Input,
  Avatar,
  Tooltip,
} from '@humain-foundation/ui';
import { Search, ChevronRight, Building2 } from 'lucide-react';
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

const ALL_TIERS = ['All', 'Strategic', 'Enterprise', 'Mid-Market'] as const;
const ALL_HEALTH = ['All', 'Healthy', 'At Risk', 'Critical'] as const;

export default function AccountsPage() {
  const [query, setQuery]       = useState('');
  const [tier, setTier]         = useState<string>('All');
  const [health, setHealth]     = useState<string>('All');

  const enriched = useMemo(() =>
    MOCK_ACCOUNTS.map((a) => {
      const deals = MOCK_DEALS.filter((d) => d.accountId === a.id);
      const staks = MOCK_STAKEHOLDERS.filter((s) => s.accountId === a.id);
      const sigs  = MOCK_SIGNALS.filter((s) => s.accountId === a.id);
      const h     = computeAccountHealth(a, deals, staks, sigs);
      const hs    = HEALTH_STYLE[h.status];
      return { ...a, health: h, hs, execCount: a.executives?.length ?? 0 };
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
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <AppShellCard.Title>Accounts</AppShellCard.Title>
          <AppShellCard.Subtitle>{MOCK_ACCOUNTS.length} accounts in your book</AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>

      <div className="flex flex-col gap-5">
        {/* Search + filters */}
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search by name or industry…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            startIcon={<Search className="size-4" />}
          />
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium mr-1">Tier</span>
              {ALL_TIERS.map((t) => (
                <Button key={t} size="sm"
                  appearance={tier === t ? 'solid' : 'outline'}
                  variant={tier === t ? 'primary' : undefined}
                  onClick={() => setTier(t)}>{t}</Button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium mr-1">Health</span>
              {ALL_HEALTH.map((h) => (
                <Button key={h} size="sm"
                  appearance={health === h ? 'solid' : 'outline'}
                  variant={health === h ? 'primary' : undefined}
                  onClick={() => setHealth(h)}>{h}</Button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} of {MOCK_ACCOUNTS.length} accounts</p>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Building2 className="size-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No accounts match</p>
            <p className="text-xs text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Account</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Revenue (FY)</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Headcount</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Tier</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Health</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Pipeline ACV</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filtered.map((account) => (
                  <tr key={account.id} className="hover:bg-accent transition-colors cursor-pointer group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar fallback={account.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{account.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{account.industry} · {account.hq ?? account.region}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      <div>
                        <p className="font-medium text-foreground">{account.revenue}</p>
                        {account.lastQuarterRevenue && (
                          <p className="text-xs text-muted-foreground">Q last: {account.lastQuarterRevenue}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">{account.headcount}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge color={TIER_COLOR[account.tier]}>{account.tier}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Badge color={account.hs.color}>{account.hs.label}</Badge>
                        </Tooltip.Trigger>
                        <Tooltip.Popup>
                          <div className="text-xs space-y-1">
                            {account.health.reasons.map((r) => <p key={r}>{r}</p>)}
                          </div>
                        </Tooltip.Popup>
                      </Tooltip.Root>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground hidden sm:table-cell">
                      ${(account.totalAcv / 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-3">
                      <Button appearance="ghost" size="sm"
                        render={<Link href={`/accounts/${account.id}`} />}
                        endIcon={<ChevronRight className="size-4" />}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShellCard>
  );
}
