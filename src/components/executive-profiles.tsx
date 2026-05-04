'use client';

import { useState } from 'react';
import { Avatar, Badge, Button, Input, Dialog } from '@humain-foundation/ui';
import { Pencil, Plus, Trash2, Link2, Mail, X, Check } from 'lucide-react';
import type { AccountExecutive } from '@/lib/mock-data';

const EMPTY_EXEC: Omit<AccountExecutive, 'id'> = {
  name: '',
  title: '',
  photoUrl: '',
  linkedin: '',
  email: '',
};

function ExecCard({
  exec,
  onEdit,
  onDelete,
}: {
  exec: AccountExecutive;
  onEdit: (exec: AccountExecutive) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group relative flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center hover:border-brand-500/30 transition-all">
      <div className="relative">
        {exec.photoUrl ? (
          <img
            src={exec.photoUrl}
            alt={exec.name}
            className="size-16 rounded-full object-cover ring-2 ring-border"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <Avatar fallback={exec.name} size="xl" />
        )}
      </div>
      <div className="min-w-0 w-full">
        <p className="text-sm font-semibold text-foreground truncate">{exec.name}</p>
        <p className="text-xs text-muted-foreground truncate">{exec.title}</p>
      </div>
      <div className="flex items-center gap-1">
        {exec.email && (
          <Button appearance="ghost" size="icon" aria-label="Email" render={<a href={`mailto:${exec.email}`} />}>
            <Mail className="size-3.5" />
          </Button>
        )}
        {exec.linkedin && (
          <Button appearance="ghost" size="icon" aria-label="LinkedIn" render={<a href={exec.linkedin} target="_blank" rel="noopener noreferrer" />}>
            <Link2 className="size-3.5" />
          </Button>
        )}
      </div>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button appearance="ghost" size="icon" aria-label="Edit" onClick={() => onEdit(exec)}>
          <Pencil className="size-3.5" />
        </Button>
        <Button appearance="ghost" size="icon" aria-label="Delete" onClick={() => onDelete(exec.id)}>
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function ExecDialog({
  open,
  initial,
  onSave,
  onClose,
}: {
  open: boolean;
  initial: AccountExecutive | null;
  onSave: (exec: AccountExecutive) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<AccountExecutive, 'id'>>(
    initial ? { name: initial.name, title: initial.title, photoUrl: initial.photoUrl ?? '', linkedin: initial.linkedin ?? '', email: initial.email ?? '' }
            : { ...EMPTY_EXEC }
  );

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ id: initial?.id ?? `exec-${Date.now()}`, ...form });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup className="w-full max-w-lg">
            <Dialog.Header>
              <Dialog.Title>{initial ? 'Edit Executive' : 'Add Executive'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Amin H. Nasser" />
                  <Input label="Title" value={form.title} onChange={set('title')} placeholder="President & CEO" />
                </div>
                <Input label="Photo URL" value={form.photoUrl} onChange={set('photoUrl')} placeholder="https://…/photo.jpg" description="Paste a public image URL" />
                {form.photoUrl && (
                  <div className="flex items-center gap-3">
                    <img src={form.photoUrl} alt="Preview" className="size-12 rounded-full object-cover ring-2 ring-border" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                    <p className="text-xs text-muted-foreground">Photo preview</p>
                  </div>
                )}
                <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="exec@company.com" />
                <Input label="LinkedIn URL" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/…" />
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Button appearance="outline" onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={!form.name.trim()}
                startIcon={<Check className="size-4" />}>
                {initial ? 'Save Changes' : 'Add Executive'}
              </Button>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog>
  );
}

export function ExecutiveProfiles({ initialExecs }: { initialExecs: AccountExecutive[] }) {
  const [execs, setExecs] = useState<AccountExecutive[]>(initialExecs);
  const [editing, setEditing] = useState<AccountExecutive | null>(null);
  const [adding, setAdding] = useState(false);

  const handleSave = (exec: AccountExecutive) => {
    setExecs((prev) =>
      prev.some((e) => e.id === exec.id)
        ? prev.map((e) => (e.id === exec.id ? exec : e))
        : [...prev, exec]
    );
    setEditing(null);
    setAdding(false);
  };

  const handleDelete = (id: string) =>
    setExecs((prev) => prev.filter((e) => e.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Executive Team</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Account-level leadership · {execs.length} contacts</p>
        </div>
        <Button appearance="outline" size="sm" startIcon={<Plus className="size-4" />} onClick={() => setAdding(true)}>
          Add
        </Button>
      </div>

      {execs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
          <p className="text-sm text-muted-foreground">No executives added yet.</p>
          <Button appearance="outline" size="sm" startIcon={<Plus className="size-4" />} onClick={() => setAdding(true)}>
            Add first executive
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {execs.map((exec) => (
            <ExecCard key={exec.id} exec={exec} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ExecDialog
        open={!!editing}
        initial={editing}
        onSave={handleSave}
        onClose={() => setEditing(null)}
      />
      <ExecDialog
        open={adding}
        initial={null}
        onSave={handleSave}
        onClose={() => setAdding(false)}
      />
    </div>
  );
}
