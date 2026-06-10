'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Avatar,
  Button,
  Dialog,
} from '@humain-foundation/ui';
import { toast } from '@humain-foundation/ui';
import {
  Zap, Pickaxe, Factory, Droplets,
  TrendingUp, Trophy, Target, Check,
  ChevronRight, UserCog, Users, Briefcase,
} from 'lucide-react';
import { MOCK_DEALS, MOCK_TEAM, type Deal, type TeamMember } from '@/lib/mock-data';
import { useLocalStorage } from '@/hooks/use-local-storage';

// ─── Sub sector config ────────────────────────────────────────────────────────

const BRAND_STYLE = {
  bg:     'bg-brand-500/10',
  text:   'text-brand-600 dark:text-brand-400',
  border: 'border-l-brand-500',
  ring:   'ring-brand-500/15',
} as const;

const SUB_SECTORS = [
  { key: 'Energy',                   icon: <Zap className="size-5" />,     ...BRAND_STYLE },
  { key: 'Mining',                   icon: <Pickaxe className="size-5" />, ...BRAND_STYLE },
  { key: 'Industrial Manufacturing', icon: <Factory className="size-5" />, ...BRAND_STYLE },
  { key: 'Utilities & Services',     icon: <Droplets className="size-5" />,...BRAND_STYLE },
] as const;

