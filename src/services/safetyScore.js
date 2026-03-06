function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function filterNearby(items, userLocation, radius) {
  return items.filter(
    (item) =>
      getDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        item.latitude,
        item.longitude
      ) <= radius
  );
}

export function calculateSafetyScore(
  offenders,
  abductionCases,
  crimeReports,
  unsafeZones,
  userLocation
) {
  const RADIUS = 500; // 500m radius for personal safety context

  const nearby = {
    offenders: filterNearby(offenders, userLocation, RADIUS),
    abductions: filterNearby(abductionCases, userLocation, RADIUS),
    crimes: filterNearby(crimeReports, userLocation, RADIUS),
    unsafeZones: filterNearby(unsafeZones, userLocation, RADIUS),
  };

  let score =
    100 -
    nearby.offenders.length * 15 -
    nearby.abductions.length * 20 -
    nearby.crimes.length * 10 -
    nearby.unsafeZones.length * 12;

  if (score < 0) score = 0;

  let level = "Safe Area";
  let color = "green";
  let advice = "This area appears safe. Stay alert.";

  if (score < 80 && score >= 60) {
    level = "Low Risk";
    color = "yellowgreen";
    advice = "Some concerns nearby. Stay in well-lit areas.";
  }
  if (score < 60 && score >= 40) {
    level = "Moderate Risk";
    color = "orange";
    advice = "Avoid isolated areas. Share your location with someone.";
  }
  if (score < 40 && score >= 20) {
    level = "High Risk";
    color = "orangered";
    advice = "This area has a history of crimes. Avoid if possible.";
  }
  if (score < 20) {
    level = "Dangerous";
    color = "red";
    advice = "Serious threat history. Do not travel alone. Call for help if needed.";
  }

  return {
    score,
    level,
    color,
    advice,
    counts: {
      offenders: nearby.offenders.length,
      abductions: nearby.abductions.length,
      crimes: nearby.crimes.length,
      unsafeZones: nearby.unsafeZones.length,
    },
  };
}