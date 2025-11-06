/**
 * Gene Keys hologenetic profile provider contract.
 * TODO: connect a provider for sequence calculations (mark proprietary data with privacy notes).
 */
export interface GKProvider {
  computeProfile: (input: {
    birthDateTime: string;
    timezone: string;
    variant?: string;
  }) => Promise<{
    spheres: Array<{ name: string; geneKey: number; line?: number }>;
  }>;
}
