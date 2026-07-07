import { useState } from "react";
import JsonLd from "./JsonLd";
import Reveal from "./Reveal";
import { ChevronIcon } from "./icons";
import { faqSchema } from "../../lib/schema";

// אקורדיון שאלות נפוצות עם אנימציית פתיחה חלקה (grid-template-rows 0fr..1fr).
// מזריק במקביל סכמת FAQPage מאותו מקור נתונים.
export default function Faq({ items, title = "שאלות שאתן שואלות אותי" }) {
  const [open, setOpen] = useState(-1);
  if (!items || items.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="blog-section-title">{title}</h2>
      <div>
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal as="div" delay={i * 40} key={i} className="faq-item" data-open={isOpen}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span>{item.q}</span>
                <ChevronIcon />
              </button>
              <div className="faq-panel">
                <div className="faq-panel-inner">
                  <p className="faq-a">{item.a}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <JsonLd data={faqSchema(items)} />
    </section>
  );
}
