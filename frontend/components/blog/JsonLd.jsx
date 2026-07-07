// רכיב עזר להזרקת Structured Data (JSON-LD). התוכן נשלט על ידינו ולכן בטוח.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
