'use client';

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { normaliseRows, type NormalisedRow } from "@/lib/normalise";
import { createId } from "@/lib/id";
import { computeLifePath, computeBirthNumber } from "@/lib/numerology";
import {
  UNKNOWN_TOKEN,
  WeightDefaults,
  type Category,
  type DataRow,
  type Polarity,
  type System,
} from "@/schema";
import { type ProviderKey, type ProviderStatus } from "@/providers";
import tzdbPackage from "@vvo/tzdb/package.json";

export type DatasetRow = NormalisedRow;
type DataRowInput = Omit<DataRow, "id"> & Partial<Pick<DataRow, "id">>;

export interface BirthDetails {
  birthDate: string; // ISO date
  birthTime: string; // HH:mm
  timezone: string;
  latitude?: number | null;
  longitude?: number | null;
  houseSystem: string;
  zodiac: "Tropical" | "Sidereal";
  ayanamsa: string;
  timezoneConfirmed: boolean;
}

export interface FilterState {
  systems: System[];
  categories: Category[];
  subsystem: string;
  polarity: Polarity | null;
  confidenceRange: [number, number];
  strengthRange: [number, number];
  timeRange: [string | null, string | null];
  showConflictsOnly: boolean;
  hideUnknown: boolean;
  hidePrivacyPaid: boolean;
}

