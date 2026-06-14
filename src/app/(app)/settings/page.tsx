'use client';

import { useState } from 'react';
import {
  AppShellCard,
  Badge,
  Button,
  Input,
  Tabs,
  Avatar,
} from '@humain-foundation/ui';
import {
  Database,
  User,
  Bell,
  Shield,
  CheckCircle,
  ExternalLink,
  Settings as SettingsIcon,
} from 'lucide-react';

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [sfConnected] = useState(false);
  const [instanceUrl, setInstanceUrl] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <div className="flex items-center gap-2">
            <SettingsIcon className="size-5 text-brand-500" />
            <AppShellCard.Title>Settings</AppShellCard.Title>
          </div>
          <AppShellCard.Subtitle>Account, integrations, and preferences</AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>

      <Tabs defaultValue="profile">
        <Tabs.List>
          <Tabs.Trigger value="profile">
            <User className="size-4" /> Profile
          </Tabs.Trigger>
          <Tabs.Trigger value="integrations">
            <Database className="size-4" /> Integrations
          </Tabs.Trigger>
          <Tabs.Trigger value="notifications">
            <Bell className="size-4" /> Notifications
          </Tabs.Trigger>
          <Tabs.Trigger value="security">
            <Shield className="size-4" /> Security
          </Tabs.Trigger>
        </Tabs.List>

        {/* Profile */}
        <Tabs.Content value="profile" className="mt-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar fallback="Turki Bin Nader" size="xl" />
              <div>
                <p className="text-base font-semibold text-foreground">Turki Bin Nader</p>
                <p className="text-sm text-muted-foreground">Enterprise Account Executive</p>
                <Badge color="primary" className="mt-1">AE</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-4 max-w-md">
              <Input label="Full Name" defaultValue="Turki Bin Nader" />
              <Input label="Email" type="email" defaultValue="turki.binnader@company.com" />
              <Input label="Title" defaultValue="Enterprise Account Executive" />
              <Input label="Region" defaultValue="KSA / GCC" />
              <Button variant="primary" className="self-start">Save Changes</Button>
            </div>
          </div>
        </Tabs.Content>

        {/* Integrations */}
        <Tabs.Content value="integrations" className="mt-6">
          <div className="flex flex-col">
            <SettingRow
              label="Salesforce"
              description="Connect your Salesforce org to sync accounts, opportunities, and activities."
            >
              {sfConnected ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-success" />
                  <Badge color="success">Connected</Badge>
                </div>
              ) : (
                <Button appearance="outline" size="sm" endIcon={<ExternalLink className="size-4" />}>
                  Connect
                </Button>
              )}
            </SettingRow>

            {!sfConnected && (
              <div className="py-4 border-b border-border">
                <Input
                  label="Salesforce Instance URL"
                  placeholder="https://yourorg.salesforce.com"
                  value={instanceUrl}
                  onChange={(e) => setInstanceUrl(e.target.value)}
                  description="Find this in Salesforce under Setup → Company Information."
                />
                <Button variant="primary" size="sm" className="mt-3" disabled={!instanceUrl}>
                  Authorize with Salesforce
                </Button>
              </div>
            )}

            <SettingRow
              label="Gong / Chorus"
              description="Pull meeting recordings and transcripts for AI summarization."
            >
              <Button appearance="outline" size="sm">Connect</Button>
            </SettingRow>

            <SettingRow
              label="Slack"
              description="Receive deal alerts and daily digests in Slack."
            >
              <Button appearance="outline" size="sm">Connect</Button>
            </SettingRow>

            <SettingRow
              label="Google Calendar / Outlook"
              description="Sync meeting context for pre-meeting briefings."
            >
              <Button appearance="outline" size="sm">Connect</Button>
            </SettingRow>
          </div>
        </Tabs.Content>

        {/* Notifications */}
        <Tabs.Content value="notifications" className="mt-6">
          <div className="flex flex-col">
            <SettingRow
              label="Email digest"
              description="Daily summary of stalled deals, signals, and suggested actions."
            >
              <Button
                appearance={emailAlerts ? 'solid' : 'outline'}
                variant={emailAlerts ? 'primary' : undefined}
                size="sm"
                onClick={() => setEmailAlerts((v) => !v)}
              >
                {emailAlerts ? 'On' : 'Off'}
              </Button>
            </SettingRow>

            <SettingRow
              label="Slack alerts"
              description="High-priority deal signals pushed to your Slack DM."
            >
              <Button
                appearance={slackAlerts ? 'solid' : 'outline'}
                variant={slackAlerts ? 'primary' : undefined}
                size="sm"
                onClick={() => setSlackAlerts((v) => !v)}
              >
                {slackAlerts ? 'On' : 'Off'}
              </Button>
            </SettingRow>

            <SettingRow
              label="Signal alert limit"
              description="Maximum high-priority alerts per day (BRD cap: 5)."
            >
              <Input defaultValue="5" type="number" className="w-20 text-center" />
            </SettingRow>
          </div>
        </Tabs.Content>

        {/* Security */}
        <Tabs.Content value="security" className="mt-6">
          <div className="flex flex-col">
            <SettingRow
              label="Single Sign-On (SSO)"
              description="Configured via your IdP. Contact IT to update SSO settings."
            >
              <Badge color="success">Active</Badge>
            </SettingRow>

            <SettingRow
              label="Data residency"
              description="All data processed and stored in KSA region (me-central-1)."
            >
              <Badge color="primary">KSA</Badge>
            </SettingRow>

            <SettingRow
              label="AI training opt-out"
              description="Your meeting data is never used to train vendor models."
            >
              <Badge color="success">Opted out</Badge>
            </SettingRow>

            <SettingRow
              label="Audit log"
              description="Every AI output and Salesforce write is logged for SOC 2 compliance."
            >
              <Button appearance="outline" size="sm">View log</Button>
            </SettingRow>
          </div>
        </Tabs.Content>
      </Tabs>
    </AppShellCard>
  );
}
