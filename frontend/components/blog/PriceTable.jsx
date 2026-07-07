import { ServiceIcon, ClockIcon } from "./icons";
import Reveal from "./Reveal";

// מחירון בכרטיסים (בשפת כרטיסי השירותים של מערכת התורים), לא טבלת HTML יבשה.
export default function PriceTable({ items, title = "מחירון" }) {
  if (!items || items.length === 0) return null;
  return (
    <section className="my-12">
      <h2 className="blog-section-title">{title}</h2>
      <div className="price-grid">
        {items.map((row, i) => (
          <Reveal as="div" delay={i * 45} key={i} className="price-card">
            <span className="price-ico">
              <ServiceIcon service={row.service} />
            </span>
            <div className="price-main">
              <div className="price-name">{row.service}</div>
              {row.note ? <div className="price-note">{row.note}</div> : null}
            </div>
            <div className="price-side">
              <div className="price-amount">
                {typeof row.price === "number" ? `₪${row.price}` : row.price}
              </div>
              {row.duration ? (
                <span className="price-dur">
                  <ClockIcon />
                  {row.duration}
                </span>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
