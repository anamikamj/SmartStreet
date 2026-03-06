import { supabase } from "./supabaseClient";

export async function getOffenders() {
  const { data } = await supabase.from("offenders").select("*");
  return data || [];
}

export async function getAbductionCases() {
  const { data } = await supabase.from("abduction_cases").select("*");
  return data || [];
}

export async function getCrimeReports() {
  const { data } = await supabase.from("crime_reports").select("*");
  return data || [];
}

export async function getUnsafeZones() {
  const { data } = await supabase.from("unsafe_zones").select("*");
  return data || [];
}