// Atlas — approximate lat/lng for the demo wards in each sample city.
// Sourced from OpenStreetMap public coordinates. Phase 2 production replaces
// these with proper admin-boundary polygons keyed to each country's gazetteer.

export interface WardCoord {
  ward: string;
  lat: number;
  lng: number;
}

export const WARD_COORDS: Record<string, WardCoord[]> = {
  GH: [
    { ward: "Madina", lat: 5.6837, lng: -0.1681 },
    { ward: "East Legon", lat: 5.6411, lng: -0.157 },
    { ward: "Adabraka", lat: 5.5586, lng: -0.2076 },
    { ward: "Nima", lat: 5.585, lng: -0.198 },
    { ward: "Osu", lat: 5.5562, lng: -0.18 },
    { ward: "Achimota", lat: 5.6189, lng: -0.226 },
    { ward: "Tema West", lat: 5.668, lng: 0.013 },
    { ward: "Dansoman", lat: 5.5375, lng: -0.275 },
    { ward: "Tesano", lat: 5.5953, lng: -0.225 },
    { ward: "Lapaz", lat: 5.6011, lng: -0.243 },
  ],
  BD: [
    { ward: "Mirpur", lat: 23.8056, lng: 90.3686 },
    { ward: "Dhanmondi", lat: 23.7461, lng: 90.376 },
    { ward: "Gulshan", lat: 23.7925, lng: 90.4078 },
    { ward: "Mohammadpur", lat: 23.7651, lng: 90.357 },
    { ward: "Uttara", lat: 23.8729, lng: 90.397 },
    { ward: "Bashundhara", lat: 23.8175, lng: 90.428 },
    { ward: "Tejgaon", lat: 23.7641, lng: 90.394 },
    { ward: "Banani", lat: 23.7928, lng: 90.404 },
  ],
};

export const CITY_CENTER: Record<string, { lat: number; lng: number; zoom: number }> = {
  GH: { lat: 5.59, lng: -0.18, zoom: 11 },
  BD: { lat: 23.8, lng: 90.4, zoom: 11 },
};

export function getCoord(country: string, ward: string): WardCoord | undefined {
  return WARD_COORDS[country.toUpperCase()]?.find((w) => w.ward === ward);
}
