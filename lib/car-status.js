/**
 * How a car's status is presented on the public site.
 *
 * Sold and reserved cars stay listed rather than vanishing. A customer who
 * bookmarked a car, or reached it from search, should be told it is gone —
 * disappearing stock reads as a broken site, and it hides the evidence that
 * cars here actually sell. The badge is what does the telling.
 *
 * `tag` is the pill drawn on a card photo (styled in app/globals.css) and
 * `badge` the chip in the detail page header row (app/cars/[id]/car.css). The
 * admin panel keeps its own labels in components/admin-client.jsx; these are
 * the customer-facing ones and they are deliberately separate, because what an
 * owner needs to read and what a buyer needs to read are not the same thing.
 */
export const CAR_STATUS = {
  available: { label: "Available", headline: "Available now", tag: "tag-avail", badge: "on" },
  reserved: { label: "Reserved", headline: "Reserved", tag: "tag-reserved", badge: "held" },
  sold: { label: "Sold", headline: "Sold", tag: "tag-sold", badge: "gone" },
};

/** Unknown or missing values read as available, matching the column default. */
export function carStatus(status) {
  return CAR_STATUS[status] || CAR_STATUS.available;
}

const RANK = { available: 0, reserved: 1, sold: 2 };

/**
 * Available first, then reserved, then sold — a car nobody can buy should not
 * outrank one they can. Array.prototype.sort is stable, so cars keep their
 * existing featured/year order within each group.
 */
export function byAvailability(a, b) {
  return (RANK[a?.status] ?? 0) - (RANK[b?.status] ?? 0);
}
