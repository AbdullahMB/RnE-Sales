'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Dialog, Input } from '@humain-foundation/ui';
import {
  ImagePlus, Pencil, Check, ExternalLink, Map, Sparkles,
  Globe, BarChart2, Building2, Calendar,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AccountAvatar } from '@/components/account-avatar';
import { AssignManager } from '@/components/assign-manager';
import { toast } from '@humain-foundation/ui';
import type { Account } from '@/lib/mock-data';
import { HEALTH_STYLE, type HealthScore } from '@/lib/health';

// Industry → gradient fallback when no banner is set (solid colors so they render on any bg)
const INDUSTRY_GRADIENT: Record<string, string> = {
  'Energy':        'from-orange-950 via-orange-900 to-amber-800',
  'Oil':           'from-orange-950 via-orange-900 to-amber-800',
  'Petrochemical': 'from-teal-950 via-teal-900 to-teal-700',
  'Telecom':       'from-blue-950 via-blue-900 to-blue-700',
  'Smart City':    'from-violet-950 via-violet-900 to-indigo-700',
  'Infrastructure':'from-violet-950 via-violet-900 to-indigo-700',
};
function gradientFor(industry: string) {
  const key = Object.keys(INDUSTRY_GRADIENT).find((k) => industry.includes(k));
  return key ? INDUSTRY_GRADIENT[key] : 'from-brand-950 via-brand-900 to-brand-700';
}

interface AccountHeroProps {
  account: Account;
  health: HealthScore;
}

export function AccountHero({ account, health }: AccountHeroProps) {
  const hs = HEALTH_STYLE[health.status];

  const [bannerUrl, setBannerUrl] = useLocalStorage<string>(`banner:${account.id}`, '');
  const [description, setDescription] = useLocalStorage<string>(`desc:${account.id}`, '');

  const [bannerOpen, setBannerOpen] = useState(false);
  const [descOpen, setDescOpen]     = useState(false);
  const [bannerDraft, setBannerDraft] = useState('');
  const [descDraft, setDescDraft]     = useState('');

  const handleSaveBanner = () => {
    setBannerUrl(bannerDraft.trim());
    setBannerOpen(false);
    toast.success('Banner updated');
  };
  const handleSaveDesc = () => {
    setDescription(descDraft.trim());
    setDescOpen(false);
    toast.success('Description saved');
  };

  const gradient = gradientFor(account.industry);

  return (
    <div className="flex flex-col">
      {/* ── BANNER ──────────────────────────────────────────── */}
      <div className="relative w-full h-40 sm:h-52 overflow-hidden group rounded-t-2xl">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Account banner"
            className="w-full h-full object-cover"
            onError={() => setBannerUrl('')} />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-end pr-10`}>
            <span className="text-[7rem] font-black text-white/[0.07] select-none tracking-tighter leading-none">
              {account.name.split(' ').map((w) => w[0]).join('').slice(0, 3)}
            </span>
          </div>
        )}

        {/* Edit banner button */}
        <button
          onClick={() => { setBannerDraft(bannerUrl); setBannerOpen(true); }}
          className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70"
        >
          <ImagePlus className="size-3.5" />
          {bannerUrl ? 'Change banner' : 'Add banner'}
        </button>
      </div>

      {/* ── LOGO + IDENTITY ROW ─────────────────────────────── */}
      <div className="relative px-5 pb-4">
        {/* Logo overlapping the banner */}
        <div className="absolute -top-8 left-5 ring-4 ring-background rounded-full bg-background">
          <AccountAvatar accountId={account.id} name={account.name} size="xl" editable />
        </div>

        {/* Action buttons top-right */}
        <div className="flex justify-end gap-2 pt-3 mb-10 flex-wrap">
          <Button appearance="ghost" size="sm" endIcon={<ExternalLink className="size-4" />}>
            Salesforce
          </Button>
          <Button appearance="outline" size="sm"
            render={<Link href={`/accounts/${account.id}/map`} />}
            startIcon={<Map className="size-4" />}>
            Stakeholder Map
          </Button>
          <Button variant="primary" size="sm"
            render={<Link href={`/accounts/${account.id}/brief`} />}
            startIcon={<Sparkles className="size-4" />}>
            Pre-Meeting Brief
          </Button>
        </div>

        {/* Name + badges */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{account.name}</h1>
              <Badge color={hs.color}>{hs.label}</Badge>
              <Badge color="secondary">{account.tier}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{account.industry} · {account.hq ?? account.region}</p>

            {/* Metadata chips */}
            <div className="flex flex-wrap gap-2 mt-1">
              {account.website && (
                <a href={`https://${account.website}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="size-3" />{account.website}
                </a>
              )}
              {account.ticker && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  <BarChart2 className="size-3" />{account.ticker}
                </span>
              )}
              {account.founded && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  <Calendar className="size-3" />Est. {account.founded}
                </span>
              )}
              {account.headcount && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  <Building2 className="size-3" />{account.headcount} employees
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-2 flex items-start gap-2 group/desc">
              {description ? (
                <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">Add a note about this account…</p>
              )}
              <button
                onClick={() => { setDescDraft(description); setDescOpen(true); }}
                className="opacity-0 group-hover/desc:opacity-100 transition-opacity mt-0.5 shrink-0"
                aria-label="Edit description"
              >
                <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          </div>

          {/* Account manager */}
          <div className="shrink-0">
            <AssignManager accountId={account.id} defaultManagerId={account.accountManagerId} />
          </div>
        </div>
      </div>

      {/* ── BANNER DIALOG ───────────────────────────────────── */}
      <Dialog open={bannerOpen} onOpenChange={(v) => !v && setBannerOpen(false)}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup className="w-full max-w-md">
              <Dialog.Header>
                <Dialog.Title>Account Banner</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <div className="flex flex-col gap-4">
                  <Input label="Banner Image URL" value={bannerDraft}
                    onChange={(e) => setBannerDraft(e.target.value)}
                    placeholder="https://…/banner.jpg"
                    description="Recommended: 1200×300px, landscape. Paste any public image URL." />
                  {bannerDraft && (
                    <img src={bannerDraft} alt="Preview"
                      className="w-full h-24 object-cover rounded-lg border border-border"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                  {bannerUrl && (
                    <button className="text-xs text-destructive hover:underline text-left"
                      onClick={() => { setBannerUrl(''); setBannerOpen(false); toast.success('Banner removed'); }}>
                      Remove current banner
                    </button>
                  )}
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button appearance="outline" onClick={() => setBannerOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveBanner} startIcon={<Check className="size-4" />}>Save</Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog>

      {/* ── DESCRIPTION DIALOG ──────────────────────────────── */}
      <Dialog open={descOpen} onOpenChange={(v) => !v && setDescOpen(false)}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup className="w-full max-w-md">
              <Dialog.Header>
                <Dialog.Title>Account Note</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <textarea
                  className="w-full min-h-[120px] resize-y rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="Add context about this account — strategic importance, relationship history, key themes…"
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Button appearance="outline" onClick={() => setDescOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveDesc} startIcon={<Check className="size-4" />}>Save</Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog>
    </div>
  );
}
