import { DateTime } from "luxon";

const sumDigits = (value: number): number =>
  value
    .toString()
    .split("")
    .filter((char) => /\d/.test(char))
    .reduce((total, digit) => total + Number(digit), 0);

const reduceToSingleDigit = (value: number): number => {
  let current = value;
  while (current > 9) {
    current = sumDigits(current);
  }
  return current;
};

export const computeLifePath = (isoDate: string) => {
  const date = DateTime.fromISO(isoDate, { zone: "utc" });
  if (!date.isValid) {
    throw new Error("Invalid ISO date for numerology calculation");
  }
  const dayReduced = reduceToSingleDigit(date.day);
  const monthReduced = reduceToSingleDigit(date.month);
  const yearReduced = reduceToSingleDigit(sumDigits(date.year));

  const compound = dayReduced + monthReduced + yearReduced;
  const reduced = reduceToSingleDigit(compound);

  return {
    compound,
    reduced,
    display: `${compound}/${reduced}`,
  };
};

export const computeBirthNumber = (isoDate: string) => {
  const date = DateTime.fromISO(isoDate, { zone: "utc" });
  if (!date.isValid) {
    throw new Error("Invalid ISO date for numerology calculation");
  }
  const compound = date.day;
  const reduced = reduceToSingleDigit(compound);
  return {
    compound,
    reduced,
    display: `${compound}/${reduced}`,
  };
};

const letterMapPythagorean: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

const letterMapChaldean: Record<string, number> = {
  A: 1,
  I: 1,
  J: 1,
  Q: 1,
  Y: 1,
  B: 2,
  K: 2,
  R: 2,
  C: 3,
  G: 3,
  L: 3,
  S: 3,
  D: 4,
  M: 4,
  T: 4,
  E: 5,
  H: 5,
  N: 5,
  X: 5,
  U: 6,
  V: 6,
  W: 6,
  O: 7,
  Z: 7,
  F: 8,
  P: 8,
};

const sumName = (name: string, map: Record<string, number>) =>
  name
    .toUpperCase()
    .split("")
    .map((char) => map[char] ?? 0)
    .reduce((acc, value) => acc + value, 0);

export const computeNameNumber = (name: string, system: "pythagorean" | "chaldean") => {
  const map = system === "pythagorean" ? letterMapPythagorean : letterMapChaldean;
  const total = sumName(name, map);
  return {
    compound: total,
    reduced: reduceToSingleDigit(total),
    display: `${total}/${reduceToSingleDigit(total)}`,
  };
};

export const numerologySummary = (isoDate: string, name: string) => ({
  lifePath: computeLifePath(isoDate),
  birthNumber: computeBirthNumber(isoDate),
  namePythagorean: computeNameNumber(name, "pythagorean"),
  nameChaldean: computeNameNumber(name, "chaldean"),
});
