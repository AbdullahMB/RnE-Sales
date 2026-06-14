'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommandMenu } from '@humain-foundation/ui';
import type { CommandMenuGroup } from '@humain-foundation/ui';
import { Building2, FileText, LayoutDashboard, Settings, Map, BookOpen } from 'lucide-react';
import {
  MOCK_ACCOUNTS,
  MOCK_DEALS,
  MOCK_WIKI_ASSETS,
} from '@/lib/mock-data';

function buildGroups(): CommandMenuGroup[] {
  return [
    {
      id: 'nav',
      label: 'Navigation',
      options: [
        { id: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="size-4" />, shortcut: '⌘D' },
        { id: '/accounts', label: 'All Accounts', icon: <Building2 className="size-4" /> },
        { id: '/wiki', label: 'Sales Wiki', icon: <BookOpen className="size-4" /> },
        { id: '/settings', label: 'Settings', icon: <Settings className="size-4" />, shortcut: '⌘,' },
      ],
    },
    {
      id: 'accounts',
      label: 'Accounts',
      options: MOCK_ACCOUNTS.map((a) => ({
        id: `/accounts/${a.id}`,
        label: a.name,
        subtitle: `${a.industry} · ${a.region}`,
        icon: <Building2 className="size-4" />,
      })),
    },
    {
      id: 'deals',
      label: 'Deals',
      options: MOCK_DEALS.map((d) => ({
        id: `/accounts/${d.accountId}`,
        label: d.accountName,
        subtitle: `${d.stage} · SAR ${(d.acv / 1000).toFixed(0)}K ACV`,
        icon: <Map className="size-4" />,
      })),
    },
    {
      id: 'wiki',
      label: 'Wiki',
      options: MOCK_WIKI_ASSETS.map((w) => ({
        id: `/wiki`,
        label: w.title,
        subtitle: w.type,
        icon: <FileText className="size-4" />,
      })),
    },
  ];
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <CommandMenu
      open={open}
      onOpenChange={setOpen}
      placeholder="Search accounts, deals, wiki…"
      groups={buildGroups()}
      showFooter
      showShortcut
      onSelect={(id) => {
        router.push(id);
        setOpen(false);
      }}
    />
  );
}
