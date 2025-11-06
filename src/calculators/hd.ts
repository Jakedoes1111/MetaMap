/**
 * Human Design chart provider interface.
 * Integrations typically require proprietary datasets (mark rows with notes:"privacy:paid").
 * TODO: implement a provider for BodyGraph calculations.
 */
export interface HDProvider {
  computeBodyGraph: (input: {
    birthDateTime: string;
    timezone: string;
    coordinates?: { latitude: number; longitude: number };
    variant?: string;
  }) => Promise<{
    centres: Record<string, "defined" | "undefined">;
    type?: string;
    authority?: string;
  }>;
}
