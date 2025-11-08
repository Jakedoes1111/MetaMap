import type { DateTime } from "luxon";

export interface ZWDSPalaceReading {
  palace: string;
  stars: string[];
  notes?: string;
}

/**
 * Zi Wei Dou Shu provider contract.
 * TODO: integrate licensed calculator and surface privacy requirements via the privacy field.
 */
export interface ZWDSProvider {
  computeChart: (input: {
    dateTime: DateTime;
    zone: string;
    coordinates?: { latitude: number; longitude: number };
    variant?: string;
  }) => Promise<ZWDSPalaceReading[]>;
}
