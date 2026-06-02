import type { Account, Stakeholder, Signal, Product, Department } from './mock-data';
import { PRODUCT_DEPT_FIT } from './mock-data';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CoverageState =
  | 'whitespace'      // opportunity exists, not yet engaged
  | 'active'          // product live in this department
  | 'in_evaluation'   // active deal / POC in progress
  | 'identified'      // rep has flagged it, no formal deal yet
  | 'not_applicable'  // product doesn't apply here
  | 'disqualified';   // explicitly ruled out

export interface WhitespaceOpportunity {
  product: Product;
  department: Department;
  fitScore: number;
  potentialAcv: number;
  reasons: string[];
}

export interface BlindSpot {
  department: Department;
  topProduct: Product;
  fitScore: number;
}

// ─── Coverage cell cycling ────────────────────────────────────────────────────

const CYCLE_ORDER: CoverageState[] = [
  'whitespace', 'identified', 'in_evaluation', 'active', 'not_applicable',
];

export function nextCoverageState(current: CoverageState): CoverageState {
  const idx = CYCLE_ORDER.indexOf(current);
  return CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
}

// ─── Industry fit multipliers per product ────────────────────────────────────

const INDUSTRY_MULTIPLIERS: Record<string, Partial<Record<string, number>>> = {
  'Energy':        { p3: 1.0, p4: 1.0, p6: 1.0, p5: 0.95, p1: 0.9, p2: 0.8  },
  'Oil':           { p3: 1.0, p4: 1.0, p6: 1.0, p5: 0.95, p1: 0.9            },
  'Petrochemical': { p3: 1.0, p4: 1.0, p6: 1.0, p5: 0.90, p7: 0.8            },
  'Telecom':       { p1: 1.0, p2: 1.0, p7: 1.0, p4: 0.85, p6: 0.9            },
  'Smart City':    { p2: 1.0, p7: 1.0, p4: 1.0, p6: 0.9,  p8: 1.0, p1: 0.85 },
  'Infrastructure':{ p4: 1.0, p1: 1.0, p6: 0.9, p2: 0.85                     },
  'Digital':       { p1: 1.0, p2: 1.0, p7: 1.0, p8: 1.0,  p3: 0.9            },
};

const TIER_MULTIPLIER: Record<string, number> = {
  'Strategic':  1.2,
  'Enterprise': 1.0,
  'Mid-Market': 0.7,
};

// ─── Fit score (0–100) ───────────────────────────────────────────────────────

export function computeFitScore(
  account: Account,
  product: Product,
  department: Department,
  stakeholders: Stakeholder[],
  signals: Signal[],
): number {
  const baseFit = PRODUCT_DEPT_FIT[product.id]?.[department.id] ?? 0;
  if (baseFit === 0) return 0;

  let score = baseFit * 20; // 0–100

  // Industry multiplier — check each keyword in the account industry string
  const industryKey = Object.keys(INDUSTRY_MULTIPLIERS).find((k) =>
    account.industry.toLowerCase().includes(k.toLowerCase())
  );
  const mult = industryKey
    ? (INDUSTRY_MULTIPLIERS[industryKey][product.id] ?? 0.7)
    : 0.7;
  score *= mult;

  // Size boost (headcount)
  const hc = parseInt((account.headcount ?? '0').replace(/[^0-9]/g, ''), 10);
  if (hc > 5000) score *= 1.0;
  else if (hc > 500) score *= 0.9;
  else score *= 0.75;

  // Stakeholder coverage boost
  const deptStakeholders = stakeholders.filter((s) => s.department === department.id);
  if (deptStakeholders.length > 0) score += 12;
  if (deptStakeholders.some((s) => s.role === 'Champion' || s.role === 'Decision Maker')) {
    score += 10;
  }

  // Signal boost — reward signals that indicate budget / expansion intent
  const relevantSignals = signals.filter((s) => {
    if (product.category === 'Security' && (s.type === 'leadership' || s.type === 'news')) return true;
    if (product.category === 'AI/Data'  && s.type === 'product') return true;
    if (product.category === 'Platform' && s.type === 'funding')  return true;
    return false;
  });
  score += relevantSignals.length * 6;

  return Math.round(Math.min(Math.max(score, 0), 100));
}

// ─── Potential ACV ───────────────────────────────────────────────────────────

