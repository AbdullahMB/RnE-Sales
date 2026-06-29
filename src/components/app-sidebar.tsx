'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AppSidebar,
  NavAccountMenu,
  NavAccountMenuTrigger,
  NavAccountMenuContent,
  NavAccountMenuHeader,
  NavAccountMenuSection,
  NavAccountMenuItem,
  NavAccountMenuThemeSwitch,
  NavAccountMenuSeparator,
  Avatar,
} from '@humain-foundation/ui';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Settings,
  LogOut,
  User,
  FileText,
  BrainCircuit,
  Bot,
  Sparkles,
  Layers2,
} from 'lucide-react';
import { MOCK_DEALS } from '@/lib/mock-data';

const highRiskCount = MOCK_DEALS.filter((d) => d.risk === 'high').length;

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard />, badge: highRiskCount > 0 ? highRiskCount : undefined },
  { href: '/accounts', label: 'Accounts', icon: <Building2 /> },
  { href: '/pipeline', label: 'Deal Intelligence', icon: <BrainCircuit /> },
  { href: '/subsectors', label: 'Sub Sectors', icon: <Layers2 /> },
  { href: '/agents', label: 'AI Sales Agents', icon: <Bot /> },
  { href: '/wiki', label: 'Sales Wiki', icon: <BookOpen /> },
  { href: '/summarize', label: 'Meeting Summaries', icon: <FileText /> },
  { href: '/collateral', label: 'Collateral Builder', icon: <Sparkles /> },
  { href: '/settings', label: 'Settings', icon: <Settings /> },
];

export function SalesAppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <AppSidebar
      logo={
        <span className="font-bold text-foreground tracking-tight">
          RnE<span className="text-brand-500"> Sales</span>
        </span>
      }
      logoSubtext="Toolkit"
      collapsible="icon"
      rounded
    >
      <AppSidebar.Nav>
        {NAV_ITEMS.map((item) => (
          <AppSidebar.NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            badge={item.badge}
            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </AppSidebar.Nav>

      <NavAccountMenu>
        <NavAccountMenuTrigger
          avatar={<Avatar fallback="Turki bin Nader" size="sm" />}
          name="Turki bin Nader"
          email="turki.binnader@company.com"
        />
        <NavAccountMenuContent side="right" align="end">
          <NavAccountMenuHeader title="Turki bin Nader" subtitle="Senior Account Executive" />
          <NavAccountMenuSection>
            <NavAccountMenuItem
              icon={<User className="size-4" />}
              render={(props) => <Link {...props} href="/settings" />}
            >
              View profile
            </NavAccountMenuItem>
            <NavAccountMenuItem
              icon={<Settings className="size-4" />}
              render={(props) => <Link {...props} href="/settings" />}
            >
              Settings
            </NavAccountMenuItem>
          </NavAccountMenuSection>
          <NavAccountMenuSection bordered label="Preferences">
            <NavAccountMenuThemeSwitch variant="theme-gradient" />
          </NavAccountMenuSection>
          <NavAccountMenuSeparator />
          <NavAccountMenuSection>
            <NavAccountMenuItem
              icon={<LogOut className="size-4" />}
              destructive
              onSelect={() => router.push('/login')}
            >
              Sign out
            </NavAccountMenuItem>
          </NavAccountMenuSection>
        </NavAccountMenuContent>
      </NavAccountMenu>
    </AppSidebar>
  );
}
