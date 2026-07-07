import { whatsappLink, site } from "../../lib/site";
import { WhatsappIcon } from "./icons";

// כפתור וואטסאפ ראשי — בשפת כפתור ההזמנה של האתר (פיל, גרדיאנט המותג, צל).
export function WhatsappButton({ label = "לקביעת תור בוואטסאפ", message, block = false }) {
  return (
    <a
      href={whatsappLink(message ?? "היי ליאור, אשמח לקבוע תור")}
      target="_blank"
      rel="noopener noreferrer"
      className={`blog-btn${block ? " blog-btn--block" : ""}`}
    >
      <WhatsappIcon />
      {label}
    </a>
  );
}

// כפתור וואטסאפ צף בפינה.
export function WhatsappFab() {
  return (
    <a
      href={whatsappLink("היי ליאור, הגעתי מהבלוג ואשמח לקבוע תור")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`שליחת וואטסאפ ל-${site.phoneDisplay}`}
      className="wa-fab"
    >
      <WhatsappIcon />
    </a>
  );
}
