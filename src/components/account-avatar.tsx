'use client';

import { useState } from 'react';
import { Avatar, Button, Dialog, Input } from '@humain-foundation/ui';
import { Pencil, Check } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toast } from '@humain-foundation/ui';

interface AccountAvatarProps {
  accountId: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

export function AccountAvatar({ accountId, name, size = 'md', editable = false }: AccountAvatarProps) {
  const [logoUrl, setLogoUrl] = useLocalStorage<string>(`logo:${accountId}`, '');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const handleSave = () => {
    setLogoUrl(draft.trim());
    setOpen(false);
    toast.success('Logo updated', { description: name });
  };

  const img = logoUrl || '';

  return (
    <div className="relative group/avatar inline-block">
      {img ? (
        <img
          src={img}
          alt={name}
          className={`rounded-full object-cover ring-2 ring-border bg-card ${
            size === 'xs' ? 'size-6' :
            size === 'sm' ? 'size-8' :
            size === 'md' ? 'size-10' :
            size === 'lg' ? 'size-12' : 'size-16'
          }`}
          onError={(e) => {
            setLogoUrl('');
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <Avatar fallback={name} size={size} />
      )}

      {editable && (
        <>
          <button
            onClick={() => { setDraft(logoUrl); setOpen(true); }}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity"
            aria-label="Edit logo"
          >
            <Pencil className="size-3.5 text-white" />
          </button>

          <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
            <Dialog.Portal>
              <Dialog.Backdrop />
              <Dialog.Viewport>
                <Dialog.Popup className="w-full max-w-sm">
                  <Dialog.Header>
                    <Dialog.Title>Set Company Logo</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    <div className="flex flex-col gap-4">
                      <Input
                        label="Logo URL"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="https://logo.clearbit.com/company.com"
                        description="Paste any public image URL — square logos work best"
                      />
                      {draft && (
                        <div className="flex items-center gap-3">
                          <img src={draft} alt="Preview" className="size-12 rounded-full object-cover ring-2 ring-border"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <p className="text-xs text-muted-foreground">Preview</p>
                        </div>
                      )}
                      {logoUrl && (
                        <button className="text-xs text-destructive hover:underline text-left"
                          onClick={() => { setLogoUrl(''); setOpen(false); toast.success('Logo removed'); }}>
                          Remove current logo
                        </button>
                      )}
                    </div>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button appearance="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSave} startIcon={<Check className="size-4" />}>
                      Save
                    </Button>
                  </Dialog.Footer>
                </Dialog.Popup>
              </Dialog.Viewport>
            </Dialog.Portal>
          </Dialog>
        </>
      )}
    </div>
  );
}
