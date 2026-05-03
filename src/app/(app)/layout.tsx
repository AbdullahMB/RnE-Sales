'use client';

import { useState } from 'react';
import { AppShell, SidebarProvider } from '@humain-foundation/ui';
import { SalesAppSidebar } from '@/components/app-sidebar';
import { CommandSearch } from '@/components/command-search';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <AppShell.Root gap={12}>
      <AppShell.Sidebar>
        <SidebarProvider connected>
          <SalesAppSidebar />
        </SidebarProvider>
      </AppShell.Sidebar>
      <AppShell.Panel flex={1} expanded={expanded} onExpandedChange={setExpanded}>
        {children}
      </AppShell.Panel>
      <CommandSearch />
    </AppShell.Root>
  );
}