type SubSectorKey = (typeof SUB_SECTORS)[number]['key'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLOSED = new Set<Deal['stage']>(['Won', 'Lost', 'Dropped']);

function fmtAcv(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

const STAGE_COLOR: Record<Deal['stage'], string> = {
  'Qualification':    'bg-muted-foreground/30',
  'Develop Proposal': 'bg-blue-400',
  'Submit Proposal':  'bg-brand-400',
  'Negotiate':        'bg-amber-400',
  'Won':              'bg-success',
  'Lost':             'bg-destructive',
  'Dropped':          'bg-muted-foreground',
};

// ─── Lead picker dialog ───────────────────────────────────────────────────────

function LeadPickerDialog({
  open,
  currentId,
  onClose,
  onSelect,
}: {
  open: boolean;
  currentId: string;
  onClose: () => void;
  onSelect: (m: TeamMember) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup className="w-full max-w-md">
            <Dialog.Header>
              <Dialog.Title>Assign Sub Sector Lead</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <div className="flex flex-col gap-2">
                {MOCK_TEAM.map((member) => {
                  const sel = member.id === currentId;
                  return (
                    <button
                      key={member.id}
                      onClick={() => onSelect(member)}
                      className={[
                        'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                        'hover:border-brand-500/40 hover:bg-accent',
                        sel ? 'border-brand-500/50 bg-brand-500/5' : 'border-border bg-card',
                      ].join(' ')}
                    >
                      <Avatar fallback={member.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.title}</p>
                      </div>
                      {sel && <Check className="size-4 text-brand-500 shrink-0" />}
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

// ─── Sub sector card ──────────────────────────────────────────────────────────

function SubSectorCard({ cfg }: { cfg: (typeof SUB_SECTORS)[number] }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [leadId, setLeadId] = useLocalStorage<string>(
    `subsector-lead:${cfg.key}`,
    '',
  );

  const lead = MOCK_TEAM.find((m) => m.id === leadId);

  const deals = MOCK_DEALS.filter((d) => d.subSector === cfg.key);
  const open  = deals.filter((d) => !CLOSED.has(d.stage));
  const won   = deals.filter((d) => d.stage === 'Won');

  const openAcv = open.reduce((s, d) => s + d.acv, 0);
  const wonAcv  = won.reduce((s, d) => s + d.acv, 0);
  const wghtd   = open.reduce((s, d) => s + d.acv * (d.probability / 100), 0);
  const avgProb = open.length
    ? Math.round(open.reduce((s, d) => s + d.probability, 0) / open.length)
    : 0;

  // Stage breakdown
  const stageMap = new Map<string, { count: number; acv: number }>();
  for (const d of deals) {
    const cur = stageMap.get(d.stage) ?? { count: 0, acv: 0 };
    stageMap.set(d.stage, { count: cur.count + 1, acv: cur.acv + d.acv });
  }

  return (
    <>
      <div
        className={[
          'flex flex-col gap-5 rounded-2xl border border-l-4 bg-card p-5',
          'ring-1',
          cfg.border,
          cfg.ring,
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className={['size-10 rounded-xl flex items-center justify-center', cfg.bg, cfg.text].join(' ')}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground">{cfg.key}</p>
            <p className="text-xs text-muted-foreground">{deals.length} deal{deals.length !== 1 ? 's' : ''} · {open.length} active</p>
          </div>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <TrendingUp className="size-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Open Pipeline</span>
            </div>
            <p className="text-lg font-bold text-foreground">{fmtAcv(openAcv)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Wtd: {fmtAcv(wghtd)}</p>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-success mb-1">
              <Trophy className="size-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Won</span>
            </div>
            <p className="text-lg font-bold text-foreground">{fmtAcv(wonAcv)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{won.length} deal{won.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-brand-500 mb-1">
              <Target className="size-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Avg Probability</span>
            </div>
            <p className="text-lg font-bold text-foreground">{avgProb}%</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{open.length} open deals</p>
          </div>
          <div className="rounded-xl bg-muted/50 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
              <Briefcase className="size-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Total Deals</span>
            </div>
            <p className="text-lg font-bold text-foreground">{deals.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{won.length} won · {open.length} active</p>
          </div>
        </div>

        {/* ── Stage breakdown ── */}
        {deals.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Stage Breakdown</p>
            {Array.from(stageMap.entries()).map(([stage, { count, acv }]) => (
              <div key={stage} className="flex items-center gap-2">
                <span className={['size-1.5 rounded-full shrink-0', STAGE_COLOR[stage as Deal['stage']] ?? 'bg-muted'].join(' ')} />
                <span className="text-xs text-muted-foreground flex-1 truncate">{stage}</span>
                <span className="text-xs font-semibold text-foreground">{fmtAcv(acv)}</span>
                <Badge color="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* ── Divider ── */}
        <div className="h-px bg-border" />

        {/* ── Lead ── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Users className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Sub Sector Lead</span>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 hover:bg-accent hover:border-brand-500/40 transition-all group"
          >
            <Avatar fallback={lead?.name ?? '?'} size="xs" />
            <span className="text-xs font-semibold text-foreground">
              {lead ? lead.name : <span className="text-muted-foreground italic">Assign lead</span>}
            </span>
            <UserCog className="size-3 text-muted-foreground group-hover:text-brand-500 transition-colors" />
          </button>
        </div>

        {/* ── Deal list ── */}
        {open.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Active Deals</p>
            {open.map((d) => (
              <Link
                key={d.id}
                href={`/accounts/${d.accountId}`}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 hover:bg-accent transition-colors group"
              >
                <span className={['size-1.5 rounded-full shrink-0', STAGE_COLOR[d.stage] ?? 'bg-muted'].join(' ')} />
                <span className="text-xs text-foreground flex-1 truncate">{d.title}</span>
                <span className="text-xs font-bold text-foreground">{fmtAcv(d.acv)}</span>
                <ChevronRight className="size-3 text-muted-foreground/40 group-hover:text-brand-500 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <LeadPickerDialog
        open={pickerOpen}
        currentId={leadId}
        onClose={() => setPickerOpen(false)}
        onSelect={(m) => {
          setLeadId(m.id);
          setPickerOpen(false);
          toast.success('Sub sector lead assigned', { description: `${m.name} → ${cfg.key}` });
        }}
      />
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubSectorsPage() {
  const allDeals   = MOCK_DEALS;
  const totalOpen  = allDeals.filter((d) => !CLOSED.has(d.stage)).reduce((s, d) => s + d.acv, 0);
  const totalWon   = allDeals.filter((d) => d.stage === 'Won').reduce((s, d) => s + d.acv, 0);

  return (
    <AppShellCard className="page-enter">
      <AppShellCard.Header>
        <div>
          <AppShellCard.Title>Sub Sector Overview</AppShellCard.Title>
          <AppShellCard.Subtitle>
            Pipeline breakdown by sector — {fmtAcv(totalOpen)} open · {fmtAcv(totalWon)} won
          </AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {SUB_SECTORS.map((cfg) => {
          const open = MOCK_DEALS.filter((d) => d.subSector === cfg.key && !CLOSED.has(d.stage));
          const acv  = open.reduce((s, d) => s + d.acv, 0);
          return (
            <div key={cfg.key} className={['rounded-xl border px-4 py-3 flex items-center gap-3', cfg.bg].join(' ')}>
              <div className={cfg.text}>{cfg.icon}</div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-muted-foreground truncate">{cfg.key}</p>
                <p className={['text-base font-bold', cfg.text].join(' ')}>{fmtAcv(acv)}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {SUB_SECTORS.map((cfg) => (
          <SubSectorCard key={cfg.key} cfg={cfg} />
        ))}
      </div>
    </AppShellCard>
  );
}
