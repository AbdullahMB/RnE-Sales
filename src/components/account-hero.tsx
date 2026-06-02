'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Dialog, Input } from '@humain-foundation/ui';
import {
  ImagePlus, Pencil, Check, ExternalLink, Map, Sparkles,
  Globe, BarChart2, Building2, Calendar, UserCog, ClipboardList,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AccountAvatar } from '@/components/account-avatar';
import { AssignManager } from '@/components/assign-manager';
import { toast } from '@humain-foundation/ui';
import type { Account } from '@/lib/mock-data';
import { HEALTH_STYLE, type HealthScore } from '@/lib/health';

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

      {/* ── BANNER ──────────────────────────────────────────────────────── */}
      <div className="relative w-full h-40 sm:h-48 overflow-hidden rounded-t-2xl">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="Account banner"
            className="w-full h-full object-cover"
            onError={() => setBannerUrl('')}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}

        {/* Edit cover — always visible, bottom-right */}
        <button
          onClick={() => { setBannerDraft(bannerUrl); setBannerOpen(true); }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-sm hover:bg-black/60 transition-colors border border-white/10"
        >
          <ImagePlus className="size-3.5" />
          {bannerUrl ? 'Change cover' : 'Add cover photo'}
        </button>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div className="px-6 pb-6">

        {/* ROW 1: Logo (overlapping banner) + action buttons */}
        <div className="flex items-end justify-between -mt-8 mb-4">
          {/* Logo — ring creates the "cut-out" effect over the banner */}
          <div className="ring-4 ring-card rounded-2xl bg-card shrink-0">
            <AccountAvatar accountId={account.id} name={account.name} size="xl" editable />
          </div>

          {/* Action buttons aligned to the logo baseline */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button
              appearance="ghost"
              size="sm"
              endIcon={<ExternalLink className="size-4" />}
              onClick={() => toast.info('Opening Salesforce…', { description: 'CRM integration coming soon.' })}
            >
              Salesforce
            </Button>
            <Button
              appearance="outline"
              size="sm"
              render={<Link href={`/accounts/${account.id}/map`} />}
              startIcon={<Map className="size-4" />}
            >
              Stakeholder Map
            </Button>
            <Button
              appearance="outline"
              size="sm"
              render={<Link href={`/accounts/${account.id}/plan`} />}
              startIcon={<ClipboardList className="size-4" />}
            >
              Account Plan
            </Button>
            <Button
              variant="primary"
              size="sm"
              render={<Link href={`/accounts/${account.id}/brief`} />}
              startIcon={<Sparkles className="size-4" />}
            >
              Pre-Meeting Brief
            </Button>
          </div>
        </div>

        {/* ROW 2: Name, badges, industry line */}
        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground leading-tight">{account.name}</h1>
            <Badge color={hs.color}>{hs.label}</Badge>
            <Badge color="secondary">{account.tier}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {account.industry} &middot; {account.hq ?? account.region}
          </p>
        </div>

        {/* ROW 3: Metadata chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {account.website && (
            <a
              href={`https://${account.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="size-3 shrink-0" />
              {account.website}
            </a>
          )}
          {account.ticker && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <BarChart2 className="size-3 shrink-0" />
              {account.ticker}
            </span>
          )}
          {account.founded && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Calendar className="size-3 shrink-0" />
              Est. {account.founded}
            </span>
          )}
          {account.headcount && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <Building2 className="size-3 shrink-0" />
              {account.headcount} employees
            </span>
          )}
        </div>

        {/* ROW 4: Description + Account Manager side-by-side */}
        <div className="flex items-start gap-6">

          {/* Description (editable) */}
          <div className="flex-1 min-w-0 group/desc">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                {description ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic">
                    Add a strategic note about this account…
                  </p>
                )}
              </div>
              <button
                onClick={() => { setDescDraft(description); setDescOpen(true); }}
                className="shrink-0 opacity-0 group-hover/desc:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                aria-label="Edit note"
              >
                <Pencil className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Account Manager — right column, clearly labelled */}
          <div className="shrink-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <UserCog className="size-3.5 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Account Owner
              </p>
            </div>
            <AssignManager accountId={account.id} defaultManagerId={account.accountManagerId} />
          </div>
        </div>
      </div>

      {/* ── BANNER DIALOG ───────────────────────────────────────────────── */}
      <Dialog open={bannerOpen} onOpenChange={(v) => !v && setBannerOpen(false)}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup className="w-full max-w-md">
              <Dialog.Header>
                <Dialog.Title>Account Cover Photo</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Image URL"
                    value={bannerDraft}
                    onChange={(e) => setBannerDraft(e.target.value)}
                    placeholder="https://…/banner.jpg"
                    description="Recommended: 1200 × 300 px, landscape. Paste any public image URL."
                  />
                  {bannerDraft && (
                    <img
                      src={bannerDraft}
                      alt="Preview"
                      className="w-full h-28 object-cover rounded-xl border border-border"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  {bannerUrl && (
                    <button
                      className="text-xs text-destructive hover:underline text-left"
                      onClick={() => { setBannerUrl(''); setBannerOpen(false); toast.success('Cover photo removed'); }}
                    >
                      Remove current cover photo
                    </button>
                  )}
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button appearance="outline" onClick={() => setBannerOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveBanner} startIcon={<Check className="size-4" />}>
                  Save
                </Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog>

      {/* ── NOTE DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={descOpen} onOpenChange={(v) => !v && setDescOpen(false)}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup className="w-full max-w-md">
              <Dialog.Header>
                <Dialog.Title>Strategic Account Note</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <textarea
                  className="w-full min-h-[140px] resize-y rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="Strategic importance, relationship history, key themes, competitive context…"
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                />
              </Dialog.Body>
              <Dialog.Footer>
                <Button appearance="outline" onClick={() => setDescOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSaveDesc} startIcon={<Check className="size-4" />}>
                  Save
                </Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog>
    </div>
  );
}
