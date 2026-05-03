'use client';

import { useState } from 'react';
import {
  AppShellCard,
  Badge,
  Button,
  Dialog,
  Avatar,
} from '@humain-foundation/ui';
import {
  CheckCircle,
  XCircle,
  Edit3,
  Send,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { MOCK_MEETING_SUMMARY, type MeetingSummary } from '@/lib/mock-data';

const MEDDIC_LABELS: Record<keyof MeetingSummary['meddic'], string> = {
  metrics: 'Metrics',
  economicBuyer: 'Economic Buyer',
  decisionCriteria: 'Decision Criteria',
  decisionProcess: 'Decision Process',
  identifiedPain: 'Identified Pain',
  champion: 'Champion',
};

export default function SummarizePage() {
  const [summary, setSummary] = useState(MOCK_MEETING_SUMMARY);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [showMeddic, setShowMeddic] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allChecked = summary.actionItems.every((ai) => checkedItems.has(ai.id));
  const detectedMeddicCount = Object.values(summary.meddic).filter(Boolean).length;

  function toggleActionItem(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleApprove() {
    setSummary((s) => ({ ...s, status: 'approved' }));
    setConfirmOpen(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <AppShellCard>
        <AppShellCard.Header>
          <AppShellCard.Title>Meeting Summaries</AppShellCard.Title>
        </AppShellCard.Header>
        <div className="flex flex-col items-center gap-4 py-20">
          <CheckCircle className="size-12 text-success" />
          <p className="text-lg font-semibold text-foreground">Summary approved</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            The meeting summary and {checkedItems.size} action items have been written to Salesforce
            as an activity on <strong>{summary.accountName}</strong>.
          </p>
          <Button appearance="outline" onClick={() => setSubmitted(false)}>
            Review another
          </Button>
        </div>
      </AppShellCard>
    );
  }

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <AppShellCard.Title>Meeting Summaries</AppShellCard.Title>
        <AppShellCard.Subtitle>AI-drafted · Review before writing to Salesforce</AppShellCard.Subtitle>
      </AppShellCard.Header>

      <div className="flex flex-col gap-6">
        {/* Meeting header */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge color="secondary">Pending Review</Badge>
                <Badge color="primary">{summary.accountName}</Badge>
              </div>
              <h2 className="text-base font-semibold text-foreground">{summary.meetingTitle}</h2>
            </div>
            <Badge color="warning">AI Draft</Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {summary.date} · {summary.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {summary.participants.length} participants
            </span>
          </div>

          <div className="flex flex-wrap gap-1 mt-3">
            {summary.participants.map((p) => (
              <div key={p} className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
                <Avatar fallback={p.split(' ')[0]} size="xs" />
                <span className="text-xs text-foreground">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI summary */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">AI-Generated Summary</h3>
            <Button appearance="ghost" size="sm" startIcon={<Edit3 className="size-4" />}>
              Edit
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-foreground leading-relaxed">{summary.summary}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <AlertTriangle className="size-3" />
            AI summaries capture ~80% of content. Review carefully before approving.
          </p>
        </section>

        {/* Action items */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              Action Items ({summary.actionItems.length})
            </h3>
            {!allChecked && (
              <Badge color="warning">
                {summary.actionItems.length - checkedItems.size} unreviewed
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {summary.actionItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors cursor-pointer ${
                  checkedItems.has(item.id)
                    ? 'border-success/30 bg-success/5'
                    : 'border-border bg-card hover:bg-accent'
                }`}
                onClick={() => toggleActionItem(item.id)}
              >
                <div
                  className={`mt-0.5 shrink-0 size-4 rounded-full border-2 flex items-center justify-center ${
                    checkedItems.has(item.id)
                      ? 'border-success bg-success'
                      : 'border-border'
                  }`}
                >
                  {checkedItems.has(item.id) && (
                    <CheckCircle className="size-3 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${checkedItems.has(item.id) ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {item.text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Owner: {item.owner} · Due: {item.due}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MEDDICC signals */}
        <section>
          <button
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
            onClick={() => setShowMeddic((s) => !s)}
          >
            <span className="flex items-center gap-2">
              MEDDICC Signals Detected
              <Badge color="success">{detectedMeddicCount} / 6 fields</Badge>
            </span>
            {showMeddic ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {showMeddic && (
            <div className="mt-2 flex flex-col gap-2">
              {(Object.entries(summary.meddic) as [keyof MeetingSummary['meddic'], string | null][]).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className={`rounded-lg border px-4 py-3 ${
                      value ? 'border-border bg-card' : 'border-dashed border-border bg-muted'
                    }`}
                  >
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      {MEDDIC_LABELS[key]}
                    </p>
                    {value ? (
                      <p className="text-sm text-foreground">{value}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Not detected in this call</p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Approve / reject */}
        <div className="flex items-center justify-between border-t border-border pt-5">
          <Button
            appearance="outline"
            variant="destructive"
            startIcon={<XCircle className="size-4" />}
            onClick={() => setSummary((s) => ({ ...s, status: 'rejected' }))}
          >
            Reject
          </Button>

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <Dialog.Trigger
              render={
                <Button
                  variant="primary"
                  startIcon={<Send className="size-4" />}
                />
              }
            >
              Approve & Write to Salesforce
            </Dialog.Trigger>
            <Dialog.Popup size="sm" showCloseButton>
              <Dialog.Header>
                <Dialog.Title>Write to Salesforce?</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-foreground">
                    This will create a logged activity on <strong>{summary.accountName}</strong> in Salesforce
                    with the AI-generated summary and {checkedItems.size} confirmed action items.
                  </p>
                  <div className="rounded-lg border border-border bg-muted p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">What will be written:</p>
                    <ul className="text-xs text-foreground space-y-1 list-disc list-inside">
                      <li>Activity log: meeting summary</li>
                      <li>{checkedItems.size} tasks (of {summary.actionItems.length} action items)</li>
                      <li>MEDDICC signals ({detectedMeddicCount} fields populated)</li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This action cannot be undone. You can edit the activity in Salesforce afterward.
                  </p>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.Close render={<Button appearance="outline" />}>Cancel</Dialog.Close>
                <Button variant="primary" onClick={handleApprove} startIcon={<Send className="size-4" />}>
                  Confirm & Write
                </Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog>
        </div>
      </div>
    </AppShellCard>
  );
}
