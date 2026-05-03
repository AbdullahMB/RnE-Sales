import { AppShellCard } from '@humain-foundation/ui';

export default function SettingsPage() {
  return (
    <AppShellCard>
      <AppShellCard.Header>
        <AppShellCard.Title>Settings</AppShellCard.Title>
        <AppShellCard.Subtitle>Account, integrations, and preferences</AppShellCard.Subtitle>
      </AppShellCard.Header>
      <p className="text-sm text-muted-foreground">Settings coming in Phase 2.</p>
    </AppShellCard>
  );
}
