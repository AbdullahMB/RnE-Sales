'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Avatar,
  Dialog,
  Sheet,
  Input,
  Select,
  SelectItem,
} from '@humain-foundation/ui';
import {
  ArrowLeft,
  Plus,
  AlertTriangle,
  Mail,
  Phone,
  Link2,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  Building2,
} from 'lucide-react';
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
  'Decision Maker', 'Champion', 'Influencer', 'Blocker', 'Coach',
];

const STRENGTH_LABELS: Record<number, string> = {
  0: 'No contact', 1: 'Initial', 2: 'Developing', 3: 'Established', 4: 'Strong', 5: 'Trusted',
};

function daysSince(dateStr: string): number | null {
  if (dateStr === 'Never' || dateStr === 'Just added') return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / 86400_000);
}

function lastContactColor(dateStr: string): string {
  const days = daysSince(dateStr);
  if (days === null) return 'text-muted-foreground';
  if (days <= 7) return 'text-success';
  if (days <= 21) return 'text-warning';
  return 'text-destructive';
}

function StrengthPips({
  value,
  editable = false,
  onChange,
}: {
  value: number;
  editable?: boolean;
  onChange?: (v: RelationshipStrength) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((pip) => (
        <button
          key={pip}
          type="button"
          disabled={!editable}
          onClick={() => editable && onChange?.(pip as RelationshipStrength)}
          className={`h-3 w-3 rounded-full transition-colors ${
            pip <= value ? 'bg-brand-500' : 'bg-muted border border-border'
          } ${editable ? 'cursor-pointer hover:bg-brand-400' : 'cursor-default'}`}
          title={editable ? STRENGTH_LABELS[pip] : undefined}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{STRENGTH_LABELS[value]}</span>
    </div>
  );
}

// ─── Stakeholder Detail Sheet ────────────────────────────────────────────────

function StakeholderSheet({
  stakeholder,
  open,
  onClose,
  onSave,
  onDelete,
}: {
  stakeholder: Stakeholder;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Stakeholder) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(stakeholder);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Reset form when stakeholder changes
  const resetAndOpen = () => {
    setForm(stakeholder);
    setEditing(false);
  };

  const days = daysSince(stakeholder.lastContact);

  function handleSave() {
    onSave(form);
    setEditing(false);
  }

  function handleMarkContacted() {
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...stakeholder, lastContact: today };
    onSave(updated);
    setForm(updated);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => { if (!o) { onClose(); resetAndOpen(); } }}>
        <Sheet.Popup side="right">
          <Sheet.Header>
            <div className="flex items-center gap-3">
              <Avatar fallback={stakeholder.name} size="md" />
              <div>
                <Sheet.Title>{stakeholder.name}</Sheet.Title>
                <p className="text-sm text-muted-foreground">{stakeholder.title}</p>
              </div>
            </div>
          </Sheet.Header>

          <Sheet.Body>
            <div className="flex flex-col gap-6">
              {/* Role + Buying Center */}
              <div className="flex flex-wrap gap-2">
                <Badge color={ROLE_COLOR[stakeholder.role]}>{stakeholder.role}</Badge>
                {stakeholder.buyingCenter && (
                  <Badge color="secondary">
                    <Building2 className="size-3 mr-1" />
                    {stakeholder.buyingCenter}
                  </Badge>
                )}
              </div>

              {/* Relationship strength */}
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Relationship Strength
                </p>
                <StrengthPips
                  value={form.strength}
                  editable={editing}
                  onChange={(v) => setForm((f) => ({ ...f, strength: v }))}
                />
              </div>

              {/* Last contact */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Last Contact
                  </p>
                  <p className={`text-sm font-medium ${lastContactColor(stakeholder.lastContact)}`}>
                    {stakeholder.lastContact === 'Never'
                      ? 'Never contacted'
                      : days !== null
                      ? `${days} day${days === 1 ? '' : 's'} ago (${stakeholder.lastContact})`
                      : stakeholder.lastContact}
                  </p>
                </div>
                <Button
                  appearance="outline"
                  size="sm"
                  startIcon={<CheckCircle className="size-4" />}
                  onClick={handleMarkContacted}
                >
                  Mark today
                </Button>
              </div>

              {/* Contact details */}
              {editing ? (
                <div className="flex flex-col gap-4">
                  <Input label="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  <Input label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                  <Select label="Role" value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as StakeholderRole }))}>
                    {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </Select>
                  <Input label="Buying Center / Department" value={form.buyingCenter} onChange={(e) => setForm((f) => ({ ...f, buyingCenter: e.target.value }))} />
                  <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                  <Input label="LinkedIn URL" value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} />
                  <Input label="Notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Contact Details
                  </p>

                  {stakeholder.email && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground truncate">{stakeholder.email}</span>
                      </div>
                      <Button
                        appearance="ghost"
                        size="sm"
                        render={<a href={`mailto:${stakeholder.email}`} />}
                        startIcon={<Mail className="size-4" />}
                      >
                        Send
                      </Button>
                    </div>
                  )}

                  {stakeholder.phone && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">{stakeholder.phone}</span>
                      </div>
                      <Button
                        appearance="ghost"
                        size="sm"
                        render={<a href={`tel:${stakeholder.phone}`} />}
                        startIcon={<Phone className="size-4" />}
                      >
                        Call
                      </Button>
                    </div>
                  )}

                  {stakeholder.linkedin && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link2 className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-muted-foreground truncate">LinkedIn profile</span>
                      </div>
                      <Button
                        appearance="ghost"
                        size="sm"
                        render={<a href={stakeholder.linkedin} target="_blank" rel="noopener noreferrer" />}
                        startIcon={<Link2 className="size-4" />}
                      >
                        View
                      </Button>
                    </div>
                  )}

                  {stakeholder.notes && (
                    <div className="rounded-lg border border-border bg-muted px-4 py-3 mt-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-foreground">{stakeholder.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Sheet.Body>

          <Sheet.Footer>
            <Button
              appearance="ghost"
              variant="destructive"
              size="sm"
              startIcon={<Trash2 className="size-4" />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Sheet.Close render={<Button appearance="outline" onClick={() => setEditing(false)} />}>Cancel</Sheet.Close>
                  <Button variant="primary" onClick={handleSave}>Save</Button>
                </>
              ) : (
                <Button appearance="outline" startIcon={<Edit3 className="size-4" />} onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </Sheet.Footer>
        </Sheet.Popup>
      </Sheet>

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Popup size="sm" showCloseButton>
          <Dialog.Header>
            <Dialog.Title>Delete {stakeholder.name}?</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <p className="text-sm text-foreground">
              This will remove <strong>{stakeholder.name}</strong> from the stakeholder map. This action cannot be undone.
            </p>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Close render={<Button appearance="outline" />}>Cancel</Dialog.Close>
            <Button
              variant="destructive"
              onClick={() => { onDelete(stakeholder.id); setDeleteOpen(false); onClose(); }}
            >
              Delete
            </Button>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog>
    </>
  );
}

// ─── Stakeholder Card ─────────────────────────────────────────────────────────

function StakeholderCard({
  stakeholder,
  onSelect,
}: {
  stakeholder: Stakeholder;
  onSelect: (s: Stakeholder) => void;
}) {
  const days = daysSince(stakeholder.lastContact);

  return (
    <div
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent transition-colors cursor-pointer"
      onClick={() => onSelect(stakeholder)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <Avatar fallback={stakeholder.name} size="md" />
        <Badge color={ROLE_COLOR[stakeholder.role]}>{stakeholder.role}</Badge>
      </div>

      {/* Name + title */}
      <div>
        <p className="text-sm font-semibold text-foreground">{stakeholder.name}</p>
        <p className="text-xs text-muted-foreground">{stakeholder.title}</p>
        {stakeholder.buyingCenter && (
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Building2 className="size-3" /> {stakeholder.buyingCenter}
          </p>
        )}
      </div>

      {/* Contact info */}
      {(stakeholder.email || stakeholder.phone) && (
        <div className="flex flex-col gap-1">
          {stakeholder.email && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
              <Mail className="size-3 shrink-0" />
              <span className="truncate">{stakeholder.email}</span>
            </p>
          )}
          {stakeholder.phone && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Phone className="size-3 shrink-0" />
              {stakeholder.phone}
            </p>
          )}
        </div>
      )}

      {/* Strength */}
      <StrengthPips value={stakeholder.strength} />

      {/* Last contact */}
      <div className={`flex items-center gap-1 text-xs ${lastContactColor(stakeholder.lastContact)}`}>
        <Clock className="size-3 shrink-0" />
        {stakeholder.lastContact === 'Never'
          ? 'Never contacted'
          : days !== null
          ? `${days}d ago`
          : stakeholder.lastContact}
      </div>

      {/* Hover quick actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-border">
        <Button
          appearance="ghost"
          size="sm"
          className="flex-1"
          startIcon={<Mail className="size-3" />}
          render={<a href={`mailto:${stakeholder.email}`} onClick={(e) => e.stopPropagation()} />}
        >
          Email
        </Button>
        {stakeholder.phone && (
          <Button
            appearance="ghost"
            size="sm"
            className="flex-1"
            startIcon={<Phone className="size-3" />}
            render={<a href={`tel:${stakeholder.phone}`} onClick={(e) => e.stopPropagation()} />}
          >
            Call
          </Button>
        )}
        <Button
          appearance="ghost"
          size="sm"
          className="flex-1"
          startIcon={<Edit3 className="size-3" />}
          onClick={(e) => { e.stopPropagation(); onSelect(stakeholder); }}
        >
          Edit
        </Button>
      </div>
    </div>
  );
}

function CoverageGap({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-destructive/40 bg-destructive/5 p-4 min-h-[160px]">
      <AlertTriangle className="size-5 text-destructive/60" />
      <p className="text-xs font-medium text-destructive/80">No {role}</p>
      <p className="text-xs text-muted-foreground text-center">Coverage gap — high risk</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name: '', title: '', role: 'Influencer' as StakeholderRole,
  email: '', phone: '', linkedin: '', buyingCenter: '', notes: '',
};

export default function AccountMapPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId) ?? MOCK_ACCOUNTS[0];

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(
    MOCK_STAKEHOLDERS.filter((s) => s.accountId === account.id)
  );
  const [selected, setSelected] = useState<Stakeholder | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const decisionMakers = stakeholders.filter((s) => s.role === 'Decision Maker');
  const champions = stakeholders.filter((s) => s.role === 'Champion');
  const influencers = stakeholders.filter((s) => s.role === 'Influencer' || s.role === 'Coach');
  const blockers = stakeholders.filter((s) => s.role === 'Blocker');

  function handleAdd() {
    const newStakeholder: Stakeholder = {
      id: `sk-${Date.now()}`,
      accountId: account.id,
      strength: 1 as RelationshipStrength,
      lastContact: new Date().toISOString().split('T')[0],
      ...form,
    };
    setStakeholders((prev) => [...prev, newStakeholder]);
    setForm(EMPTY_FORM);
    setAddOpen(false);
  }

  function handleSave(updated: Stakeholder) {
    setStakeholders((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelected(updated);
  }

  function handleDelete(id: string) {
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
    setSelected(null);
  }

  return (
    <>
      <AppShellCard>
        <AppShellCard.Header>
          <div>
            <Button
              appearance="ghost"
              size="sm"
              render={<Link href={`/accounts/${account.id}`} />}
              startIcon={<ArrowLeft className="size-4" />}
              className="mb-1"
            >
              {account.name}
            </Button>
            <AppShellCard.Title>Stakeholder Map</AppShellCard.Title>
            <AppShellCard.Subtitle>{stakeholders.length} stakeholders · Click any card to view or edit</AppShellCard.Subtitle>
          </div>
        </AppShellCard.Header>
        <AppShellCard.Actions>
          <Button
            appearance="solid"
            size="sm"
            startIcon={<Plus className="size-4" />}
            onClick={() => setAddOpen(true)}
          >
            Add Stakeholder
          </Button>
        </AppShellCard.Actions>

        <div className="flex flex-col gap-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Badge color="primary">Decision Makers</Badge>
              <span className="text-xs text-muted-foreground">Budget authority · Final approval</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {decisionMakers.map((s) => <StakeholderCard key={s.id} stakeholder={s} onSelect={setSelected} />)}
              {decisionMakers.length === 0 && <CoverageGap role="Decision Maker" />}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Badge color="success">Champions</Badge>
              <span className="text-xs text-muted-foreground">Internal advocates · Guide the deal</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {champions.map((s) => <StakeholderCard key={s.id} stakeholder={s} onSelect={setSelected} />)}
              {champions.length === 0 && <CoverageGap role="Champion" />}
            </div>
          </section>

          {influencers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Badge color="secondary">Influencers & Coaches</Badge>
                <span className="text-xs text-muted-foreground">Shape criteria · Provide access</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {influencers.map((s) => <StakeholderCard key={s.id} stakeholder={s} onSelect={setSelected} />)}
              </div>
            </section>
          )}

          {blockers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Badge color="destructive">Blockers</Badge>
                <span className="text-xs text-muted-foreground">Active opposition · Monitor closely</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {blockers.map((s) => <StakeholderCard key={s.id} stakeholder={s} onSelect={setSelected} />)}
              </div>
            </section>
          )}
        </div>
      </AppShellCard>

      {/* Detail sheet */}
      {selected && (
        <StakeholderSheet
          stakeholder={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <Dialog.Popup size="md" showCloseButton>
          <Dialog.Header>
            <Dialog.Title>Add Stakeholder</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="Jane Al-Rashid" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <Input label="Title" placeholder="VP Engineering" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Role" value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as StakeholderRole }))}>
                  {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </Select>
                <Input label="Buying Center" placeholder="Finance / Technology" value={form.buyingCenter} onChange={(e) => setForm((f) => ({ ...f, buyingCenter: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" type="email" placeholder="jane@company.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                <Input label="Phone" type="tel" placeholder="+966 50 000 0000" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} />
              <Input label="Notes" placeholder="Context about this stakeholder..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
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
    </>
  );
}
