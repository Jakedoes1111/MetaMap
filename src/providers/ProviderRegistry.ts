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
      "Set SWISS_EPHEMERIS_* env vars to force Swiss mode or allow the Astronomy Engine fallback to register automatically.",
  },
  chineseCalendar: {
    key: "chineseCalendar",
    instance: null,
    name: "ChineseCalendarProvider",
    description: "Derives sexagenary pillars and luck cycles.",
    errorHint:
      "Bootstrap registers the Solarlunar provider; override via registerProvider('chineseCalendar') if you license another engine.",
  },
  zwds: {
    key: "zwds",
    instance: null,
    name: "ZWDSProvider",
    description: "Generates Zi Wei Dou Shu palace readings.",
    errorHint:
      "Classic Zi Wei Dou Shu provider registers by default. Swap implementations with registerProvider('zwds').",
  },
  qmdj: {
    key: "qmdj",
    instance: null,
    name: "QMDJProvider",
    description: "Builds Qi Men Dun Jia boards for selected schools/arrangements.",
    errorHint:
      "Lo Shu Qi Men provider loads automatically; provide an alternative via registerProvider('qmdj') if needed.",
  },
  fs: {
    key: "fs",
    instance: null,
    name: "FSProvider",
    description: "Calculates Flying Stars and Eight Mansions outputs.",
    errorHint:
      "Traditional Flying Star provider is bundled; replace with registerProvider('fs') for other schools.",
  },
  hd: {
    key: "hd",
    instance: null,
    name: "HDProvider",
    description: "Computes Human Design BodyGraph centres, type, and authority.",
    errorHint:
      "Human Design gate provider initialises automatically. Use registerProvider('hd') to point at a commercial API.",
  },
  gk: {
    key: "gk",
    instance: null,
    name: "GKProvider",
    description: "Generates Gene Keys hologenetic profiles.",
    errorHint:
      "Gene Keys profile provider is bundled; override via registerProvider('gk') for licensed content.",
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
