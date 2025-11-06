export interface FlyingStar {
  palace: string;
  star: number;
  baseStar: number;
  periodStar: number;
}

export interface EightMansionsResult {
  mingGua: string;
  favourableDirections: string[];
  unfavourableDirections: string[];
}

/**
 * Feng Shui provider interface for Flying Stars and Eight Mansions computations.
 * TODO: wire a concrete provider, annotating `privacy:paid` in notes when relevant.
 */
export interface FSProvider {
  computeFlyingStars: (input: {
    sittingDegrees: number;
    facingDegrees: number;
    period: number;
    variant?: string;
  }) => Promise<FlyingStar[]>;
  computeEightMansions: (input: {
    birthYear: number;
    gender: "female" | "male" | "unspecified";
  }) => Promise<EightMansionsResult>;
}
