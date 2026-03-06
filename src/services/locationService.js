import { supabase } from "./supabaseClient";

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject
    );
  });
}

// Create a new journey and return its ID
export async function startJourney(userLat, userLng) {
  const { data, error } = await supabase
    .from("journeys")
    .insert([{ start_lat: userLat, start_lng: userLng, status: "active" }])
    .select()
    .single();

  if (error) throw error;
  return data.id; // journey ID to share
}

// Save a location ping to the journey
export async function saveLocationPing(journeyId, lat, lng) {
  await supabase.from("journey_locations").insert([{
    journey_id: journeyId,
    latitude: lat,
    longitude: lng,
  }]);
}

// End the journey
export async function endJourney(journeyId) {
  await supabase
    .from("journeys")
    .update({ status: "ended", end_time: new Date().toISOString() })
    .eq("id", journeyId);
}

// Fetch all location pings for a journey (for trusted contact view)
export async function getJourneyLocations(journeyId) {
  const { data } = await supabase
    .from("journey_locations")
    .select("*")
    .eq("journey_id", journeyId)
    .order("recorded_at", { ascending: true });
  return data || [];
}