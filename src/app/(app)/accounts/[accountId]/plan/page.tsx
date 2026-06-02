'use client';

import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  AppShellCard,
  Badge,
  Button,
  Input,
  toast,
} from '@humain-foundation/ui';
import {
  ArrowLeft,
  Target,
  TrendingUp,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  LayoutGrid,
  Calendar,
  ShieldAlert,
  Save,
} from 'lucide-react';
import { MOCK_ACCOUNTS, MOCK_DEALS, type DealStage } from '@/lib/mock-data';
import { useLocalStorage } from '@/hooks/use-local-storage';

// ─── Types ────────────────────────────────────────────────────────────────────

type WhitespaceState = 'active' | 'whitespace' | 'na';

interface Milestone {
  id: string;
  quarter: string;
  text: string;
  done: boolean;
}

interface Risk {
  id: string;
  risk: string;
  impact: 'High' | 'Med' | 'Low';
  mitigation: string;
  status: 'Open' | 'Mitigated';
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  'Core Platform',
  'AI/ML Services',
  'Data Sovereignty',
  'Edge Computing',
  'Managed Services',
  'Security & Compliance',
  'Analytics & BI',
  'Professional Services',
] as const;

const QUARTERS = ['Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027'] as const;

const STAGE_COLOR: Record<DealStage, string> = {
  'Stage 1': 'secondary',
  'Stage 2': 'secondary',
  'Stage 3': 'warning',
  'Stage 4': 'primary',
  'Stage 5': 'success',
};

// ─── Default milestones based on deal stage ───────────────────────────────────

function defaultMilestones(accountId: string, stage: DealStage | undefined): Milestone[] {
  const base: Omit<Milestone, 'id'>[] = [];

  if (!stage || stage === 'Stage 1') {
    base.push(
      { quarter: 'Q2 2026', text: 'Complete discovery & qualify pain points', done: false },
      { quarter: 'Q2 2026', text: 'Identify economic buyer and champion', done: false },
      { quarter: 'Q3 2026', text: 'Deliver technical proof of concept', done: false },
    );
  } else if (stage === 'Stage 2') {
    base.push(
      { quarter: 'Q2 2026', text: 'Complete technical evaluation', done: false },
      { quarter: 'Q2 2026', text: 'Secure champion sponsorship', done: false },
      { quarter: 'Q3 2026', text: 'Submit commercial proposal', done: false },
    );
  } else if (stage === 'Stage 3') {
    base.push(
      { quarter: 'Q2 2026', text: 'Deliver business case to economic buyer', done: false },
      { quarter: 'Q2 2026', text: 'Conduct CFO / executive briefing', done: false },
      { quarter: 'Q3 2026', text: 'Navigate legal & procurement review', done: false },
    );
  } else if (stage === 'Stage 4') {
    base.push(
      { quarter: 'Q2 2026', text: 'Resolve all commercial objections', done: false },
      { quarter: 'Q2 2026', text: 'Secure verbal commitment from decision maker', done: false },
      { quarter: 'Q3 2026', text: 'Close deal and initiate onboarding', done: false },
    );
  } else {
    base.push(
      { quarter: 'Q2 2026', text: 'Execute contract and kick off implementation', done: false },
      { quarter: 'Q3 2026', text: 'Complete phase-1 deployment', done: false },
      { quarter: 'Q4 2026', text: 'Expand platform adoption — new business unit', done: false },
    );
  }

  return base.map((m, i) => ({ ...m, id: `${accountId}-m${i}` }));
}

// ─── Default risks based on account ───────────────────────────────────────────

