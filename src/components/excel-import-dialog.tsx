'use client';

import { useState, useRef, useCallback } from 'react';
import { Dialog, Button, Badge } from '@humain-foundation/ui';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, RotateCcw, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Deal, DealStage, RiskLevel } from '@/lib/mock-data';

// ─── Column detection ─────────────────────────────────────────────────────────

const COLUMN_MATCHERS: [keyof MappedRow, RegExp][] = [
  ['stage',       /^status$|^stage$/i],
  ['title',       /deal.?title|^title$|deal.?name/i],
  ['customer',    /^custom(er)?$|^account$|^client$|^customer name$/i],
  ['subSector',   /sub.?sector|^sector$|^industry$/i],
  ['acv',         /value|acv|amount|deal.?size/i],
  ['probability', /prob/i],
  ['owner',       /owner|^rep$|assigned|ae$/i],
];

interface MappedRow {
  stage?: string;
  title?: string;
  customer?: string;
  subSector?: string;
  acv?: string | number;
  probability?: string | number;
  owner?: string;
}

type ColMapping = Partial<Record<keyof MappedRow, string>>;

function detectColumns(headers: string[]): ColMapping {
  const mapping: ColMapping = {};
  for (const [field, regex] of COLUMN_MATCHERS) {
    const match = headers.find((h) => regex.test(h.trim()));
    if (match) mapping[field] = match;
  }
  return mapping;
}

// ─── Row → Deal conversion ────────────────────────────────────────────────────

const STAGE_MAP: Record<string, DealStage> = {
  'won':              'Won',
  'qualification':    'Qualification',
  'develop proposal': 'Develop Proposal',
  'submit proposal':  'Submit Proposal',
  'negotiate':        'Negotiate',
  'lost':             'Lost',
  'dropped':          'Dropped',
};

function normalizeStage(raw: string): DealStage {
  return STAGE_MAP[raw.trim().toLowerCase()] ?? 'Qualification';
}

function deriveRisk(probability: number, stage: DealStage): RiskLevel {
  if (stage === 'Won' || stage === 'Lost' || stage === 'Dropped') return 'low';
  if (probability >= 60 || stage === 'Negotiate') return 'low';
  if (probability >= 30 || stage === 'Submit Proposal' || stage === 'Develop Proposal') return 'medium';
  return 'high';
}

function guessAccountId(customer: string): string {
  const l = customer.toLowerCase();
  if (l.includes('aramco digital')) return 'a1';
  if (l.includes('aramco sport'))   return 'a13';
  if (l.includes('aramco'))         return 'a1';
  if (l.includes('sabic'))          return 'a2';
  if (l.includes('stc'))            return 'a3';
  if (l.includes('mobily'))         return 'a4';
  if (l.includes('neom'))           return 'a5';
  if (l.includes('asmo'))           return 'a6';
  if (l.includes('mwan'))           return 'a7';
  if (l.includes('moe') || l.includes('ministry of energy')) return 'a8';
  if (l.includes('mewa'))           return 'a9';
  if (l.includes('swa'))            return 'a10';
  if (l.includes('mim') || l.includes("mi'm")) return 'a11';
  return `imp-${customer.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20)}`;
}

