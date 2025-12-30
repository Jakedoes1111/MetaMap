import type { AstroTime } from "astronomy-engine";
import {
  Body,
  DEG2RAD,
  Ecliptic,
  GeoVector,
  MakeTime,
  RAD2DEG,
  SiderealTime,
} from "astronomy-engine";
import type { DateTime } from "luxon";
import type { EphemerisOptions, EphemerisProvider } from "@/calculators";
import type { EphemerisBody, EphemerisResponse } from "@/lib/ephemeris";
import { resolveAyanamsaOffset } from "@/lib/ayanamsa";

const DEGREE_CIRCLE = 360;
const OBLIQUITY_BASE = 23.439291;

const wrapDegrees = (value: number) => {
  const result = value % DEGREE_CIRCLE;
  return result < 0 ? result + DEGREE_CIRCLE : result;
};

const toRadians = (value: number) => value * DEG2RAD;
const toDegrees = (value: number) => value * RAD2DEG;

const planetCatalog: Array<{ id: string; name: string; body: Body }> = [
  { id: "sun", name: "Sun", body: Body.Sun },
  { id: "moon", name: "Moon", body: Body.Moon },
  { id: "mercury", name: "Mercury", body: Body.Mercury },
  { id: "venus", name: "Venus", body: Body.Venus },
  { id: "mars", name: "Mars", body: Body.Mars },
  { id: "jupiter", name: "Jupiter", body: Body.Jupiter },
  { id: "saturn", name: "Saturn", body: Body.Saturn },
  { id: "uranus", name: "Uranus", body: Body.Uranus },
  { id: "neptune", name: "Neptune", body: Body.Neptune },
  { id: "pluto", name: "Pluto", body: Body.Pluto },
];

const computeObliquity = (time: AstroTime): number => {
  const centuries = time.tt / 36525;
  return OBLIQUITY_BASE - 0.0130042 * centuries;
};

const computeAscMc = (
  time: AstroTime,
  latitude: number,
  longitude: number,
): { ascendant: number; midheaven: number } => {
  const gastHours = SiderealTime(time);
  const lstHours = gastHours + longitude / 15;
  const lstDegrees = wrapDegrees(lstHours * 15);
  const lst = toRadians(lstDegrees);
  const phi = toRadians(latitude);
  const epsilon = toRadians(computeObliquity(time));

  const sinLst = Math.sin(lst);
  const cosLst = Math.cos(lst);
  const tanPhi = Math.tan(phi);
  const sinEps = Math.sin(epsilon);
  const cosEps = Math.cos(epsilon);

  const ascNumerator = -cosLst;
  const ascDenominator = sinEps * tanPhi + cosEps * sinLst;
  const ascendant = wrapDegrees(toDegrees(Math.atan2(ascNumerator, ascDenominator)));

  const mcNumerator = sinLst;
  const mcDenominator = cosLst * cosEps - tanPhi * sinEps;
  const midheaven = wrapDegrees(toDegrees(Math.atan2(mcNumerator, mcDenominator)));

  return { ascendant, midheaven };
};

const computeMeanNode = (time: AstroTime): EphemerisBody => {
  const longitude = wrapDegrees(125.04452 - 0.0529538083 * time.tt);
  const future = wrapDegrees(125.04452 - 0.0529538083 * (time.tt + 1));
  const longitudeSpeed = future - longitude;
  return {
    id: "mean_node",
    name: "Mean Node",
    longitude,
    latitude: 0,
    distance: 0,
    longitudeSpeed,
    latitudeSpeed: 0,
    distanceSpeed: 0,
    retrograde: longitudeSpeed < 0,
  };
};

