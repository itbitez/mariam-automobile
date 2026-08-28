// Full-colour wordmark on transparent background — used in the admin chrome.
export const LOGO = "/img/55037bb8a9fd1ecc.png";

export const SITE = {
  name: "Mariam Automobile",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  phone: "01944755111",
  whatsapp: "8801944755111",
  address: "Terokhadia, Rajshahi-6000, Bangladesh",
  hoursWeek: "9:00 AM – 8:00 PM",
  hoursFri: "2:00 PM – 8:00 PM",
  emergency: "Emergency 24/7 via WhatsApp",
  facebook: "https://www.facebook.com/mariamautomobile/",
};

export function telLink(number, settings) {
  const n = number || (settings && settings.phone) || SITE.phone;
  return "tel:" + String(n).replace(/[^0-9+]/g, "");
}

export function mapsLink(query, settings) {
  return "https://maps.google.com/?q=" + encodeURIComponent(query || "Terokhadia Rajshahi");
}

export function waLink(text, settings) {
  const wa = (settings && settings.whatsapp) || SITE.whatsapp;
  return (
    "https://wa.me/" + wa + "?text=" + encodeURIComponent(text || "Hi Mariam Automobile, I have a question about your cars.")
  );
}
