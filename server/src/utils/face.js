// Face matching is done on the server so the client can't fake a match.
export const MATCH_THRESHOLD = 0.5; // lower = stricter; face-api.js commonly uses 0.6

export function isValidDescriptor(d) {
  return Array.isArray(d) && d.length === 128 && d.every((n) => typeof n === "number" && Number.isFinite(n));
}

export function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}