const computeBody = (
  body: { id: string; name: string; body: Body },
  time: AstroTime,
  houseAnchor: number,
): EphemerisBody => {
  const vector = GeoVector(body.body, time, true);
  const ecliptic = Ecliptic(vector);
  const tomorrow = time.AddDays(1);
  const futureVector = GeoVector(body.body, tomorrow, true);
  const futureEcliptic = Ecliptic(futureVector);
  const longitude = wrapDegrees(ecliptic.elon);
  const futureLongitude = wrapDegrees(futureEcliptic.elon);
  let longitudeSpeed = futureLongitude - longitude;
  if (longitudeSpeed > 180) {
    longitudeSpeed -= DEGREE_CIRCLE;
  } else if (longitudeSpeed < -180) {
    longitudeSpeed += DEGREE_CIRCLE;
  }

  const latitude = ecliptic.elat;
  const futureLatitude = futureEcliptic.elat;
  const latitudeSpeed = futureLatitude - latitude;
  const distance = vector.Length();
  const futureDistance = futureVector.Length();
  const distanceSpeed = futureDistance - distance;
  const houseOffset = wrapDegrees(longitude - houseAnchor);
  const house = Math.floor(houseOffset / 30) + 1;

  return {
    id: body.id,
    name: body.name,
    longitude,
    latitude,
    distance,
    longitudeSpeed,
    latitudeSpeed,
    distanceSpeed,
    house: Number.isFinite(house) ? ((house - 1) % 12) + 1 : undefined,
    retrograde: longitudeSpeed < 0,
  };
};

const applyAyanamsa = (value: number, offset: number, zodiac: "tropical" | "sidereal") =>
  zodiac === "sidereal" ? wrapDegrees(value - offset) : wrapDegrees(value);

export class AstronomyEngineEphemerisProvider implements EphemerisProvider {
  async getPositions(
    birth: DateTime,
    coordinates: { latitude: number; longitude: number },
    options: EphemerisOptions,
  ): Promise<EphemerisResponse> {
    const utc = birth.toUTC();
    if (!utc.isValid) {
      throw new Error("Astronomy Engine requires a valid Luxon DateTime instance.");
    }

    const latitude = Number.isFinite(coordinates.latitude) ? coordinates.latitude : 0;
    const longitude = Number.isFinite(coordinates.longitude) ? coordinates.longitude : 0;
    const time = MakeTime(utc.toJSDate());

    const { ascendant, midheaven } = computeAscMc(time, latitude, longitude);
    const houses = Array.from({ length: 12 }, (_, index) => ({
      index: index + 1,
      cusp: wrapDegrees(ascendant + index * 30),
      speed: 0,
    }));
    const bodies = planetCatalog.map((planet) => computeBody(planet, time, ascendant));
    bodies.push(computeMeanNode(time));

    const ayanamsaOffset =
      options.zodiac === "sidereal"
        ? resolveAyanamsaOffset(options.ayanamsa, utc)
        : 0;

    const adjustedBodies = bodies.map((body) => ({
      ...body,
      longitude: applyAyanamsa(body.longitude, ayanamsaOffset, options.zodiac),
      house: body.house,
    }));

    const adjustedHouses = houses.map((house) => ({
      ...house,
      cusp: applyAyanamsa(house.cusp, ayanamsaOffset, options.zodiac),
    }));

    const angles = [
      { id: "asc", longitude: applyAyanamsa(ascendant, ayanamsaOffset, options.zodiac), speed: 0 },
      { id: "mc", longitude: applyAyanamsa(midheaven, ayanamsaOffset, options.zodiac), speed: 0 },
      {
        id: "dc",
        longitude: applyAyanamsa(wrapDegrees(ascendant + 180), ayanamsaOffset, options.zodiac),
        speed: 0,
      },
      {
        id: "ic",
        longitude: applyAyanamsa(wrapDegrees(midheaven + 180), ayanamsaOffset, options.zodiac),
        speed: 0,
      },
    ];

    return {
      bodies: adjustedBodies,
      houses: adjustedHouses,
      angles,
      metadata: {
        provider: "astronomy-engine",
        version: ASTRONOMY_ENGINE_VERSION,
        engine: "astronomy-engine",
        options: {
          zodiac: options.zodiac,
          ayanamsa: options.ayanamsa,
          houseSystem: options.houseSystem ?? "Equal",
        },
        timestamp: utc.toISO() ?? new Date().toISOString(),
        location: { latitude, longitude },
        flags: 0,
      },
    };
  }
}
const ASTRONOMY_ENGINE_VERSION = "2.1.19";
