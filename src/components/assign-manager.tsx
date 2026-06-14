'use client';

import { useState } from 'react';
import { Avatar, Button, Dialog } from '@humain-foundation/ui';
import { ChevronDown, Check, UserCog } from 'lucide-react';
import { MOCK_TEAM, type TeamMember } from '@/lib/mock-data';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@humain-foundation/ui';

interface AssignManagerProps {
  accountId: string;
  defaultManagerId?: string;
  /** compact = small chip for table rows; full = card for account header */
  variant?: 'compact' | 'full';
}

export function AssignManager({ accountId, defaultManagerId, variant = 'full' }: AssignManagerProps) {
  const [managerId, setManagerId] = useLocalStorage<string>(
    `manager:${accountId}`,
    defaultManagerId ?? '',
  );
  const [open, setOpen] = useState(false);

  const manager = MOCK_TEAM.find((m) => m.id === managerId);

  const handleSelect = (member: TeamMember) => {
    setManagerId(member.id);
    setOpen(false);
    toast.success('Account manager assigned', { description: member.name });
  };

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs hover:bg-accent transition-colors"
        >
          <Avatar fallback={manager?.name ?? '?'} size="xs" />
          <span className="font-medium text-foreground max-w-[100px] truncate">
            {manager ? manager.name.split(' ')[0] : 'Unassigned'}
          </span>
          <ChevronDown className="size-3 text-muted-foreground shrink-0" />
        </button>
        <PickerDialog open={open} onClose={() => setOpen(false)} currentId={managerId} onSelect={handleSelect} />
      </>
    );
  }

  return (
    <>
      <div
        className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 cursor-pointer hover:bg-accent transition-colors group"
        onClick={() => setOpen(true)}
      >
        <Avatar fallback={manager?.name ?? 'Unassigned'} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">Account Manager</p>
          <p className="text-sm font-semibold text-foreground truncate">
            {manager ? manager.name : <span className="text-muted-foreground italic">Unassigned</span>}
          </p>
          {manager && <p className="text-xs text-muted-foreground truncate">{manager.title}</p>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <UserCog className="size-4 text-brand-500" />
        </div>
      </div>
      <PickerDialog open={open} onClose={() => setOpen(false)} currentId={managerId} onSelect={handleSelect} />
    </>
  );
}

function PickerDialog({
  open, onClose, currentId, onSelect,
}: {
  open: boolean;
  onClose: () => void;
  currentId: string;
  onSelect: (m: TeamMember) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup className="w-full max-w-md">
            <Dialog.Header>
              <Dialog.Title>Assign Account Manager</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <div className="flex flex-col gap-2">
                {MOCK_TEAM.map((member) => {
                  const isSelected = member.id === currentId;
                  return (
                    <button
                      key={member.id}
                      onClick={() => onSelect(member)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all hover:border-brand-500/40 hover:bg-accent ${
                        isSelected ? 'border-brand-500/50 bg-brand-500/5' : 'border-border bg-card'
                      }`}
                    >
                      <Avatar fallback={member.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.title}</p>
                        <p className="text-xs text-muted-foreground">{member.region} · {member.email}</p>
                      </div>
                      {isSelected && <Check className="size-4 text-brand-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </Dialog.Body>
            <Dialog.Footer>
              <Button appearance="outline" onClick={onClose}>Cancel</Button>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog>
  );
}
