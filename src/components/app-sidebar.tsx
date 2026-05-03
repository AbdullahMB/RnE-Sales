'use client';

import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/accounts', label: 'Accounts', icon: <Building2 /> },
  { href: '/wiki', label: 'Sales Wiki', icon: <BookOpen /> },
  { href: '/summarize', label: 'Meeting Summaries', icon: <FileText /> },
  { href: '/settings', label: 'Settings', icon: <Settings /> },
];

export function SalesAppSidebar() {
  const pathname = usePathname();

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
            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </AppSidebar.Nav>

      <NavAccountMenu>
        <NavAccountMenuTrigger
          avatar={<Avatar fallback="Alex Johnson" size="sm" />}
          name="Alex Johnson"
          email="alex.johnson@company.com"
        />
        <NavAccountMenuContent side="right" align="end">
          <NavAccountMenuHeader title="Alex Johnson" subtitle="Enterprise AE" />
          <NavAccountMenuSection>
            <NavAccountMenuItem icon={<User className="size-4" />}>
              View profile
            </NavAccountMenuItem>
            <NavAccountMenuItem icon={<Settings className="size-4" />}>
              Settings
            </NavAccountMenuItem>
          </NavAccountMenuSection>
          <NavAccountMenuSection bordered label="Preferences">
            <NavAccountMenuThemeSwitch variant="theme-gradient" />
          </NavAccountMenuSection>
          <NavAccountMenuSeparator />
          <NavAccountMenuSection>
            <NavAccountMenuItem icon={<LogOut className="size-4" />} destructive>
              Sign out
            </NavAccountMenuItem>
          </NavAccountMenuSection>
        </NavAccountMenuContent>
      </NavAccountMenu>
    </AppSidebar>
  );
}
