"use client";

import { useState } from "react";
import EnquiryModal from "@/components/enquiry-modal";

/**
 * "Book a viewing" trigger. Opens the enquiry form in a dialog rather than
 * handing the visitor off to WhatsApp.
 */
export default function BookViewing({ car, className = "btn btn-line", label = "Book a viewing", children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
        {label}
      </button>
      <EnquiryModal open={open} onClose={() => setOpen(false)} car={car} source="car-detail" />
    </>
  );
}
