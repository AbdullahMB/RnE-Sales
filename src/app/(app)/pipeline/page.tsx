'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppShellCard, Badge, Button, Avatar } from '@humain-foundation/ui';
import { AlertTriangle, TrendingDown, Minus, Clock, DollarSign } from 'lucide-react';
import { MOCK_DEALS, type Deal, type DealStage } from '@/lib/mock-data';
import { AccountAvatar } from '@/components/account-avatar';
import { toast } from '@humain-foundation/ui';

const STAGES: DealStage[] = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5'];

const STAGE_LABEL: Record<DealStage, string> = {
  'Stage 1': 'Prospect',
  'Stage 2': 'Qualify',
  'Stage 3': 'Develop',
  'Stage 4': 'Propose',
  'Stage 5': 'Close',
};

type BadgeColor = 'destructive' | 'warning' | 'success';

const RISK_COLOR: Record<Deal['risk'], BadgeColor> = {
  high: 'destructive',
  medium: 'warning',
  low: 'success',
};

function DealCard({ deal, onMoveLeft, onMoveRight, isFirst, isLast }: {
  deal: Deal;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const isStalled = deal.daysSinceActivity > 14;

  return (
    <div className={`flex flex-col gap-2.5 rounded-xl border bg-card p-3.5 shadow-sm hover:shadow-md transition-shadow ${
      isStalled ? 'border-warning/40 bg-warning/5' : 'border-border'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <AccountAvatar accountId={deal.accountId} name={deal.accountName} size="xs" />
          <p className="text-sm font-semibold text-foreground truncate">{deal.accountName}</p>
        </div>
        <Badge color={RISK_COLOR[deal.risk]} className="shrink-0">{deal.risk}</Badge>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <DollarSign className="size-3 shrink-0" />
        <span className="font-semibold text-foreground">${(deal.acv / 1000).toFixed(0)}K ACV</span>
        <span>·</span>
        <span>Close {deal.closeDate}</span>
      </div>

      {isStalled && (
        <div className="flex items-center gap-1.5 text-xs text-warning">
          <Clock className="size-3 shrink-0" />
          {deal.daysSinceActivity} days idle
        </div>
      )}

      <div className="flex items-center gap-1 mt-1">
        <Button size="sm" appearance="ghost" className="flex-1 text-xs h-7"
          disabled={isFirst}
          onClick={onMoveLeft}>
          ← Back
        </Button>
        <Link href={`/accounts/${deal.accountId}`}
          className="flex-1 text-center text-xs text-brand-500 hover:underline py-1">
          View
        </Link>
        <Button size="sm" appearance="ghost" className="flex-1 text-xs h-7"
          disabled={isLast}
          onClick={onMoveRight}>
          Advance →
        </Button>
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);

  const totalAcv = deals.reduce((s, d) => s + d.acv, 0);
  const weightedAcv = deals.reduce((s, d) => {
    const w = { 'Stage 1': 0.1, 'Stage 2': 0.2, 'Stage 3': 0.4, 'Stage 4': 0.7, 'Stage 5': 0.9 }[d.stage];
    return s + d.acv * w;
  }, 0);

  function moveDeal(dealId: string, direction: -1 | 1) {
    setDeals((prev) => prev.map((d) => {
      if (d.id !== dealId) return d;
      const idx = STAGES.indexOf(d.stage);
      const next = STAGES[idx + direction];
      if (!next) return d;
      toast.success(`${d.accountName} moved to ${STAGE_LABEL[next]}`, {
        description: `Stage ${idx + 1 + direction} · $${(d.acv / 1000).toFixed(0)}K ACV`,
      });
      return { ...d, stage: next };
    }));
  }

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <AppShellCard.Title>Pipeline</AppShellCard.Title>
          <AppShellCard.Subtitle>
            {deals.length} deals · ${(totalAcv / 1_000_000).toFixed(1)}M total · ${(weightedAcv / 1_000_000).toFixed(1)}M weighted
          </AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>

      {/* Stage columns */}
      <div className="grid grid-cols-5 gap-3 min-h-[480px]">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const stageAcv = stageDeals.reduce((s, d) => s + d.acv, 0);
          const stageIdx = STAGES.indexOf(stage);

          return (
            <div key={stage} className="flex flex-col gap-2">
              {/* Column header */}
              <div className="rounded-lg bg-muted/60 px-3 py-2.5 border border-border">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-bold text-foreground">{STAGE_LABEL[stage]}</p>
                  {stageDeals.length > 0 && (
                    <span className="text-xs font-semibold text-brand-500">{stageDeals.length}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stageAcv > 0 ? `$${(stageAcv / 1000).toFixed(0)}K` : 'Empty'}
                </p>
              </div>

              {/* Deal cards */}
              <div className="flex flex-col gap-2 flex-1">
                {stageDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isFirst={stageIdx === 0}
                    isLast={stageIdx === STAGES.length - 1}
                    onMoveLeft={() => moveDeal(deal.id, -1)}
                    onMoveRight={() => moveDeal(deal.id, 1)}
                  />
                ))}
                {stageDeals.length === 0 && (
                  <div className="flex-1 rounded-xl border border-dashed border-border flex items-center justify-center min-h-[80px]">
                    <p className="text-xs text-muted-foreground">No deals</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weighted pipeline bar */}
      <div className="mt-4 rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Weighted Pipeline</p>
          <p className="text-sm font-bold text-brand-500">${(weightedAcv / 1_000_000).toFixed(2)}M</p>
        </div>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
          {STAGES.map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            const stageAcv = stageDeals.reduce((s, d) => s + d.acv, 0);
            const pct = totalAcv > 0 ? (stageAcv / totalAcv) * 100 : 0;
            const colors = ['bg-muted-foreground/30', 'bg-brand-500/40', 'bg-brand-500/60', 'bg-brand-500/80', 'bg-brand-500'];
            return pct > 0 ? (
              <div key={stage} className={`${colors[STAGES.indexOf(stage)]} rounded-sm transition-all`}
                style={{ width: `${pct}%` }}
                title={`${STAGE_LABEL[stage]}: $${(stageAcv / 1000).toFixed(0)}K`} />
            ) : null;
          })}
        </div>
        <div className="flex items-center justify-between mt-2">
          {STAGES.map((stage, i) => (
            <p key={stage} className="text-xs text-muted-foreground">{STAGE_LABEL[stage]}</p>
          ))}
        </div>
      </div>
    </AppShellCard>
  );
}
