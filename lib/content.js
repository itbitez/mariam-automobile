export const PLACEHOLDER_IMG = "/img/placeholder.svg";
export const HOME_LIMIT = 6;

export const HOME = {
  hero: {
    kicker: "Rajshahi · Bangladesh",
    line1: "Japan Recondition",
    line2: "& New Cars",
    line3: "Sales Center",
    lede: "Hand-picked Japanese vehicles, auction-verified and fully inspected. Bank loan or cash — we handle import, registration and after-sales, start to finish.",
    cta1: "View Available Cars",
    cta2: "Ask on WhatsApp",
    assures: ["Auction sheet on request", "Bank loan support", "Warranty included"],
    leadTitle: "Get your price today",
    leadSub: "Tell us what you're after — we'll reply with options and full pricing.",
    stats: [
      { n: "500", suffix: "+", label: "Cars Sold" },
      { n: "10", suffix: "+", label: "Years Experience" },
      { n: "100", suffix: "%", label: "Satisfied Customers" },
      { n: "24", suffix: "/7", label: "Customer Support" },
    ],
  },
  trust: [
    "Auction-verified vehicles",
    "Bank loan facility",
    "Cash purchase discounts",
    "Warranty included",
    "Import & registration handled",
    "After-sales support",
    "Trade-in valuations",
    "Custom car sourcing",
  ],
  inventory: {
    kicker: "Available cars",
    title: "In stock right now",
    sub: "Every unit is hand-selected from Japanese auctions, thoroughly inspected, and delivered with warranty. Photos are of the actual vehicles.",
    noteTitle: "Looking for a specific model?",
    noteText:
      "Tell us the model, grade, year and budget — we source it directly from Japanese auctions and quote you the full landed cost before you commit.",
    noteBtn: "Request a custom order",
  },
  process: {
    kicker: "How it works",
    title: "From auction to your driveway",
    sub: "Four steps, no surprises. Scroll to take the drive — you'll know the cost, condition and timeline before any money moves.",
    steps: [
      {
        title: "Choose your car",
        text: "Pick from ready stock in Rajshahi, or tell us the exact model and grade to source from Japan.",
      },
      {
        title: "Verify the condition",
        text: "Review the auction sheet and inspection report, then see the car in person at our showroom.",
      },
      {
        title: "Choose how to pay",
        text: "Cash for a better price, or let us arrange bank financing with quick approval.",
      },
      {
        title: "Drive it home",
        text: "We handle registration and hand over the keys — with warranty and after-sales support.",
      },
    ],
  },
  faq: {
    kicker: "Questions, answered",
    title: "What buyers ask us most",
    note: "Still unsure about something? Send us a message and we'll answer honestly — even if the answer is \"this car isn't right for you.\"",
    noteBtn: "Ask us anything",
    items: [
      {
        q: "What exactly is a \"reconditioned\" car?",
        a: "It's a used vehicle imported from Japan, then prepared for sale here. Japanese cars are typically well-maintained with low mileage, so a reconditioned unit gives you near-new quality at a considerably lower price than a brand-new import.",
      },
      {
        q: "Can I see the auction sheet before buying?",
        a: "Yes. Ask us for the auction sheet and inspection details of any unit in stock. We'd rather you check the grade and condition report carefully than buy on trust alone.",
      },
      {
        q: "Do you help arrange a bank loan?",
        a: "We do. We work with all major banks in Bangladesh and can guide you through the paperwork and approval process. Use the estimator above for a rough monthly figure, then message us for a bank-confirmed quote.",
      },
      {
        q: "Is registration and paperwork included?",
        a: "We handle the import and registration process for you, so you receive a road-ready car. We'll walk you through every document and cost involved before you commit.",
      },
      {
        q: "What happens after I buy — is there a warranty?",
        a: "Every car comes with warranty coverage, plus after-sales support and maintenance. You can reach us on WhatsApp any time, including outside showroom hours.",
      },
      {
        q: "Can I trade in my current car?",
        a: "Yes. Send us photos and details of your current vehicle on WhatsApp and we'll give you a valuation, which can go straight towards your next car.",
      },
    ],
  },
  cta: {
    kicker: "Ready when you are",
    title: "Let's find the right car for you",
    text: "Visit the showroom in Terokhadia, or message us and we'll send options that match your budget today.",
    btn1: "Call 01944755111",
    btn2: "Get directions",
  },
  contact: {
    kicker: "Contact us",
    title: "Come in, or just message us",
    intro: "No pressure and no rush — tell us your budget and we'll show you what genuinely fits.",
    waTitle: "WhatsApp is the fastest way",
    waText: "Send a message and we'll reply with real options, real prices and the auction sheet.",
    helpItems: [
      "Car availability and pricing",
      "Bank loan and financing options",
      "Import and registration process",
      "Trade-in valuations",
      "Inspection and warranty details",
    ],
  },
  // Each of these names something a buyer can hold us to. Vague reassurance —
  // "complete transparency", "100% satisfaction guarantee" — reads as filler
  // and gives them nothing to check.
  pillars: [
    {
      title: "You see the auction sheet",
      text: "The original Japanese grading sheet for any car, on request, before you pay anything. Grade, verified mileage and every scratch the inspector noted.",
    },
    {
      title: "Loans arranged here",
      text: "We prepare the file for banks we already work with, so you deal with us rather than a queue. Most approvals come back inside a week.",
    },
    {
      title: "One landed price",
      text: "Duty, registration and our margin quoted as a single figure. Nothing turns up later that we did not tell you about first.",
    },
    {
      title: "We are here afterwards",
      text: "Warranty on the car, servicing at our own workshop, and a number that a person actually answers when something needs sorting.",
    },
  ],
  why: {
    kicker: "Why choose Mariam Automobile",
    title: "Built on trust, not pressure",
    sub: "Most of our sales come from someone who bought here before, or was sent by someone who did. That only holds if the car is exactly what we said it was.",
  },
};

/**
 * Finance estimator configuration. Every slider bound, step and starting value
 * is editable from Admin → Calculator so the showroom can match whatever the
 * banks are actually offering.
 */
export const CALC = {
  priceMin: 1000000,
  priceMax: 6000000,
  priceStep: 50000,
  priceDefault: 3000000,

  downMin: 20,
  downMax: 70,
  downStep: 5,
  downDefault: 40,

  termMin: 1,
  termMax: 7,
  termStep: 1,
  termDefault: 5,

  rateMin: 7,
  rateMax: 16,
  rateStep: 0.5,
  rateDefault: 11,

  // Car detail pages use a single fixed rate rather than a rate slider.
  showRateSlider: true,
  carPageRate: 11,

  heading: "Monthly instalment estimator",
  intro:
    "Move the sliders to see roughly what your monthly payment could look like. Then message us for an exact, bank-confirmed quote.",
  disclaimer: "Indicative estimate only. Final rates, fees and eligibility are set by your bank.",
};

export const SETTINGS = {
  phone: "01944755111",
  whatsapp: "8801944755111",
  address: "Terokhadia, Rajshahi-6000, Bangladesh",
  hoursWeek: "9:00 AM – 8:00 PM",
  hoursFri: "2:00 PM – 8:00 PM",
  emergency: "Emergency 24/7 via WhatsApp",
};
