import carsRaw from "./data/cars.json";
import imgKeys from "./data/img-keys.json";
import { HOME, SETTINGS, CALC, HOME_LIMIT, PLACEHOLDER_IMG } from "./content";
import { byAvailability } from "./car-status";

export { HOME, SETTINGS, CALC, HOME_LIMIT, PLACEHOLDER_IMG };

export function resolvePhoto(key, label) {
  if (!key) return PLACEHOLDER_IMG;
  if (key.startsWith("/") || key.startsWith("http") || key.startsWith("data:")) return key;
  return imgKeys[key] || PLACEHOLDER_IMG;
}

const STATUS_DEFAULTS = {
  status: "available",
  showHome: true,
};

export const CARS = carsRaw.map((car) => ({
  ...car,
  featured: !!car.featured,
  photos: (car.photos || []).map((p) => resolvePhoto(p, car.model)),
  ...STATUS_DEFAULTS,
}));

// Mirrors getHomeCars/getListingCars in lib/query.js — sold and reserved cars
// stay visible and carry a badge rather than disappearing.
export function carsForHome() {
  return CARS.filter((c) => c.showHome).sort(byAvailability).slice(0, HOME_LIMIT);
}

export function carsForListing() {
  return [...CARS].sort(byAvailability);
}

export function getCar(id) {
  return CARS.find((c) => c.id === id) || null;
}

export function similarCars(car, limit = 3) {
  return carsForListing()
    // Never recommend a sold car to someone still shopping.
    .filter((c) => c.id !== car.id && c.status !== "sold")
    .sort((a, b) => {
      const sa =
        (a.body === car.body ? 2 : 0) +
        (a.brand === car.brand ? 1 : 0) -
        Math.abs(a.price - car.price) / 10000000;
      const sb =
        (b.body === car.body ? 2 : 0) +
        (b.brand === car.brand ? 1 : 0) -
        Math.abs(b.price - car.price) / 10000000;
      return sb - sa;
    })
    .slice(0, limit);
}
