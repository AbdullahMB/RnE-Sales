'use client';

import { useState, useMemo } from 'react';
import {
  AppShellCard,
  Badge,
  Button,
  Input,
  Sheet,
} from '@humain-foundation/ui';
import { Search, BookOpen, AlertTriangle, ExternalLink } from 'lucide-react';
import { MOCK_WIKI_ASSETS, type WikiAsset } from '@/lib/mock-data';

type BadgeColor = 'destructive' | 'warning' | 'success' | 'secondary' | 'primary';

const TYPE_COLOR: Record<WikiAsset['type'], BadgeColor> = {
  'Case Study': 'success',
  'Battle Card': 'destructive',
  Playbook: 'primary',
  Template: 'secondary',
  'Reference Architecture': 'primary',
  FAQ: 'secondary',
};

const ALL_TYPES = ['All', 'Case Study', 'Battle Card', 'Playbook', 'Template', 'Reference Architecture', 'FAQ'] as const;

function isExpiringSoon(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date(Date.now() + 30 * 86400_000);
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export default function WikiPage() {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('All');
  const [selectedAsset, setSelectedAsset] = useState<WikiAsset | null>(null);

  const filtered = useMemo(() => {
    return MOCK_WIKI_ASSETS.filter((a) => {
      const matchesType = activeType === 'All' || a.type === activeType;
      const matchesQuery =
        !query ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
        a.industry.some((i) => i.toLowerCase().includes(query.toLowerCase()));
      return matchesType && matchesQuery;
    });
  }, [query, activeType]);

  return (
    <AppShellCard>
      <AppShellCard.Header>
        <AppShellCard.Title>Sales Wiki</AppShellCard.Title>
        <AppShellCard.Subtitle>Case studies, battle cards, playbooks, and templates</AppShellCard.Subtitle>
      </AppShellCard.Header>

      <div className="flex flex-col gap-6">
        {/* Search */}
        <Input
          placeholder="Search by title, industry, tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          startIcon={<Search className="size-4" />}
        />

        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((type) => (
            <Button
              key={type}
              size="sm"
              appearance={activeType === type ? 'solid' : 'outline'}
              variant={activeType === type ? 'primary' : undefined}
              onClick={() => setActiveType(type)}
            >
              {type}
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'asset' : 'assets'} found
        </p>

        {/* Asset grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <BookOpen className="size-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No assets found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((asset) => (
              <button
                key={asset.id}
                className="text-left flex flex-col gap-3 rounded-xl border border-border bg-card p-4 hover:bg-accent transition-colors cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge color={TYPE_COLOR[asset.type]}>{asset.type}</Badge>
                  {isExpired(asset.expiresAt) ? (
                    <Badge color="destructive">Expired</Badge>
                  ) : isExpiringSoon(asset.expiresAt) ? (
                    <Badge color="warning">Expires soon</Badge>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-foreground line-clamp-2">{asset.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{asset.description}</p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {asset.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Updated {asset.lastUpdated}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Asset detail sheet */}
      <Sheet open={!!selectedAsset} onOpenChange={(o) => !o && setSelectedAsset(null)}>
        <Sheet.Popup side="right">
          {selectedAsset && (
            <>
              <Sheet.Header>
                <Sheet.Title>{selectedAsset.title}</Sheet.Title>
              </Sheet.Header>
              <Sheet.Body>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge color={TYPE_COLOR[selectedAsset.type]}>{selectedAsset.type}</Badge>
                    {isExpired(selectedAsset.expiresAt) && <Badge color="destructive">Expired</Badge>}
                    {isExpiringSoon(selectedAsset.expiresAt) && !isExpired(selectedAsset.expiresAt) && (
                      <Badge color="warning">Expires soon</Badge>
                    )}
                    {selectedAsset.approved && <Badge color="success">Approved</Badge>}
                  </div>

                  <p className="text-sm text-foreground">{selectedAsset.description}</p>

                  {selectedAsset.expiresAt && (
                    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                      <AlertTriangle className="size-4 text-warning shrink-0" />
                      <p className="text-xs text-foreground">Expires: {selectedAsset.expiresAt}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Industry</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedAsset.industry.length > 0
                        ? selectedAsset.industry.map((i) => (
                            <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {i}
                            </span>
                          ))
                        : <span className="text-xs text-muted-foreground">All industries</span>}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedAsset.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">Last updated: {selectedAsset.lastUpdated}</p>
                </div>
              </Sheet.Body>
              <Sheet.Footer>
                <Sheet.Close render={<Button appearance="outline" />}>Close</Sheet.Close>
                <Button variant="primary" endIcon={<ExternalLink className="size-4" />}>
                  Open Asset
                </Button>
              </Sheet.Footer>
            </>
          )}
        </Sheet.Popup>
      </Sheet>
    </AppShellCard>
  );
}