export function computePotentialAcv(
  account: Account,
  product: Product,
  department: Department,
  fitScore: number,
): number {
  return Math.round(
    product.avgDealSize *
    department.budgetWeight *
    (TIER_MULTIPLIER[account.tier] ?? 1.0) *
    (fitScore / 100)
  );
}

// ─── Blind spots ─────────────────────────────────────────────────────────────
// Departments with ≥1 high-fit product but zero stakeholder engagement

export function computeBlindSpots(
  account: Account,
  departments: Department[],
  products: Product[],
  stakeholders: Stakeholder[],
  signals: Signal[],
  coverage: Record<string, CoverageState>,
): BlindSpot[] {
  const results: BlindSpot[] = [];

  for (const dept of departments) {
    const hasStakeholders = stakeholders.some((s) => s.department === dept.id);
    if (hasStakeholders) continue;

    // Find the highest-fit product for this department that isn't ruled out
    let topProduct: Product | null = null;
    let topScore = 0;

    for (const prod of products) {
      const key = `${prod.id}:${dept.id}`;
      const state = coverage[key];
      if (state === 'not_applicable' || state === 'disqualified' || state === 'active') continue;

      const score = computeFitScore(account, prod, dept, stakeholders, signals);
      if (score > topScore) {
        topScore = score;
        topProduct = prod;
      }
    }

    if (topProduct && topScore >= 55) {
      results.push({ department: dept, topProduct, fitScore: topScore });
    }
  }

  return results.sort((a, b) => b.fitScore - a.fitScore);
}

// ─── Top whitespace opportunities ────────────────────────────────────────────

export function computeTopOpportunities(
  account: Account,
  products: Product[],
  departments: Department[],
  stakeholders: Stakeholder[],
  signals: Signal[],
  coverage: Record<string, CoverageState>,
  limit = 6,
): WhitespaceOpportunity[] {
  const opps: WhitespaceOpportunity[] = [];

  for (const product of products) {
    for (const dept of departments) {
      const key = `${product.id}:${dept.id}`;
      const state = coverage[key] ?? (computeFitScore(account, product, dept, stakeholders, signals) < 30 ? 'not_applicable' : 'whitespace');

      if (!['whitespace', 'identified'].includes(state)) continue;

      const fitScore = computeFitScore(account, product, dept, stakeholders, signals);
      if (fitScore < 45) continue;

      const potentialAcv = computePotentialAcv(account, product, dept, fitScore);
      const reasons: string[] = [];

      if (fitScore >= 80) reasons.push(`${fitScore}% fit score`);
      else reasons.push(`${fitScore}% fit score`);

      const deptStaks = stakeholders.filter((s) => s.department === dept.id);
      if (deptStaks.length === 0) reasons.push('No current engagement — first-mover advantage');
      else reasons.push(`${deptStaks.length} stakeholder${deptStaks.length > 1 ? 's' : ''} mapped`);

      const hasSignal = signals.some((s) =>
        (product.category === 'AI/Data' && s.type === 'product') ||
        (product.category === 'Platform' && s.type === 'funding')
      );
      if (hasSignal) reasons.push('Active signal detected');

      opps.push({ product, department: dept, fitScore, potentialAcv, reasons });
    }
  }

  // Sort by a composite priority: fitScore weighted by potential ACV
  return opps
    .sort((a, b) => (b.fitScore * 0.6 + (b.potentialAcv / 100000) * 0.4) - (a.fitScore * 0.6 + (a.potentialAcv / 100000) * 0.4))
    .slice(0, limit);
}

// ─── Cell display helpers ─────────────────────────────────────────────────────

export const COVERAGE_STYLE: Record<CoverageState, { bg: string; border: string; label: string; short: string }> = {
  active:         { bg: 'bg-success/15',          border: 'border-success/40',         label: 'Active',        short: 'ACT' },
  in_evaluation:  { bg: 'bg-brand-500/15',         border: 'border-brand-500/40',       label: 'In Evaluation', short: 'EVAL' },
  identified:     { bg: 'bg-indigo-500/15',        border: 'border-indigo-500/40',      label: 'Identified',    short: 'ID' },
  whitespace:     { bg: 'bg-amber-500/10',         border: 'border-amber-400/40',       label: 'Whitespace',    short: 'WS' },
  not_applicable: { bg: 'bg-muted/20',             border: 'border-border/50',          label: 'N/A',           short: 'N/A' },
  disqualified:   { bg: 'bg-destructive/10',       border: 'border-destructive/30',     label: 'Disqualified',  short: 'DQ' },
};

export function formatAcv(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}