function defaultRisks(accountId: string): Risk[] {
  return [
    {
      id: `${accountId}-r0`,
      risk: 'Economic buyer not yet engaged — deal may stall at approval stage',
      impact: 'High',
      mitigation: 'Work with champion to schedule executive briefing within 30 days',
      status: 'Open',
    },
    {
      id: `${accountId}-r1`,
      risk: 'Competitor evaluation in parallel — risk of displacement',
      impact: 'Med',
      mitigation: 'Accelerate differentiation narrative; share reference architecture and case studies',
      status: 'Open',
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAcv(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function parseTarget(val: string): number {
  const clean = val.replace(/[$,MKmk]/g, '').trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (/[Mm]/.test(val)) return num * 1_000_000;
  if (/[Kk]/.test(val)) return num * 1_000;
  return num;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SectionHeader({ icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-brand-500">{icon}</span>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AccountPlanPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = use(params);

  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId) ?? MOCK_ACCOUNTS[0];
  const deals = MOCK_DEALS.filter((d) => d.accountId === account.id);
  const primaryDeal = deals[0];
  const pipelineAcv = deals.reduce((sum, d) => sum + d.acv, 0);

  // ── localStorage state ──────────────────────────────────────────────────────

  const [objective, setObjective] = useLocalStorage<string>(`plan:obj:${accountId}`, '');
  const [targetRaw, setTargetRaw] = useLocalStorage<string>(
    `plan:target:${accountId}`,
    formatAcv(account.totalAcv),
  );
  const [whitespace, setWhitespace] = useLocalStorage<Record<string, WhitespaceState>>(
    `plan:whitespace:${accountId}`,
    {},
  );
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>(
    `plan:milestones:${accountId}`,
    defaultMilestones(accountId, primaryDeal?.stage),
  );
  const [risks, setRisks] = useLocalStorage<Risk[]>(
    `plan:risks:${accountId}`,
    defaultRisks(accountId),
  );

  // ── Local ephemeral state ────────────────────────────────────────────────────

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState<Record<string, string>>({});

  // ── Derived ──────────────────────────────────────────────────────────────────

  const targetAcv = parseTarget(targetRaw);
  const coverageRatio = targetAcv > 0 ? pipelineAcv / targetAcv : 0;
  const progressPct = Math.min(coverageRatio * 100, 100);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleObjectiveBlur = useCallback(() => {
    setLastSaved(new Date());
    toast.success('Strategic objective saved');
  }, []);

  const getWhitespaceState = (cap: string): WhitespaceState =>
    whitespace[cap] ?? 'whitespace';

  const cycleWhitespace = (cap: string) => {
    const current = getWhitespaceState(cap);
    const next: WhitespaceState = current === 'active' ? 'whitespace' : current === 'whitespace' ? 'na' : 'active';
    setWhitespace((prev) => ({ ...prev, [cap]: next }));
  };

  const toggleMilestone = (id: string) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  };

  const addMilestone = (quarter: string) => {
    const text = newMilestoneText[quarter]?.trim();
    if (!text) return;
    const newM: Milestone = {
      id: `${accountId}-m${Date.now()}`,
      quarter,
      text,
      done: false,
    };
    setMilestones((prev) => [...prev, newM]);
    setNewMilestoneText((prev) => ({ ...prev, [quarter]: '' }));
  };

  const removeMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const addRisk = () => {
    const newRisk: Risk = {
      id: `${accountId}-r${Date.now()}`,
      risk: '',
      impact: 'Med',
      mitigation: '',
      status: 'Open',
    };
    setRisks((prev) => [...prev, newRisk]);
  };

  const updateRisk = (id: string, field: keyof Risk, value: string) => {
    setRisks((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRisk = (id: string) => {
    setRisks((prev) => prev.filter((r) => r.id !== id));
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <div>
          <AppShellCard.Title>Account Plan — {account.name}</AppShellCard.Title>
          <AppShellCard.Subtitle>
            Strategic one-pager · {account.industry} · {account.tier}
          </AppShellCard.Subtitle>
        </div>
      </AppShellCard.Header>
      <AppShellCard.Actions>
        <Button
          appearance="ghost"
          size="sm"
          render={<Link href={`/accounts/${accountId}`} />}
          startIcon={<ArrowLeft className="size-4" />}
        >
          Back to Account 360
        </Button>
        {lastSaved && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Save className="size-3.5" />
            Last saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </AppShellCard.Actions>

      <div className="flex flex-col gap-10">

        {/* ── SECTION 1: Strategic Objective ──────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Target className="size-4" />}
            title="Strategic Objective"
            subtitle="Vision, partnership depth, and 3-year horizon for this account"
          />
          <textarea
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 min-h-[120px]"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            onBlur={handleObjectiveBlur}
            placeholder="Define the strategic objective for this account — vision, partnership depth, 3-year horizon…"
          />
        </section>

        {/* ── SECTION 2: Revenue Plan ──────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<TrendingUp className="size-4" />}
            title="Revenue Plan"
            subtitle="FY target vs. open pipeline"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Left: Revenue Targets */}
            <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-col gap-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revenue Targets</p>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">FY Target</label>
                <Input
                  value={targetRaw}
                  onChange={(e) => setTargetRaw(e.target.value)}
                  placeholder="e.g. $1.2M"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">Pipeline vs Target</span>
                  <span className="text-xs font-semibold text-foreground">{formatAcv(pipelineAcv)} / {formatAcv(targetAcv)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progressPct >= 100 ? 'bg-success' : progressPct >= 70 ? 'bg-brand-500' : progressPct >= 40 ? 'bg-warning' : 'bg-destructive'}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Pipeline Coverage</span>
                <Badge color={coverageRatio >= 1 ? 'success' : coverageRatio >= 0.7 ? 'primary' : coverageRatio >= 0.4 ? 'warning' : 'destructive'}>
                  {coverageRatio.toFixed(1)}x
                </Badge>
              </div>
            </div>

            {/* Right: Deal snapshot */}
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Open Deals</p>
              {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open deals for this account.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {deals.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{d.accountName}</p>
                        <p className="text-xs text-muted-foreground">Close {d.closeDate}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge color={STAGE_COLOR[d.stage] as 'secondary' | 'warning' | 'primary' | 'success'}>{d.stage}</Badge>
                        <span className="text-sm font-semibold text-foreground">{formatAcv(d.acv)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── SECTION 3: Whitespace Map ────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<LayoutGrid className="size-4" />}
            title="Whitespace Map"
            subtitle="Click to cycle: Whitespace → Active → Not Applicable"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CAPABILITIES.map((cap) => {
              const state = getWhitespaceState(cap);
              const bgClass =
                state === 'active'
                  ? 'bg-success/10 border-success/40'
                  : state === 'whitespace'
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-muted/40 border-border opacity-60';
              return (
                <button
                  key={cap}
                  onClick={() => cycleWhitespace(cap)}
                  className={`rounded-xl border px-4 py-3 text-left transition-all hover:opacity-90 cursor-pointer ${bgClass}`}
                >
                  <p className="text-xs font-semibold text-foreground mb-1.5">{cap}</p>
                  <div className="flex items-center gap-1.5">
                    {state === 'active' && <Badge color="success">Active</Badge>}
                    {state === 'whitespace' && <Badge color="warning">Whitespace</Badge>}
                    {state === 'na' && <Badge color="secondary">N/A</Badge>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 4: Quarterly Milestones ─────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Calendar className="size-4" />}
            title="Quarterly Milestones"
            subtitle="Track key actions and commitments per quarter"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUARTERS.map((q) => {
              const qMilestones = milestones.filter((m) => m.quarter === q);
              return (
                <div key={q} className="rounded-xl border border-border bg-card px-4 py-4 flex flex-col gap-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">{q}</p>

                  <div className="flex flex-col gap-2">
                    {qMilestones.map((m) => (
                      <div key={m.id} className="flex items-start gap-2 group">
                        <button
                          onClick={() => toggleMilestone(m.id)}
                          className="mt-0.5 shrink-0 text-muted-foreground hover:text-brand-500 transition-colors"
                        >
                          {m.done
                            ? <CheckSquare className="size-4 text-success" />
                            : <Square className="size-4" />
                          }
                        </button>
                        <p className={`text-xs flex-1 leading-relaxed ${m.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {m.text}
                        </p>
                        <button
                          onClick={() => removeMilestone(m.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <input
                      type="text"
                      className="flex-1 min-w-0 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-500/40"
                      placeholder="Add milestone…"
                      value={newMilestoneText[q] ?? ''}
                      onChange={(e) => setNewMilestoneText((prev) => ({ ...prev, [q]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') addMilestone(q); }}
                    />
                    <button
                      onClick={() => addMilestone(q)}
                      className="shrink-0 rounded-md bg-brand-500/10 p-1 text-brand-500 hover:bg-brand-500/20 transition-colors"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 5: Risk Register ─────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <SectionHeader
              icon={<ShieldAlert className="size-4" />}
              title="Risk Register"
              subtitle="Track risks, impact, mitigation and status"
            />
            <Button
              appearance="outline"
              size="sm"
              startIcon={<Plus className="size-4" />}
              onClick={addRisk}
            >
              Add Risk
            </Button>
          </div>

          {risks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No risks logged. Add one above.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[30%]">Risk</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[10%]">Impact</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[35%]">Mitigation</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[15%]">Status</th>
                    <th className="px-4 py-2.5 w-[5%]" />
                  </tr>
                </thead>
                <tbody>
                  {risks.map((r, i) => (
                    <tr key={r.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-background'}`}>
                      <td className="px-4 py-2.5">
                        <input
                          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                          value={r.risk}
                          onChange={(e) => updateRisk(r.id, 'risk', e.target.value)}
                          placeholder="Describe the risk…"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          className="bg-transparent text-xs font-medium focus:outline-none text-foreground"
                          value={r.impact}
                          onChange={(e) => updateRisk(r.id, 'impact', e.target.value as Risk['impact'])}
                        >
                          <option value="High">High</option>
                          <option value="Med">Med</option>
                          <option value="Low">Low</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                          value={r.mitigation}
                          onChange={(e) => updateRisk(r.id, 'mitigation', e.target.value)}
                          placeholder="Mitigation plan…"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          className="bg-transparent text-xs font-medium focus:outline-none text-foreground"
                          value={r.status}
                          onChange={(e) => updateRisk(r.id, 'status', e.target.value as Risk['status'])}
                        >
                          <option value="Open">Open</option>
                          <option value="Mitigated">Mitigated</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => removeRisk(r.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Impact legend */}
          <div className="flex items-center gap-3 mt-3">
            <AlertTriangle className="size-3.5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Badge color="destructive">High</Badge>
              <Badge color="warning">Med</Badge>
              <Badge color="secondary">Low</Badge>
              <Badge color="success">Mitigated</Badge>
            </div>
          </div>
        </section>

      </div>
    </AppShellCard>
  );
}
