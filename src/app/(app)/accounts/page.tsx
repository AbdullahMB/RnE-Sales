'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Input,
  Avatar,
} from '@humain-foundation/ui';
import { Search, ChevronRight, Building2 } from 'lucide-react';
import { MOCK_ACCOUNTS, type Account } from '@/lib/mock-data';

type BadgeColor = 'primary' | 'secondary' | 'warning';

const TIER_COLOR: Record<Account['tier'], BadgeColor> = {
  Strategic: 'primary',
  Enterprise: 'secondary',
  'Mid-Market': 'warning',
};

export default function AccountsPage() {
  const [query, setQuery] = useState('');

  const filtered = MOCK_ACCOUNTS.filter(
    (a) =>
      !query ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.industry.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <AppShellCard.Title>Accounts</AppShellCard.Title>
        <AppShellCard.Subtitle>{MOCK_ACCOUNTS.length} accounts in your book</AppShellCard.Subtitle>
      </AppShellCard.Header>

      <div className="flex flex-col gap-5">
        <Input
          placeholder="Search accounts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          startIcon={<Search className="size-4" />}
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Building2 className="size-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No accounts found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar fallback={account.name} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground truncate">{account.name}</p>
                      <Badge color={TIER_COLOR[account.tier]}>{account.tier}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {account.industry} · {account.region}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-foreground">
                      ${(account.totalAcv / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Pipeline ACV</p>
                  </div>
                  <Button
                    appearance="ghost"
                    size="sm"
                    render={<Link href={`/accounts/${account.id}`} />}
                    endIcon={<ChevronRight className="size-4" />}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShellCard>
  );
}
