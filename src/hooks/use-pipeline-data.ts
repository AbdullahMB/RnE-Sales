import { MOCK_DEALS } from '@/lib/mock-data';
import type { Deal } from '@/lib/mock-data';
import { useLocalStorage } from './use-local-storage';

const STORAGE_KEY = 'pipeline:imported-deals';

export function usePipelineData() {
  const [imported, setImported] = useLocalStorage<Deal[] | null>(STORAGE_KEY, null);

  const deals = imported ?? MOCK_DEALS;

  function importDeals(newDeals: Deal[]) {
    setImported(newDeals);
  }

  function resetImport() {
    setImported(null);
  }

  return { deals, importDeals, resetImport, hasCustomData: imported !== null };
}