export interface MetaMapStore {
  dataset: DatasetRow[];
  birthDetails: BirthDetails;
  filters: FilterState;
  weights: Record<System, number>;
  tzdbVersion: string;
  hasHydrated: boolean;
  providerStatus: ProviderStatus[];
  providerErrors: Partial<Record<ProviderKey, string>>;
  providerLoading: Partial<Record<ProviderKey, boolean>>;
  addRows: (rows: DataRowInput[]) => void;
  replaceRows: (rows: DataRowInput[]) => void;
  appendRow: (row: DataRowInput) => void;
  pruneRows: (predicate: (row: DatasetRow) => boolean) => void;
  clearDataset: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setWeights: (weights: Partial<Record<System, number>>) => void;
  resetWeights: () => void;
  setBirthDetails: (details: Partial<BirthDetails>) => void;
  confirmTimezone: (confirmed: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  fetchProviderStatus: () => Promise<void>;
  invokeProvider: <Payload, Result>(
    key: ProviderKey,
    payload: Payload,
  ) => Promise<{ status: number; data: Result | null }>;
  clearProviderError: (key: ProviderKey) => void;
}

const defaultBirthDetails: BirthDetails = {
  birthDate: "1992-09-01",
  birthTime: "06:03",
  timezone: "Australia/Sydney",
  latitude: null,
  longitude: null,
  houseSystem: "Placidus",
  zodiac: "Tropical",
  ayanamsa: "Lahiri",
  timezoneConfirmed: false,
};

const defaultFilters: FilterState = {
  systems: [],
  categories: [],
  subsystem: "",
  polarity: null,
  confidenceRange: [0, 1],
  strengthRange: [-2, 2],
  timeRange: [null, null],
  showConflictsOnly: false,
  hideUnknown: false,
  hidePrivacyPaid: false,
};

const buildSeedRows = (details: BirthDetails): DataRow[] => {
  const lifePath = computeLifePath(details.birthDate);
  const birthNumber = computeBirthNumber(details.birthDate);
  const base: Omit<DataRow, "id"> = {
    person_id: "default-person",
    birth_datetime_local: `${details.birthDate}T${details.birthTime}`,
    birth_timezone: details.timezone,
    system: "Numerology_Pythagorean",
    subsystem: "",
    source_tool: "MetaMap Numerology",
    source_url_or_ref: "",
    data_point: "",
    verbatim_text: UNKNOWN_TOKEN,
    category: "Personality",
    subcategory: "",
    direction_cardinal: "",
    direction_degrees: null,
    timing_window_start: null,
    timing_window_end: null,
    polarity: "+",
    strength: 1,
    confidence: 0.6,
    weight_system: 1,
    notes: "",
  };

  const rows: DataRow[] = [
    {
      ...base,
      id: createId(),
      system: "Numerology_Pythagorean",
      data_point: `Life Path ${lifePath.compound}/${lifePath.reduced}`,
      category: "Personality",
    },
    {
      ...base,
      id: createId(),
      system: "Numerology_Chaldean",
      data_point: `Birth number ${birthNumber.compound}`,
      category: "Learning",
    },
  ];

  return rows;
};

const reweight = (
  dataset: DatasetRow[],
  weights: Record<System, number>,
): DatasetRow[] =>
  dataset.map((row) => ({
    ...row,
    weight_system: weights[row.system] ?? WeightDefaults[row.system] ?? 1,
  }));

const tzdbVersion = `@vvo/tzdb ${tzdbPackage.version}`;

const isBrowser = typeof window !== "undefined";
const storage = isBrowser ? createJSONStorage(() => localStorage) : undefined;

export const useStore = create<MetaMapStore>()(
  persist(
    (set, get) => {
      const seedRows = reweight(
        normaliseRows(buildSeedRows(defaultBirthDetails)),
        WeightDefaults,
      );
      const invokeProvider = async <Payload, Result>(
        key: ProviderKey,
        payload: Payload,
      ): Promise<{ status: number; data: Result | null }> => {
        set((state) => ({
          providerLoading: { ...state.providerLoading, [key]: true },
          providerErrors: { ...state.providerErrors, [key]: undefined },
        }));
        try {
          const response = await fetch(`/api/providers/${key}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload ?? {}),
          });
          const data = (await response.json().catch(() => null)) as Result | null;
          if (!response.ok) {
            const message =
              data && typeof data === "object" && data !== null && "error" in data
                ? String((data as { error: unknown }).error)
                : `Provider request failed (${response.status})`;
            set((state) => ({
              providerErrors: { ...state.providerErrors, [key]: message },
            }));
          }
          return { status: response.status, data };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown provider invocation error";
          set((state) => ({
            providerErrors: { ...state.providerErrors, [key]: message },
          }));
          return { status: 0, data: null };
        } finally {
          set((state) => ({
            providerLoading: { ...state.providerLoading, [key]: false },
          }));
        }
      };

      return {
        dataset: seedRows,
        birthDetails: defaultBirthDetails,
        filters: defaultFilters,
        weights: { ...WeightDefaults },
        tzdbVersion,
        hasHydrated: !isBrowser,
        providerStatus: [],
        providerErrors: {},
        providerLoading: {},
        addRows: (rows) => {
          const withIds = rows.map((row) => ({ ...row, id: row.id ?? createId() }));
          const combined = normaliseRows([...get().dataset, ...withIds]);
          set({ dataset: reweight(combined, get().weights) });
        },
        replaceRows: (rows) => {
          const withIds = rows.map((row) => ({ ...row, id: row.id ?? createId() }));
          const normalised = normaliseRows(withIds);
          set({ dataset: reweight(normalised, get().weights) });
        },
        appendRow: (row) => {
          const idRow = { ...row, id: row.id ?? createId() };
          const combined = normaliseRows([...get().dataset, idRow]);
          set({ dataset: reweight(combined, get().weights) });
        },
        pruneRows: (predicate) => {
          const filtered = get().dataset.filter((row) => !predicate(row));
          set({ dataset: reweight(filtered, get().weights) });
        },
        clearDataset: () =>
          set({
            dataset: reweight(
              normaliseRows(buildSeedRows(get().birthDetails)),
              get().weights,
            ),
          }),
        setFilters: (filters) =>
          set({
            filters: { ...get().filters, ...filters },
          }),
        resetFilters: () => set({ filters: defaultFilters }),
        setWeights: (weightsUpdate) => {
          const nextWeights = { ...get().weights, ...weightsUpdate };
          set({
            weights: nextWeights,
            dataset: reweight(get().dataset, nextWeights),
          });
        },
        resetWeights: () =>
          set({
            weights: { ...WeightDefaults },
            dataset: reweight(get().dataset, WeightDefaults),
          }),
        setBirthDetails: (details) => {
          const nextDetails = { ...get().birthDetails, ...details };
          set({
            birthDetails: nextDetails,
          });
        },
        confirmTimezone: (confirmed) =>
          set({
            birthDetails: { ...get().birthDetails, timezoneConfirmed: confirmed },
          }),
        setHasHydrated: (value) =>
          set({
            hasHydrated: value,
          }),
        fetchProviderStatus: async () => {
          try {
            const response = await fetch("/api/providers", {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            });
            if (!response.ok) {
              throw new Error(`Failed to fetch provider status (${response.status})`);
            }
            const json = (await response.json()) as { providers?: ProviderStatus[] };
            if (Array.isArray(json.providers)) {
              set({ providerStatus: json.providers });
            }
          } catch (error) {
            console.error("Provider status request failed", error);
          }
        },
        invokeProvider: invokeProvider as MetaMapStore["invokeProvider"],
        clearProviderError: (key) =>
          set((state) => ({
            providerErrors: { ...state.providerErrors, [key]: undefined },
          })),
      };
    },
    {
      name: "metamap-store",
      storage,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        dataset: state.dataset,
        birthDetails: state.birthDetails,
        filters: state.filters,
        weights: state.weights,
      }),
    },
  ),
);
