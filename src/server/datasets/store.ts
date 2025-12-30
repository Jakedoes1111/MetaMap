import { DataRowSchema, type DataRow } from "@/schema";
import type { ProviderKey } from "@/providers";

export interface DatasetProvenance {
  provider: ProviderKey;
  timestamp: string;
  config: Record<string, unknown>;
}

type DatasetProvenanceInit = {
  provider: ProviderKey;
  timestamp: string;
  config?: Record<string, unknown>;
};

export interface DatasetRecord {
  row: DataRow;
  provenance: DatasetProvenance;
}

const formatConfig = (config: Record<string, unknown>): Record<string, unknown> => {
  const sortedEntries = Object.entries(config).sort(([a], [b]) => a.localeCompare(b));
  return sortedEntries.reduce<Record<string, unknown>>((accumulator, [key, value]) => {
    accumulator[key] = value;
    return accumulator;
  }, {});
};

const buildProvenanceNote = (provenance: DatasetProvenance): string => {
  const configString = JSON.stringify(formatConfig(provenance.config));
  return `provenance:timestamp=${provenance.timestamp};provider=${provenance.provider};config=${configString}`;
};

const applyProvenance = (row: DataRow, provenance: DatasetProvenance): DataRow => {
  const provenanceNote = buildProvenanceNote(provenance);
  const existingNotes = row.notes?.trim() ?? "";
  const notes = existingNotes.length > 0 ? `${existingNotes} | ${provenanceNote}` : provenanceNote;
  const sourceTool = row.source_tool && row.source_tool.length > 0 ? row.source_tool : provenance.provider;
  return {
    ...row,
    notes,
    source_tool: sourceTool,
  };
};

const cloneProvenance = (provenance: DatasetProvenanceInit): DatasetProvenance => ({
  provider: provenance.provider,
  timestamp: provenance.timestamp,
  config: { ...(provenance.config ?? {}) },
});

const cloneRecord = (record: DatasetRecord): DatasetRecord => ({
  row: { ...record.row },
  provenance: {
    provider: record.provenance.provider,
    timestamp: record.provenance.timestamp,
    config: { ...record.provenance.config },
  },
});

export class InMemoryDatasetStore {
  private records: DatasetRecord[] = [];

  insertRows(rows: DataRow[], provenance: DatasetProvenanceInit): DatasetRecord[] {
    if (rows.length === 0) {
      return [];
    }

    return rows.map((row) => {
      const metadata = cloneProvenance(provenance);
      const annotatedRow = applyProvenance(row, metadata);
      const validatedRow = DataRowSchema.parse(annotatedRow);
      const record: DatasetRecord = {
        row: validatedRow,
        provenance: metadata,
      };
      this.records.push(record);
      return cloneRecord(record);
    });
  }

  listRecords(): DatasetRecord[] {
    return this.records.map((record) => cloneRecord(record));
  }

  listRows(): DataRow[] {
    return this.records.map((record) => ({ ...record.row }));
  }

  clear() {
    this.records = [];
  }
}

export const datasetStore = new InMemoryDatasetStore();

export const insertDatasetRows = (
  rows: DataRow[],
  provenance: DatasetProvenanceInit,
): DatasetRecord[] => datasetStore.insertRows(rows, provenance);

export const listDatasetRecords = (): DatasetRecord[] => datasetStore.listRecords();

export const listDatasetRows = (): DataRow[] => datasetStore.listRows();

export const resetDatasetStore = (): void => {
  datasetStore.clear();
};
