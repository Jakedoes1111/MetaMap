import type {
  ChineseCalendarProvider,
  EphemerisProvider,
  FSProvider,
  GKProvider,
  HDProvider,
  QMDJProvider,
  ZWDSProvider,
} from "@/calculators";

export class ProviderUnavailableError extends Error {
  constructor(providerName: ProviderKey) {
    super(
      `Provider "${providerName}" has not been registered. Configure a concrete implementation during app bootstrap.`,
    );
    this.name = "ProviderUnavailableError";
  }
}

type ProviderMap = {
  ephemeris: EphemerisProvider;
  chineseCalendar: ChineseCalendarProvider;
  zwds: ZWDSProvider;
  qmdj: QMDJProvider;
  fs: FSProvider;
  hd: HDProvider;
  gk: GKProvider;
};

export type ProviderKey = keyof ProviderMap;

type RegistryEntry<K extends ProviderKey> = {
  key: K;
  instance: ProviderMap[K] | null;
  name: string;
  description: string;
  errorHint: string;
};

const registry: { [K in ProviderKey]: RegistryEntry<K> } = {
  ephemeris: {
    key: "ephemeris",
    instance: null,
    name: "EphemerisProvider",
    description: "Computes planetary positions, houses, and sidereal metrics.",
    errorHint:
      "Install a Swiss Ephemeris or JPL adapter and register it via registerProvider('ephemeris').",
  },
  chineseCalendar: {
    key: "chineseCalendar",
    instance: null,
    name: "ChineseCalendarProvider",
    description: "Derives sexagenary pillars and luck cycles.",
    errorHint:
      "Attach a licensed Chinese calendar implementation and register it with registerProvider('chineseCalendar').",
  },
  zwds: {
    key: "zwds",
    instance: null,
    name: "ZWDSProvider",
    description: "Generates Zi Wei Dou Shu palace readings.",
    errorHint:
      "Register a Zi Wei Dou Shu calculator implementation via registerProvider('zwds').",
  },
  qmdj: {
    key: "qmdj",
    instance: null,
    name: "QMDJProvider",
    description: "Builds Qi Men Dun Jia boards for selected schools/arrangements.",
    errorHint:
      "Register a Qi Men Dun Jia engine via registerProvider('qmdj') before requesting data.",
  },
  fs: {
    key: "fs",
    instance: null,
    name: "FSProvider",
    description: "Calculates Flying Stars and Eight Mansions outputs.",
    errorHint:
      "Register a Feng Shui provider using registerProvider('fs') to enable calculations.",
  },
  hd: {
    key: "hd",
    instance: null,
    name: "HDProvider",
    description: "Computes Human Design BodyGraph centres, type, and authority.",
    errorHint:
      "Register a Human Design provider using registerProvider('hd') with your API credentials.",
  },
  gk: {
    key: "gk",
    instance: null,
    name: "GKProvider",
    description: "Generates Gene Keys hologenetic profiles.",
    errorHint:
      "Register a Gene Keys provider implementation using registerProvider('gk') prior to use.",
  },
};

export type ProviderRegistration<K extends ProviderKey> = {
  key: K;
  provider: ProviderMap[K];
};

export const registerProvider = <K extends ProviderKey>({
  key,
  provider,
}: ProviderRegistration<K>) => {
  registry[key].instance = provider;
};

export const getProvider = <K extends ProviderKey>(key: K): ProviderMap[K] => {
  const entry = registry[key];
  if (!entry.instance) {
    throw new ProviderUnavailableError(key);
  }
  return entry.instance;
};

export type ProviderStatus = {
  key: ProviderKey;
  registered: boolean;
  name: string;
  description: string;
  errorHint: string;
};

export const listProviderStatus = (): ProviderStatus[] =>
  (Object.values(registry) as RegistryEntry<ProviderKey>[]).map((entry) => ({
    key: entry.key,
    registered: entry.instance != null,
    name: entry.name,
    description: entry.description,
    errorHint: entry.errorHint,
  }));

export const resetProviders = () => {
  (Object.keys(registry) as ProviderKey[]).forEach((key) => {
    registry[key].instance = null;
  });
};
