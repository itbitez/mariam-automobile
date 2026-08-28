import carsRaw from "./data/cars.json";
import imgKeys from "./data/img-keys.json";
import { HOME, SETTINGS, CALC, HOME_LIMIT, PLACEHOLDER_IMG } from "./content";

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

export function carsForHome() {
  return CARS.filter((c) => c.showHome && c.status === "available").slice(0, HOME_LIMIT);
}

export function carsForListing() {
  return CARS.filter((c) => c.status !== "sold");
}

export function getCar(id) {
  return CARS.find((c) => c.id === id) || null;
}

export function similarCars(car, limit = 3) {
  return carsForListing()
    .filter((c) => c.id !== car.id)
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
