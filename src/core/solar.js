const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function dayOfYear(year, month, day) {
  const start = Date.UTC(year, 0, 0);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86400000);
}

function calculateUtcHour({ year, month, day, latitude, longitude, sunrise }) {
  const n = dayOfYear(year, month, day);
  const lngHour = longitude / 15;
  const t = sunrise ? n + ((6 - lngHour) / 24) : n + ((18 - lngHour) / 24);
  const m = (0.9856 * t) - 3.289;
  let l = m + (1.916 * Math.sin(m * RAD)) + (0.020 * Math.sin(2 * m * RAD)) + 282.634;
  l = normalizeDegrees(l);

  let ra = DEG * Math.atan(0.91764 * Math.tan(l * RAD));
  ra = normalizeDegrees(ra);
  const lQuadrant = Math.floor(l / 90) * 90;
  const raQuadrant = Math.floor(ra / 90) * 90;
  ra = (ra + (lQuadrant - raQuadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(l * RAD);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(90.833 * RAD) - (sinDec * Math.sin(latitude * RAD))) /
    (cosDec * Math.cos(latitude * RAD));

  if (cosH > 1 || cosH < -1) return null;

  let h = sunrise ? 360 - (DEG * Math.acos(cosH)) : DEG * Math.acos(cosH);
  h /= 15;
  const localMeanTime = h + ra - (0.06571 * t) - 6.622;
  return normalizeDegrees((localMeanTime - lngHour) * 15) / 15;
}

export function calculateSunTimes(dateKey, latitude, longitude) {
  const match = String(dateKey).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { sunrise: null, sunset: null };
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);

  const toIso = (hour) => {
    if (hour == null) return null;
    const milliseconds = Date.UTC(year, month - 1, day) + Math.round(hour * 3600000);
    return new Date(milliseconds).toISOString();
  };

  return {
    sunrise: toIso(calculateUtcHour({ year, month, day, latitude, longitude, sunrise: true })),
    sunset: toIso(calculateUtcHour({ year, month, day, latitude, longitude, sunrise: false })),
  };
}
