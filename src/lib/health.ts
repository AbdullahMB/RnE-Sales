import type { Account, Deal, Stakeholder, Signal } from './mock-data';

export type HealthStatus = 'healthy' | 'at-risk' | 'critical';

export interface HealthScore {
  status: HealthStatus;
  score: number; // 0–100, higher = healthier
  reasons: string[];
}

export function computeAccountHealth(
  account: Account,
  deals: Deal[],
  stakeholders: Stakeholder[],
  signals: Signal[],
): HealthScore {
  const reasons: string[] = [];
  let score = 100;

  // ── Deal activity ────────────────────────────────────────────
  const maxIdle = Math.max(...deals.map((d) => d.daysSinceActivity), 0);
  if (maxIdle > 21) { score -= 30; reasons.push(`No activity for ${maxIdle} days`); }
  else if (maxIdle > 14) { score -= 15; reasons.push(`${maxIdle} days since last activity`); }

  // ── High-risk deals ──────────────────────────────────────────
  const highRisk = deals.filter((d) => d.risk === 'high').length;
  if (highRisk > 0) { score -= 20 * highRisk; reasons.push(`${highRisk} high-risk deal${highRisk > 1 ? 's' : ''}`); }

  // ── Stakeholder coverage ────────────────────────────────────
  const hasChampion = stakeholders.some((s) => s.role === 'Champion' && s.strength >= 3);
  const hasEconomicBuyer = stakeholders.some((s) => s.role === 'Decision Maker' && s.strength >= 2);
  if (!hasChampion) { score -= 20; reasons.push('No strong Champion'); }
  if (!hasEconomicBuyer) { score -= 20; reasons.push('No engaged Economic Buyer'); }

  // ── Open signals (leadership/competitive = attention needed) ─
  const urgentSignals = signals.filter((s) => s.type === 'leadership' || s.type === 'funding').length;
  if (urgentSignals > 0) { score -= 5 * urgentSignals; reasons.push(`${urgentSignals} signal${urgentSignals > 1 ? 's' : ''} need attention`); }

  score = Math.max(0, score);

  const status: HealthStatus =
    score >= 70 ? 'healthy' : score >= 40 ? 'at-risk' : 'critical';

  if (reasons.length === 0) reasons.push('All good — keep the momentum');

  return { status, score, reasons };
}

export const HEALTH_STYLE: Record<HealthStatus, { color: 'success' | 'warning' | 'destructive'; label: string; dot: string }> = {
  healthy:  { color: 'success',     label: 'Healthy',  dot: 'bg-success' },
  'at-risk': { color: 'warning',    label: 'At Risk',  dot: 'bg-warning' },
  critical: { color: 'destructive', label: 'Critical', dot: 'bg-destructive' },
};
