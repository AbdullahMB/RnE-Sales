'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Avatar,
  Dialog,
  Input,
  Select,
  SelectItem,
} from '@humain-foundation/ui';
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react';
import {
  MOCK_ACCOUNTS,
  MOCK_STAKEHOLDERS,
  type Stakeholder,
  type StakeholderRole,
  type RelationshipStrength,
} from '@/lib/mock-data';

type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

const ROLE_COLOR: Record<StakeholderRole, BadgeColor> = {
  'Decision Maker': 'primary',
  Champion: 'success',
  Influencer: 'secondary',
  Blocker: 'destructive',
  Coach: 'secondary',
};

const ROLE_OPTIONS: StakeholderRole[] = [
  'Decision Maker',
  'Champion',
  'Influencer',
  'Blocker',
  'Coach',
];

function StrengthPips({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((pip) => (
        <span
          key={pip}
          className={`inline-block h-2.5 w-2.5 rounded-full ${pip <= value ? 'bg-brand-500' : 'bg-muted border border-border'}`}
        />
      ))}
    </div>
  );
}

function StakeholderCard({ stakeholder }: { stakeholder: Stakeholder }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent transition-colors">
      <div className="flex items-start justify-between gap-2">
        <Avatar fallback={stakeholder.name} size="md" />
        <Badge color={ROLE_COLOR[stakeholder.role]}>{stakeholder.role}</Badge>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{stakeholder.name}</p>
        <p className="text-xs text-muted-foreground">{stakeholder.title}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Relationship</p>
        <StrengthPips value={stakeholder.strength} />
      </div>
      {stakeholder.notes && (
        <p className="text-xs text-muted-foreground border-t border-border pt-2">{stakeholder.notes}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Last contact: {stakeholder.lastContact}
      </p>
    </div>
  );
}

function CoverageGap({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-destructive/40 bg-destructive/5 p-4 min-h-[140px]">
      <AlertTriangle className="size-5 text-destructive/60" />
      <p className="text-xs font-medium text-destructive/80">No {role}</p>
      <p className="text-xs text-muted-foreground text-center">Coverage gap — high risk</p>
    </div>
  );
}

export default function AccountMapPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId) ?? MOCK_ACCOUNTS[0];
  const [stakeholders, setStakeholders] = useState(
    MOCK_STAKEHOLDERS.filter((s) => s.accountId === account.id)
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    title: '',
    role: 'Influencer' as StakeholderRole,
    email: '',
    notes: '',
  });

  const decisionMakers = stakeholders.filter((s) => s.role === 'Decision Maker');
  const champions = stakeholders.filter((s) => s.role === 'Champion');
  const influencers = stakeholders.filter((s) => s.role === 'Influencer' || s.role === 'Coach');
  const blockers = stakeholders.filter((s) => s.role === 'Blocker');

  function handleAdd() {
    const newStakeholder: Stakeholder = {
      id: `sk-${Date.now()}`,
      accountId: account.id,
      name: form.name,
      title: form.title,
      role: form.role,
      strength: 1 as RelationshipStrength,
      lastContact: 'Just added',
      email: form.email,
      notes: form.notes,
    };
    setStakeholders((prev) => [...prev, newStakeholder]);
    setForm({ name: '', title: '', role: 'Influencer', email: '', notes: '' });
    setOpen(false);
  }

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button
              appearance="ghost"
              size="sm"
              render={<Link href={`/accounts/${account.id}`} />}
              startIcon={<ArrowLeft className="size-4" />}
            >
              {account.name}
            </Button>
          </div>
          <AppShellCard.Title>Stakeholder Map</AppShellCard.Title>
          <AppShellCard.Subtitle>{stakeholders.length} stakeholders mapped</AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>
      <AppShellCard.Actions>
        <Dialog open={open} onOpenChange={setOpen}>
          <Dialog.Trigger render={<Button appearance="solid" size="sm" startIcon={<Plus className="size-4" />} />}>
            Add Stakeholder
          </Dialog.Trigger>
          <Dialog.Popup size="md" showCloseButton>
            <Dialog.Header>
              <Dialog.Title>Add Stakeholder</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <div className="flex flex-col gap-4">
                <Input
                  label="Full Name"
                  placeholder="Jane Al-Rashid"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <Input
                  label="Title"
                  placeholder="VP Engineering"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <Select
                  label="Role"
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v as StakeholderRole }))}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="Email"
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <Input
                  label="Notes"
                  placeholder="Context about this stakeholder..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close render={<Button appearance="outline" />}>Cancel</Dialog.Close>
              <Button variant="primary" onClick={handleAdd} disabled={!form.name || !form.title}>
                Add to Map
              </Button>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog>
      </AppShellCard.Actions>

      <div className="flex flex-col gap-8">
        {/* Decision Makers row */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Badge color="primary">Decision Makers</Badge>
            <span className="text-xs text-muted-foreground">Budget authority · Final approval</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {decisionMakers.map((s) => <StakeholderCard key={s.id} stakeholder={s} />)}
            {decisionMakers.length === 0 && <CoverageGap role="Decision Maker" />}
          </div>
        </section>

        {/* Champions row */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Badge color="success">Champions</Badge>
            <span className="text-xs text-muted-foreground">Internal advocates · Guide the deal</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {champions.map((s) => <StakeholderCard key={s.id} stakeholder={s} />)}
            {champions.length === 0 && <CoverageGap role="Champion" />}
          </div>
        </section>

        {/* Influencers & Coaches */}
        {influencers.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Badge color="secondary">Influencers & Coaches</Badge>
              <span className="text-xs text-muted-foreground">Shape criteria · Provide access</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {influencers.map((s) => <StakeholderCard key={s.id} stakeholder={s} />)}
            </div>
          </section>
        )}

        {/* Blockers */}
        {blockers.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Badge color="destructive">Blockers</Badge>
              <span className="text-xs text-muted-foreground">Active opposition · Monitor closely</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {blockers.map((s) => <StakeholderCard key={s.id} stakeholder={s} />)}
            </div>
          </section>
        )}
      </div>
    </AppShellCard>
  );
}