function parseNumber(val: string | number | undefined): number {
  if (val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  // Handle scientific notation (e.g. 1.739990375E7)
  return parseFloat(String(val).replace(/[^0-9.eE+\-]/g, '')) || 0;
}

function rowToDeal(row: Record<string, unknown>, mapping: ColMapping, index: number): Deal {
  const get = (field: keyof MappedRow): string => {
    const col = mapping[field];
    return col ? String(row[col] ?? '').trim() : '';
  };

  const stage    = normalizeStage(get('stage'));
  const acv      = Math.round(parseNumber(mapping.acv ? row[mapping.acv] as string | number : undefined));
  const probRaw  = parseNumber(mapping.probability ? row[mapping.probability] as string | number : undefined);
  const probability = probRaw > 1 ? Math.round(probRaw) : Math.round(probRaw * 100);
  const customer = get('customer') || 'Unknown';

  return {
    id:               `imp-${index}`,
    title:            get('title') || `Deal ${index + 1}`,
    accountName:      customer,
    accountId:        guessAccountId(customer),
    customer,
    subSector:        get('subSector') || 'Other',
    stage,
    acv,
    probability,
    closeDate:        '2026-12-31',
    daysSinceActivity: 0,
    risk:             deriveRisk(probability, stage),
    owner:            get('owner') || 'Unknown',
  };
}

// ─── Preview table ────────────────────────────────────────────────────────────

function PreviewTable({ deals }: { deals: Deal[] }) {
  const shown = deals.slice(0, 6);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/60">
            <tr>
              {['Title', 'Customer', 'Stage', 'Value', 'Sub Sector', 'Owner'].map((h) => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {shown.map((d, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-medium text-foreground max-w-[180px] truncate">{d.title}</td>
                <td className="px-3 py-2 text-muted-foreground">{d.customer}</td>
                <td className="px-3 py-2">
                  <Badge color={d.stage === 'Won' ? 'success' : d.stage === 'Lost' || d.stage === 'Dropped' ? 'destructive' : 'secondary'}>
                    {d.stage}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {d.acv >= 1_000_000 ? `SAR ${(d.acv / 1_000_000).toFixed(1)}M` : `SAR ${(d.acv / 1000).toFixed(0)}K`}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{d.subSector}</td>
                <td className="px-3 py-2 text-muted-foreground">{d.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deals.length > 6 && (
        <p className="px-3 py-2 text-xs text-muted-foreground bg-muted/40 border-t border-border">
          +{deals.length - 6} more rows…
        </p>
      )}
    </div>
  );
}

// ─── Mapping summary ──────────────────────────────────────────────────────────

function MappingBadges({ mapping }: { mapping: ColMapping }) {
  const fields: [keyof MappedRow, string][] = [
    ['stage', 'Stage'], ['title', 'Deal Title'], ['customer', 'Customer'],
    ['subSector', 'Sub Sector'], ['acv', 'Value'], ['probability', 'Probability'], ['owner', 'Owner'],
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {fields.map(([field, label]) => (
        <span
          key={field}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            mapping[field]
              ? 'bg-success/10 text-success border border-success/20'
              : 'bg-muted text-muted-foreground border border-border'
          }`}
        >
          {mapping[field] ? <CheckCircle2 className="size-3" /> : <X className="size-3" />}
          {label}
          {mapping[field] && <span className="opacity-60">← {mapping[field]}</span>}
        </span>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ExcelImportDialogProps {
  onImport: (deals: Deal[]) => void;
  onReset: () => void;
  hasCustomData: boolean;
}

export function ExcelImportDialog({ onImport, onReset, hasCustomData }: ExcelImportDialogProps) {
  const [open, setOpen]           = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [fileName, setFileName]   = useState('');
  const [error, setError]         = useState('');
  const [mapping, setMapping]     = useState<ColMapping | null>(null);
  const [preview, setPreview]     = useState<Deal[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFileName(''); setError(''); setMapping(null); setPreview(null);
  };

  const processFile = useCallback(async (file: File) => {
    setError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
      setError('Unsupported file type. Please upload .xlsx, .xls, or .csv');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });

      if (rows.length === 0) { setError('The file appears to be empty.'); return; }

      const headers = Object.keys(rows[0]);
      const detected = detectColumns(headers);

      if (!detected.title && !detected.customer) {
        setError('Could not detect deal columns. Make sure your file has headers like "Deal title", "Customer", "Status", "Expected deal value", "Sub sector".');
        return;
      }

      const deals = rows
        .filter((r) => Object.values(r).some((v) => v !== ''))
        .map((r, i) => rowToDeal(r, detected, i));

      setFileName(file.name);
      setMapping(detected);
      setPreview(deals);
    } catch {
      setError('Failed to parse the file. Please make sure it is a valid Excel or CSV file.');
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = () => {
    if (!preview) return;
    onImport(preview);
    setOpen(false);
    reset();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {hasCustomData && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs font-medium text-brand-500 hover:bg-brand-500/20 transition-colors"
          >
            <RotateCcw className="size-3" />
            Reset to default data
          </button>
        )}
        <Button
          appearance="outline"
          size="sm"
          startIcon={<Upload className="size-4" />}
          onClick={() => { reset(); setOpen(true); }}
        >
          {hasCustomData ? 'Re-import Excel' : 'Import from Excel'}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setOpen(false); } }}>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup className="w-full max-w-2xl">
              <Dialog.Header>
                <Dialog.Title>Import Pipeline from Excel</Dialog.Title>
                <Dialog.Description>
                  Upload an .xlsx, .xls, or .csv file. Columns will be auto-detected from your headers.
                </Dialog.Description>
              </Dialog.Header>

              <Dialog.Body>
                <div className="flex flex-col gap-4">

                  {/* Drop zone */}
                  {!preview && (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onClick={() => inputRef.current?.click()}
                      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
                        dragging
                          ? 'border-brand-500 bg-brand-500/5'
                          : 'border-border hover:border-brand-500/50 hover:bg-muted/40'
                      }`}
                    >
                      <FileSpreadsheet className="size-10 text-muted-foreground/50" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Drop your Excel file here, or <span className="text-brand-500">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">.xlsx · .xls · .csv supported</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {['Status', 'Deal title', 'Customer', 'Sub sector', 'Expected deal value', 'Probability', 'Deal owner'].map((col) => (
                          <span key={col} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">{col}</span>
                        ))}
                      </div>
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
                      <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {/* Preview */}
                  {preview && mapping && (
                    <div className="flex flex-col gap-4">
                      {/* File + stats */}
                      <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="size-4 text-brand-500" />
                          <p className="text-sm font-medium text-foreground">{fileName}</p>
                          <Badge color="success">{preview.length} deals detected</Badge>
                        </div>
                        <button
                          onClick={reset}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <X className="size-3" /> Change file
                        </button>
                      </div>

                      {/* Column mapping */}
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Detected Column Mapping</p>
                        <MappingBadges mapping={mapping} />
                      </div>

                      {/* Preview table */}
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Preview ({Math.min(preview.length, 6)} of {preview.length} rows)
                        </p>
                        <PreviewTable deals={preview} />
                      </div>
                    </div>
                  )}

                </div>
              </Dialog.Body>

              <Dialog.Footer>
                <Button appearance="outline" onClick={() => { reset(); setOpen(false); }}>Cancel</Button>
                {preview && (
                  <Button
                    variant="primary"
                    startIcon={<CheckCircle2 className="size-4" />}
                    onClick={handleImport}
                  >
                    Import {preview.length} deals
                  </Button>
                )}
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog>
    </>
  );
}
